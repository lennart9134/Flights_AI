import { getSkyscannerMarketConfig } from "@/lib/flights/markets";
import type {
  FlightSearchProvider,
  NormalizedOffer,
  ProviderContext
} from "@/lib/flights/providers/types";
import type {
  BookingOption,
  FareRules,
  Market,
  SearchRequest,
  Segment
} from "@/lib/flights/types";

interface SkyscannerDateTime {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
}

interface SkyscannerPrice {
  amount?: string | number | null;
}

interface SkyscannerBagAllowance {
  assessment?: string;
  pieces?: number;
  fee?: SkyscannerPrice | null;
}

interface SkyscannerPricingFare {
  cabinBaggage?: SkyscannerBagAllowance | null;
  checkedBaggage?: SkyscannerBagAllowance | null;
  advanceChange?: {
    assessment?: string;
  } | null;
  cancellation?: {
    assessment?: string;
  } | null;
  seatPreReservation?: {
    assessment?: string;
  } | null;
  brandNames?: string[];
}

interface SkyscannerPricingItem {
  agentId?: string;
  deepLink?: string;
  price?: SkyscannerPrice | null;
}

interface SkyscannerPricingOption {
  id?: string;
  price?: SkyscannerPrice | null;
  agentIds?: string[];
  items?: SkyscannerPricingItem[];
  transferType?: string;
  pricingOptionFare?: SkyscannerPricingFare | null;
}

interface SkyscannerItinerary {
  pricingOptions?: SkyscannerPricingOption[];
  legIds?: string[];
}

interface SkyscannerLeg {
  originPlaceId?: string;
  destinationPlaceId?: string;
  departureDateTime?: SkyscannerDateTime;
  arrivalDateTime?: SkyscannerDateTime;
  durationInMinutes?: number;
  stopCount?: number;
  segmentIds?: string[];
}

interface SkyscannerSegment {
  originPlaceId?: string;
  destinationPlaceId?: string;
  departureDateTime?: SkyscannerDateTime;
  arrivalDateTime?: SkyscannerDateTime;
  durationInMinutes?: number;
  marketingFlightNumber?: string;
  marketingCarrierId?: string;
  operatingCarrierId?: string;
}

interface SkyscannerPlace {
  name?: string;
  iata?: string;
}

interface SkyscannerCarrier {
  name?: string;
  displayCode?: string;
  iata?: string;
}

interface SkyscannerAgent {
  name?: string;
  type?: string;
  rating?: number;
}

interface SkyscannerResults {
  itineraries?: Record<string, SkyscannerItinerary>;
  legs?: Record<string, SkyscannerLeg>;
  segments?: Record<string, SkyscannerSegment>;
  places?: Record<string, SkyscannerPlace>;
  carriers?: Record<string, SkyscannerCarrier>;
  agents?: Record<string, SkyscannerAgent>;
}

interface SkyscannerSearchResponse {
  sessionToken?: string;
  status?: string;
  content?: {
    results?: SkyscannerResults;
  };
}

function toNumber(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function toIsoString(dateTime?: SkyscannerDateTime) {
  if (!dateTime?.year || !dateTime.month || !dateTime.day) {
    return new Date().toISOString();
  }

  return new Date(
    Date.UTC(
      dateTime.year,
      Math.max(0, dateTime.month - 1),
      dateTime.day,
      dateTime.hour ?? 0,
      dateTime.minute ?? 0,
      dateTime.second ?? 0
    )
  ).toISOString();
}

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function includesFree(assessment?: string) {
  return assessment?.includes("INCLUDED") || assessment?.includes("FREE") || false;
}

function includesFee(assessment?: string) {
  return assessment?.includes("CHARGEABLE") || assessment?.includes("FEE") || false;
}

function bagFeeEstimate(
  allowance: SkyscannerBagAllowance | null | undefined,
  fallbackAmount: number
) {
  if (!allowance) {
    return fallbackAmount;
  }

  if ((allowance.pieces ?? 0) > 0 || includesFree(allowance.assessment)) {
    return 0;
  }

  const fee = toNumber(allowance.fee?.amount);
  return fee > 0 ? fee : fallbackAmount;
}

function buildFareRules(pricingFare?: SkyscannerPricingFare | null): FareRules {
  const carryOnIncluded =
    includesFree(pricingFare?.cabinBaggage?.assessment) ||
    (pricingFare?.cabinBaggage?.pieces ?? 0) > 0;
  const checkedBagIncluded =
    includesFree(pricingFare?.checkedBaggage?.assessment) ||
    (pricingFare?.checkedBaggage?.pieces ?? 0) > 0;

  return {
    carryOnIncluded,
    checkedBagIncluded,
    changeability: includesFree(pricingFare?.advanceChange?.assessment)
      ? "freeChanges"
      : includesFee(pricingFare?.advanceChange?.assessment)
        ? "changeFee"
        : "nonrefundable",
    refundability: includesFree(pricingFare?.cancellation?.assessment)
      ? "cash"
      : includesFee(pricingFare?.cancellation?.assessment)
        ? "credit"
        : "none",
    seatSelection: includesFree(pricingFare?.seatPreReservation?.assessment)
      ? "included"
      : "paid"
  };
}

function buildRestrictions(
  fareRules: FareRules,
  providerKind: BookingOption["providerKind"],
  selfTransfer: boolean
) {
  const restrictions = [
    fareRules.changeability === "freeChanges"
      ? "Changes included"
      : fareRules.changeability === "changeFee"
        ? "Changes allowed with fee"
        : "Changes restricted",
    fareRules.refundability === "cash"
      ? "Refundable"
      : fareRules.refundability === "credit"
        ? "Credit only"
        : "Non-refundable"
  ];

  if (!fareRules.checkedBagIncluded) {
    restrictions.push("Checked bag may be extra");
  }

  if (providerKind === "ota") {
    restrictions.push("After-sales support handled by booking agent");
  }

  if (selfTransfer) {
    restrictions.push("Separate-ticket protection may be limited");
  }

  return restrictions;
}

function buildNotes(
  fareRules: FareRules,
  providerKind: BookingOption["providerKind"],
  selfTransfer: boolean
) {
  const notes: string[] = [];

  if (!fareRules.checkedBagIncluded) {
    notes.push("Total price includes a checked-bag estimate where the fare rules do not clearly include one.");
  }

  if (providerKind === "ota") {
    notes.push("Bookability and support are handled through a third-party agent.");
  }

  if (selfTransfer) {
    notes.push("Virtual interline or self-transfer style options can carry extra disruption risk.");
  }

  return notes;
}

function providerKindForAgent(agent?: SkyscannerAgent): BookingOption["providerKind"] {
  return agent?.type?.includes("AIRLINE") ? "airline" : "ota";
}

function supportScoreForAgent(
  agent?: SkyscannerAgent,
  providerKind?: BookingOption["providerKind"]
) {
  if (typeof agent?.rating === "number" && Number.isFinite(agent.rating)) {
    return Math.round(45 + agent.rating * 10);
  }

  return providerKind === "airline" ? 84 : 61;
}

function carrierName(
  carriers: Record<string, SkyscannerCarrier>,
  carrierId: string | undefined
) {
  const carrier = carrierId ? carriers[carrierId] : undefined;
  return carrier?.name ?? carrier?.displayCode ?? carrier?.iata ?? "Airline";
}

function buildSegments(leg: SkyscannerLeg | undefined, results: SkyscannerResults) {
  const segments = (leg?.segmentIds ?? [])
    .map((segmentId) => {
      const segment = results.segments?.[segmentId];

      if (!segment) {
        return null;
      }

      const fromPlace = segment.originPlaceId
        ? results.places?.[segment.originPlaceId]
        : undefined;
      const toPlace = segment.destinationPlaceId
        ? results.places?.[segment.destinationPlaceId]
        : undefined;
      const displayCode = segment.marketingCarrierId
        ? results.carriers?.[segment.marketingCarrierId]?.displayCode ??
          results.carriers?.[segment.marketingCarrierId]?.iata ??
          ""
        : "";

      return {
        from: fromPlace?.iata ?? leg?.originPlaceId ?? "UNK",
        to: toPlace?.iata ?? leg?.destinationPlaceId ?? "UNK",
        departureTime: toIsoString(segment.departureDateTime),
        arrivalTime: toIsoString(segment.arrivalDateTime),
        carrier: carrierName(results.carriers ?? {}, segment.marketingCarrierId),
        flightNumber: `${displayCode}${segment.marketingFlightNumber ?? ""}`,
        durationMinutes: segment.durationInMinutes ?? 0,
        stopCount: 0,
        operatingCarrier: carrierName(results.carriers ?? {}, segment.operatingCarrierId)
      } satisfies Segment;
    })
    .filter((segment): segment is NonNullable<typeof segment> => Boolean(segment));

  return segments;
}

function routeFingerprint(outbound: Segment[], inbound?: Segment[]) {
  const outboundKey = outbound
    .map((segment) => `${segment.from}-${segment.to}-${segment.departureTime}`)
    .join("|");
  const inboundKey = inbound
    ?.map((segment) => `${segment.from}-${segment.to}-${segment.departureTime}`)
    .join("|");

  return `${outboundKey}::${inboundKey ?? "one-way"}`;
}

function itineraryOvernight(outbound: Segment[], inbound?: Segment[]) {
  const firstDeparture = outbound[0]?.departureTime;
  const finalArrival = (inbound ?? outbound).at(-1)?.arrivalTime;

  if (!firstDeparture || !finalArrival) {
    return false;
  }

  return new Date(finalArrival).getTime() - new Date(firstDeparture).getTime() > 1000 * 60 * 60 * 18;
}

function transferIsSelf(transferType?: string) {
  return (
    transferType?.includes("SELF") ||
    transferType?.includes("VIRTUAL") ||
    transferType?.includes("INTERLINE") ||
    false
  );
}

function airlineDisplay(outbound: Segment[], inbound?: Segment[]) {
  return [...new Set([...outbound, ...(inbound ?? [])].map((segment) => segment.carrier))].join(
    " + "
  );
}

function parseSearchResults(request: SearchRequest, results: SkyscannerResults | undefined) {
  if (!results?.itineraries) {
    return [];
  }

  const offers: NormalizedOffer[] = [];

  for (const [itineraryId, itinerary] of Object.entries(results.itineraries)) {
    const outboundLeg = itinerary.legIds?.[0] ? results.legs?.[itinerary.legIds[0]] : undefined;
    const inboundLeg = itinerary.legIds?.[1] ? results.legs?.[itinerary.legIds[1]] : undefined;
    const outbound = buildSegments(outboundLeg, results);
    const inbound = inboundLeg ? buildSegments(inboundLeg, results) : undefined;

    if (outbound.length === 0) {
      continue;
    }

    const fingerprint = routeFingerprint(outbound, inbound);
    const display = airlineDisplay(outbound, inbound);

    for (const pricingOption of itinerary.pricingOptions ?? []) {
      const items = pricingOption.items?.length
        ? pricingOption.items
        : [
            {
              agentId: pricingOption.agentIds?.[0],
              deepLink: undefined,
              price: pricingOption.price ?? undefined
            }
          ];

      for (const item of items) {
        const agent = item.agentId ? results.agents?.[item.agentId] : undefined;
        const providerKind = providerKindForAgent(agent);
        const fareRules = buildFareRules(pricingOption.pricingOptionFare);
        const baggageFeeEstimate = bagFeeEstimate(
          pricingOption.pricingOptionFare?.checkedBaggage,
          request.tripType === "roundTrip" ? 90 : 45
        );
        const totalPrice = Math.round(toNumber(item.price?.amount ?? pricingOption.price?.amount));

        if (totalPrice <= 0) {
          continue;
        }

        const paymentFees = 0;
        const baseFare = Math.max(0, totalPrice - baggageFeeEstimate - paymentFees);
        const selfTransfer = transferIsSelf(pricingOption.transferType);

        offers.push({
          id: `${itineraryId}-${pricingOption.id ?? item.agentId ?? "option"}`,
          fingerprint,
          origin: outbound[0].from,
          destination: outbound.at(-1)?.to ?? outbound[0].to,
          outbound,
          inbound,
          airlineDisplay: display,
          overnight: itineraryOvernight(outbound, inbound),
          selfTransfer,
          mixAndMatch: selfTransfer,
          flexibilityBias: providerKind === "airline" ? 6 : 0,
          bookingOption: {
            providerId: item.agentId ?? pricingOption.id ?? itineraryId,
            providerName: agent?.name ?? "Booking partner",
            providerKind,
            pointOfSale: request.regionalMarket,
            currency: request.displayCurrency,
            baseFare,
            taxes: 0,
            baggageFeeEstimate,
            paymentFees,
            totalPrice,
            fareRules,
            restrictions: buildRestrictions(fareRules, providerKind, selfTransfer),
            notes: buildNotes(fareRules, providerKind, selfTransfer),
            supportScore: supportScoreForAgent(agent, providerKind),
            directBooking: providerKind === "airline",
            deepLink: item.deepLink ?? "#"
          }
        });
      }
    }
  }

  return offers;
}

export class SkyscannerLivePricesProvider implements FlightSearchProvider {
  id = "skyscanner-live-prices";
  displayName = "Skyscanner Flights Live Prices";
  kind = "ota" as const;

  constructor(
    private readonly apiKey = process.env.SKYSCANNER_API_KEY,
    private readonly baseUrl =
      process.env.SKYSCANNER_API_BASE_URL ??
      "https://partners.api.skyscanner.net/apiservices/v3/flights/live"
  ) {}

  isConfigured() {
    return Boolean(this.apiKey);
  }

  async search(context: ProviderContext): Promise<NormalizedOffer[]> {
    if (!this.apiKey) {
      throw new Error("Skyscanner API key not configured.");
    }

    const destinationCandidates = context.request.nearbyAirports
      ? context.destinationOptions
      : [context.request.destination];

    const searches = await Promise.all(
      destinationCandidates.map((destination) =>
        this.searchSingleRoute({
          ...context.request,
          destination
        })
      )
    );

    return searches.flat();
  }

  async searchCheapestTotalByMarket(
    request: SearchRequest,
    market: Market
  ): Promise<number | undefined> {
    if (!this.apiKey) {
      return undefined;
    }

    const offers = await this.searchSingleRoute(
      {
        ...request,
        regionalMarket: market
      },
      {
        maxPollAttempts: 2,
        pollDelayMs: 300
      }
    );

    const totals = offers
      .map((offer) => offer.bookingOption.totalPrice)
      .filter((totalPrice) => totalPrice > 0);

    return totals.length > 0 ? Math.min(...totals) : undefined;
  }

  private async searchSingleRoute(
    request: SearchRequest,
    options?: {
      maxPollAttempts?: number;
      pollDelayMs?: number;
    }
  ) {
    const { skyscannerMarket, locale } = getSkyscannerMarketConfig(request.regionalMarket);

    const createResponse = await fetch(`${this.baseUrl}/search/create`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey ?? ""
      },
      body: JSON.stringify({
        query: {
          market: skyscannerMarket,
          locale,
          currency: request.displayCurrency,
          nearbyAirports: request.nearbyAirports,
          adults: request.passengers,
          cabinClass:
            request.cabin === "business"
              ? "CABIN_CLASS_BUSINESS"
              : request.cabin === "premiumEconomy"
                ? "CABIN_CLASS_PREMIUM_ECONOMY"
                : "CABIN_CLASS_ECONOMY",
          queryLegs: [
            {
              originPlaceId: {
                iata: request.origin
              },
              destinationPlaceId: {
                iata: request.destination
              },
              date: this.toSkyscannerDate(request.departDate)
            },
            ...(request.tripType === "roundTrip" && request.returnDate
              ? [
                  {
                    originPlaceId: {
                      iata: request.destination
                    },
                    destinationPlaceId: {
                      iata: request.origin
                    },
                    date: this.toSkyscannerDate(request.returnDate)
                  }
                ]
              : [])
          ]
        }
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Skyscanner create failed with status ${createResponse.status}.`);
    }

    const createPayload = (await createResponse.json()) as SkyscannerSearchResponse;
    let finalPayload = createPayload;
    let sessionToken = createPayload.sessionToken;

    if (!sessionToken) {
      return parseSearchResults(request, createPayload.content?.results);
    }

    const maxPollAttempts = options?.maxPollAttempts ?? 4;
    const pollDelayMs = options?.pollDelayMs ?? 650;

    for (let attempt = 0; attempt < maxPollAttempts; attempt += 1) {
      if (attempt > 0) {
        await wait(pollDelayMs);
      }

      const pollResponse = await fetch(`${this.baseUrl}/search/poll/${sessionToken}`, {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey ?? ""
        }
      });

      if (!pollResponse.ok) {
        break;
      }

      finalPayload = (await pollResponse.json()) as SkyscannerSearchResponse;

      if (finalPayload.status === "RESULT_STATUS_COMPLETE") {
        break;
      }

      sessionToken = finalPayload.sessionToken ?? sessionToken;
    }

    return parseSearchResults(
      request,
      finalPayload.content?.results ?? createPayload.content?.results
    );
  }

  private toSkyscannerDate(dateString: string) {
    const [year, month, day] = dateString.split("-").map(Number);

    return {
      year,
      month,
      day
    };
  }
}
