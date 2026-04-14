import { addDays, format } from "date-fns";

import { resolveNearbyAirports } from "@/lib/flights/airports";
import { getMarketLabel, MARKET_COMPARE_ORDER } from "@/lib/flights/markets";
import {
  buildFlexibleDateMatrix,
  buildGoogleFlightsUrl
} from "@/lib/flights/mock-data";
import { mockProviders, skyscannerProvider } from "@/lib/flights/providers";
import type { NormalizedOffer } from "@/lib/flights/providers/types";
import { finalizeItineraries, type AggregatedItineraryDraft } from "@/lib/flights/scoring";
import type {
  RegionalComparison,
  SearchRequest
} from "@/lib/flights/types";

function buildDefaultDate(offsetDays: number) {
  return format(addDays(new Date(), offsetDays), "yyyy-MM-dd");
}

export const DEFAULT_SEARCH_REQUEST: SearchRequest = {
  origin: "NYC",
  destination: "LON",
  departDate: buildDefaultDate(28),
  returnDate: buildDefaultDate(35),
  tripType: "roundTrip",
  passengers: 1,
  cabin: "economy",
  nearbyAirports: true,
  mixAndMatchEnabled: true,
  regionalMarket: "US",
  displayCurrency: "USD"
};

function aggregateOffers(request: SearchRequest, offers: NormalizedOffer[]) {
  const grouped = new Map<string, AggregatedItineraryDraft>();

  for (const offer of offers) {
    const existing = grouped.get(offer.fingerprint);

    if (existing) {
      existing.bookingOptions.push(offer.bookingOption);
      continue;
    }

    grouped.set(offer.fingerprint, {
      id: offer.id,
      fingerprint: offer.fingerprint,
      tripType: request.tripType,
      origin: offer.origin,
      destination: offer.destination,
      outbound: offer.outbound,
      inbound: offer.inbound,
      airlineDisplay: offer.airlineDisplay,
      overnight: offer.overnight,
      selfTransfer: offer.selfTransfer,
      mixAndMatch: offer.mixAndMatch,
      flexibilityBias: offer.flexibilityBias,
      bookingOptions: [offer.bookingOption]
    });
  }

  return finalizeItineraries([...grouped.values()]);
}

async function searchWithMockProviders(
  request: SearchRequest,
  originOptions: string[],
  destinationOptions: string[]
) {
  const providerResults = await Promise.all(
    mockProviders.map((provider) =>
      provider.search({
        request,
        originOptions,
        destinationOptions
      })
    )
  );

  return providerResults.flat();
}

function normalizeRequest(request: SearchRequest) {
  const primaryOrigin = resolveNearbyAirports(request.origin)[0] ?? request.origin.toUpperCase();
  const primaryDestination =
    resolveNearbyAirports(request.destination)[0] ?? request.destination.toUpperCase();
  const normalizedRequest: SearchRequest = {
    ...request,
    origin: primaryOrigin,
    destination: primaryDestination
  };
  const originOptions = request.nearbyAirports
    ? resolveNearbyAirports(request.origin)
    : [primaryOrigin];
  const destinationOptions = request.nearbyAirports
    ? resolveNearbyAirports(request.destination)
    : [primaryDestination];

  return {
    normalizedRequest,
    originOptions,
    destinationOptions
  };
}

async function buildRegionalComparisons(
  request: SearchRequest,
  selectedTotal: number,
  mode: "live" | "mock",
  originOptions: string[],
  destinationOptions: string[]
) {
  const comparisons = await Promise.all(
    MARKET_COMPARE_ORDER.map(async (market) => {
      if (market === request.regionalMarket) {
        return {
          market,
          label: getMarketLabel(market),
          currency: request.displayCurrency,
          totalPrice: selectedTotal,
          deltaVsSelected: 0,
          isSelected: true,
          status: "available",
          note: "Current point of sale"
        } satisfies RegionalComparison;
      }

      try {
        const totalPrice =
          mode === "live" && skyscannerProvider.isConfigured()
            ? await skyscannerProvider.searchCheapestTotalByMarket(request, market)
            : (() => undefined)();

        if (typeof totalPrice === "number") {
          return {
            market,
            label: getMarketLabel(market),
            currency: request.displayCurrency,
            totalPrice,
            deltaVsSelected: totalPrice - selectedTotal,
            isSelected: false,
            status: "available",
            note: undefined
          } satisfies RegionalComparison;
        }
      } catch (error) {
        console.error(`Regional comparison failed for market ${market}.`, error);
      }

      if (mode === "mock") {
        const comparisonRequest: SearchRequest = {
          ...request,
          regionalMarket: market
        };
        const mockOffers = await searchWithMockProviders(
          comparisonRequest,
          originOptions,
          destinationOptions
        );
        const itineraries = aggregateOffers(comparisonRequest, mockOffers);
        const mockTotal = itineraries[0]?.cheapestTotal;

        if (typeof mockTotal === "number") {
          return {
            market,
            label: getMarketLabel(market),
            currency: request.displayCurrency,
            totalPrice: mockTotal,
            deltaVsSelected: mockTotal - selectedTotal,
            isSelected: false,
            status: "available",
            note: "Modeled from mock provider data"
          } satisfies RegionalComparison;
        }
      }

      return {
        market,
        label: getMarketLabel(market),
        currency: request.displayCurrency,
        isSelected: false,
        status: "unavailable",
        note:
          mode === "live"
            ? "No comparable live fare returned for this market."
            : "No comparable fare returned."
      } satisfies RegionalComparison;
    })
  );

  return comparisons;
}

export async function searchFlights(request: SearchRequest) {
  const { normalizedRequest, originOptions, destinationOptions } = normalizeRequest(request);
  let offers: NormalizedOffer[] = [];
  let sourceMode: "live" | "mock" = "mock";
  let providersQueried = mockProviders.map((provider) => provider.displayName);
  let disclaimer =
    "This MVP uses deterministic mock provider data while keeping the provider layer ready for real airline or partner feeds.";

  if (skyscannerProvider.isConfigured()) {
    try {
      offers = await skyscannerProvider.search({
        request: normalizedRequest,
        originOptions,
        destinationOptions
      });

      if (offers.length > 0) {
        sourceMode = "live";
        providersQueried = [skyscannerProvider.displayName];
        disclaimer =
          "Live fares are sourced through Skyscanner Flights Live Prices. Point-of-sale differences can be real, but they can also depend on supplier billing country, residency rules, taxes, or payment acceptance.";
      }
    } catch (error) {
      console.error("Skyscanner live search failed, falling back to mock providers.", error);
    }
  }

  if (offers.length === 0) {
    offers = await searchWithMockProviders(
      normalizedRequest,
      originOptions,
      destinationOptions
    );
  }

  const itineraries = aggregateOffers(normalizedRequest, offers);
  const selectedCheapestTotal = itineraries[0]?.cheapestTotal ?? 0;
  const regionalComparisons =
    selectedCheapestTotal > 0
      ? await buildRegionalComparisons(
          normalizedRequest,
          selectedCheapestTotal,
          sourceMode,
          originOptions,
          destinationOptions
        )
      : [];

  return {
    request: normalizedRequest,
    itineraries,
    flexibleDates: buildFlexibleDateMatrix(normalizedRequest),
    nearbyAirportsUsed: {
      origins: originOptions,
      destinations: destinationOptions
    },
    meta: {
      providersQueried,
      generatedAt: new Date().toISOString(),
      liveGoogleFlightsUrl: buildGoogleFlightsUrl(normalizedRequest),
      disclaimer,
      sourceMode,
      regionalComparisons,
      regionalPricingNote:
        sourceMode === "live"
          ? "This is a point-of-sale comparison. A lower price in another market does not guarantee a VPN alone will reproduce it, because supplier and payment rules can still differ."
          : "Regional deltas are modeled until a live Skyscanner key is configured."
    }
  };
}
