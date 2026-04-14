import type { BookingOption, Itinerary, Segment } from "@/lib/flights/types";

export interface AggregatedItineraryDraft {
  id: string;
  fingerprint: string;
  tripType: Itinerary["tripType"];
  origin: string;
  destination: string;
  outbound: Segment[];
  inbound?: Segment[];
  airlineDisplay: string;
  overnight: boolean;
  selfTransfer: boolean;
  mixAndMatch: boolean;
  flexibilityBias: number;
  bookingOptions: BookingOption[];
}

function differenceInMinutes(start: string, end: string) {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}

function totalDurationMinutes(outbound: Segment[], inbound?: Segment[]) {
  const outboundDuration = differenceInMinutes(
    outbound[0].departureTime,
    outbound.at(-1)?.arrivalTime ?? outbound[0].arrivalTime
  );

  if (!inbound) {
    return outboundDuration;
  }

  const inboundDuration = differenceInMinutes(
    inbound[0].departureTime,
    inbound.at(-1)?.arrivalTime ?? inbound[0].arrivalTime
  );

  return outboundDuration + inboundDuration;
}

function stopText(segments: Segment[]) {
  const stops = segments.length - 1;
  return stops === 0 ? "Nonstop" : stops === 1 ? "1 stop" : `${stops} stops`;
}

function summarizeStops(outbound: Segment[], inbound?: Segment[]) {
  return inbound
    ? `${stopText(outbound)} outbound · ${stopText(inbound)} return`
    : stopText(outbound);
}

function flexibilityScore(option: BookingOption, selfTransfer: boolean, mixAndMatch: boolean) {
  let score = option.supportScore;

  if (option.fareRules.carryOnIncluded) score += 5;
  if (option.fareRules.checkedBagIncluded) score += 8;
  if (option.fareRules.changeability === "freeChanges") score += 16;
  if (option.fareRules.changeability === "changeFee") score += 8;
  if (option.fareRules.refundability === "cash") score += 14;
  if (option.fareRules.refundability === "credit") score += 6;
  if (option.fareRules.seatSelection === "included") score += 4;
  if (selfTransfer) score -= 26;
  if (mixAndMatch) score -= 8;

  return Math.max(5, Math.min(100, score));
}

function buildBaggageSummary(option: BookingOption) {
  if (option.fareRules.checkedBagIncluded) {
    return "Carry-on and first checked bag included";
  }

  if (option.fareRules.carryOnIncluded) {
    return "Carry-on included · checked bag estimated extra";
  }

  return "Basic bag policy · carry-on and checked bag may cost extra";
}

function buildRestrictionSummary(option: BookingOption, selfTransfer: boolean) {
  const summary = [
    option.fareRules.changeability === "freeChanges"
      ? "Free changes"
      : option.fareRules.changeability === "changeFee"
        ? "Changes with fee"
        : "No changes",
    option.fareRules.refundability === "cash"
      ? "Refundable"
      : option.fareRules.refundability === "credit"
        ? "Credit only"
        : "Non-refundable"
  ];

  if (!option.fareRules.checkedBagIncluded) {
    summary.push("Checked bag extra");
  }

  if (selfTransfer) {
    summary.push("Separate tickets");
  }

  return summary;
}

export function finalizeItineraries(drafts: AggregatedItineraryDraft[]) {
  const itineraries = drafts.map((draft) => {
    const bookingOptions = [...draft.bookingOptions].sort(
      (left, right) => left.totalPrice - right.totalPrice
    );
    const cheapestFareProvider = [...bookingOptions].sort(
      (left, right) => left.baseFare - right.baseFare
    )[0];
    const cheapestTotalProvider = bookingOptions[0];
    const bestDirect = bookingOptions
      .filter((option) => option.providerKind === "airline")
      .sort((left, right) => left.totalPrice - right.totalPrice)[0];
    const bestOta = bookingOptions
      .filter((option) => option.providerKind === "ota" || option.providerKind === "mix")
      .sort((left, right) => left.totalPrice - right.totalPrice)[0];
    const totalDuration = totalDurationMinutes(draft.outbound, draft.inbound);
    const itineraryFlexibility = Math.max(
      ...bookingOptions.map((option) =>
        flexibilityScore(option, draft.selfTransfer, draft.mixAndMatch)
      )
    );

    return {
      id: draft.id,
      fingerprint: draft.fingerprint,
      tripType: draft.tripType,
      origin: draft.origin,
      destination: draft.destination,
      outbound: draft.outbound,
      inbound: draft.inbound,
      bookingOptions,
      totalDurationMinutes: totalDuration,
      overnight: draft.overnight,
      selfTransfer: draft.selfTransfer,
      flexibilityScore: itineraryFlexibility + draft.flexibilityBias,
      valueScore: 0,
      cheapestFare: cheapestFareProvider.baseFare,
      cheapestTotal: cheapestTotalProvider.totalPrice,
      bestDirect,
      bestOta,
      cheapestFareProvider,
      cheapestTotalProvider,
      tags: [] as Itinerary["tags"],
      restrictionSummary: buildRestrictionSummary(cheapestTotalProvider, draft.selfTransfer),
      baggageSummary: buildBaggageSummary(cheapestTotalProvider),
      airlineDisplay: draft.airlineDisplay,
      stopSummary: summarizeStops(draft.outbound, draft.inbound),
      mixAndMatch: draft.mixAndMatch
    } satisfies Itinerary;
  });

  const cheapestFare = Math.min(...itineraries.map((itinerary) => itinerary.cheapestFare));
  const cheapestTotal = Math.min(...itineraries.map((itinerary) => itinerary.cheapestTotal));
  const highestFlexibility = Math.max(
    ...itineraries.map((itinerary) => itinerary.flexibilityScore)
  );
  const highestTotal = Math.max(...itineraries.map((itinerary) => itinerary.cheapestTotal));
  const longestDuration = Math.max(
    ...itineraries.map((itinerary) => itinerary.totalDurationMinutes)
  );

  const scored = itineraries.map((itinerary) => {
    const priceComponent =
      100 - ((itinerary.cheapestTotal - cheapestTotal) / Math.max(1, highestTotal - cheapestTotal)) * 50;
    const durationComponent =
      100 -
      ((itinerary.totalDurationMinutes - Math.min(...itineraries.map((item) => item.totalDurationMinutes))) /
        Math.max(
          1,
          longestDuration -
            Math.min(...itineraries.map((item) => item.totalDurationMinutes))
        )) *
        20;
    const flexibilityComponent = itinerary.flexibilityScore * 0.3;
    const transferPenalty = itinerary.selfTransfer ? 10 : 0;
    const valueScore = Math.round(
      Math.max(15, Math.min(99, priceComponent + durationComponent + flexibilityComponent - transferPenalty))
    );

    return {
      ...itinerary,
      valueScore
    };
  });

  const bestValueScore = Math.max(...scored.map((itinerary) => itinerary.valueScore));

  const tagged = scored.map((itinerary) => {
    const tags: Itinerary["tags"] = [...itinerary.tags];

    if (itinerary.cheapestFare === cheapestFare) {
      tags.push("cheapestFare");
    }

    if (itinerary.cheapestTotal === cheapestTotal) {
      tags.push("cheapestTotal");
    }

    if (itinerary.valueScore === bestValueScore) {
      tags.push("bestValue");
    }

    if (itinerary.flexibilityScore === highestFlexibility) {
      tags.push("bestFlexibility");
    }

    return {
      ...itinerary,
      tags
    };
  });

  return tagged.sort((left, right) => {
    if (left.cheapestTotal !== right.cheapestTotal) {
      return left.cheapestTotal - right.cheapestTotal;
    }

    return right.valueScore - left.valueScore;
  });
}
