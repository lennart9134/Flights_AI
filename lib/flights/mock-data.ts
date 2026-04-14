import { addDays, format } from "date-fns";

import { calculateDistanceKm, lookupAirport } from "@/lib/flights/airports";
import type {
  BookingOption,
  CabinClass,
  CurrencyCode,
  FareRules,
  FlexibleDateCell,
  Market,
  SearchRequest,
  Segment
} from "@/lib/flights/types";

interface AirlineProfile {
  code: string;
  name: string;
  type: "legacy" | "lowcost" | "premium";
  hubs: string[];
  longHaul: boolean;
  shortHaul: boolean;
  brandBias: number;
  flexibilityBias: number;
}

interface OtaProfile {
  id: string;
  name: string;
  discountBias: number;
  paymentFeeUsd: number;
  baggagePaddingUsd: number;
  supportScore: number;
}

export interface MockItineraryBlueprint {
  id: string;
  fingerprint: string;
  origin: string;
  destination: string;
  outbound: Segment[];
  inbound?: Segment[];
  overnight: boolean;
  selfTransfer: boolean;
  mixAndMatch: boolean;
  airlineDisplay: string;
  priceBias: number;
  flexibilityBias: number;
}

export const MARKET_OPTIONS = [
  { value: "US", label: "United States" },
  { value: "DE", label: "Germany" },
  { value: "GB", label: "United Kingdom" },
  { value: "IN", label: "India" }
] as const;

export const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" }
] as const;

export const CABIN_OPTIONS = [
  { value: "economy", label: "Economy" },
  { value: "premiumEconomy", label: "Premium Economy" },
  { value: "business", label: "Business" }
] as const;

const FX_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78
};

const MARKET_FACTORS: Record<Market, number> = {
  US: 1,
  DE: 0.97,
  GB: 1.03,
  IN: 0.91
};

const CABIN_FACTORS: Record<CabinClass, number> = {
  economy: 1,
  premiumEconomy: 1.38,
  business: 2.85
};

const AIRLINES: AirlineProfile[] = [
  {
    code: "UA",
    name: "United",
    type: "legacy",
    hubs: ["EWR", "JFK", "FRA"],
    longHaul: true,
    shortHaul: true,
    brandBias: 0.03,
    flexibilityBias: 8
  },
  {
    code: "DL",
    name: "Delta",
    type: "legacy",
    hubs: ["JFK", "LGA", "AMS"],
    longHaul: true,
    shortHaul: true,
    brandBias: 0.04,
    flexibilityBias: 9
  },
  {
    code: "LH",
    name: "Lufthansa",
    type: "legacy",
    hubs: ["FRA", "MUC"],
    longHaul: true,
    shortHaul: true,
    brandBias: 0.05,
    flexibilityBias: 10
  },
  {
    code: "BA",
    name: "British Airways",
    type: "legacy",
    hubs: ["LHR", "LGW"],
    longHaul: true,
    shortHaul: true,
    brandBias: 0.04,
    flexibilityBias: 9
  },
  {
    code: "AF",
    name: "Air France",
    type: "legacy",
    hubs: ["CDG", "ORY"],
    longHaul: true,
    shortHaul: true,
    brandBias: 0.03,
    flexibilityBias: 8
  },
  {
    code: "KL",
    name: "KLM",
    type: "legacy",
    hubs: ["AMS"],
    longHaul: true,
    shortHaul: true,
    brandBias: 0.02,
    flexibilityBias: 8
  },
  {
    code: "IB",
    name: "Iberia",
    type: "legacy",
    hubs: ["MAD"],
    longHaul: true,
    shortHaul: true,
    brandBias: 0.01,
    flexibilityBias: 7
  },
  {
    code: "EK",
    name: "Emirates",
    type: "premium",
    hubs: ["DXB"],
    longHaul: true,
    shortHaul: false,
    brandBias: 0.1,
    flexibilityBias: 14
  },
  {
    code: "U2",
    name: "easyJet",
    type: "lowcost",
    hubs: ["LGW", "BER"],
    longHaul: false,
    shortHaul: true,
    brandBias: -0.08,
    flexibilityBias: -10
  },
  {
    code: "FR",
    name: "Ryanair",
    type: "lowcost",
    hubs: ["DUB", "BER", "LIS"],
    longHaul: false,
    shortHaul: true,
    brandBias: -0.11,
    flexibilityBias: -12
  }
];

const OTAS: OtaProfile[] = [
  {
    id: "trip-nest",
    name: "TripNest",
    discountBias: -0.05,
    paymentFeeUsd: 18,
    baggagePaddingUsd: 14,
    supportScore: 56
  },
  {
    id: "fare-harbor",
    name: "FareHarbor",
    discountBias: -0.03,
    paymentFeeUsd: 14,
    baggagePaddingUsd: 8,
    supportScore: 61
  },
  {
    id: "cloud-ticket",
    name: "CloudTicket",
    discountBias: -0.06,
    paymentFeeUsd: 20,
    baggagePaddingUsd: 12,
    supportScore: 52
  }
];

export function hashString(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function seededNumber(seed: string) {
  return (hashString(seed) % 1000) / 1000;
}

function seededInt(seed: string, min: number, max: number) {
  return Math.floor(seededNumber(seed) * (max - min + 1)) + min;
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function pickAirlines(origin: string, destination: string, count: number) {
  const distanceKm = calculateDistanceKm(origin, destination);
  const eligible = AIRLINES.filter((airline) =>
    distanceKm > 3500 ? airline.longHaul : airline.shortHaul
  );

  return [...eligible]
    .sort((left, right) => {
      const leftScore = hashString(`${origin}${destination}${left.code}`);
      const rightScore = hashString(`${origin}${destination}${right.code}`);
      return leftScore - rightScore;
    })
    .slice(0, count);
}

function pickOtas(seed: string) {
  return [...OTAS]
    .sort((left, right) => {
      const leftScore = hashString(`${seed}${left.id}`);
      const rightScore = hashString(`${seed}${right.id}`);
      return leftScore - rightScore;
    })
    .slice(0, 2);
}

function createDateTime(dateString: string, minutesAfterMidnight: number) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCMinutes(date.getUTCMinutes() + minutesAfterMidnight);
  return date.toISOString();
}

function estimateFlightMinutes(origin: string, destination: string) {
  const distanceKm = calculateDistanceKm(origin, destination);
  return Math.max(75, Math.round(distanceKm / 12.5) + 30);
}

function pickHub(seed: string, carrier: AirlineProfile, origin: string, destination: string) {
  const primaryHub =
    carrier.hubs.find((hub) => hub !== origin && hub !== destination) ?? "AMS";
  return primaryHub;
}

function buildLegSegments(
  seed: string,
  dateString: string,
  origin: string,
  destination: string,
  carrier: AirlineProfile,
  stops: 0 | 1,
  startMinutes: number
) {
  if (stops === 0) {
    const duration = estimateFlightMinutes(origin, destination) + seededInt(seed, -15, 35);
    return [
      {
        from: origin,
        to: destination,
        departureTime: createDateTime(dateString, startMinutes),
        arrivalTime: createDateTime(dateString, startMinutes + duration),
        carrier: carrier.name,
        flightNumber: `${carrier.code}${seededInt(`${seed}-flight`, 120, 899)}`,
        durationMinutes: duration,
        stopCount: 0,
        operatingCarrier: carrier.name
      }
    ] satisfies Segment[];
  }

  const hub = pickHub(seed, carrier, origin, destination);
  const firstDuration = estimateFlightMinutes(origin, hub) + seededInt(`${seed}-1`, -10, 20);
  const layover = seededInt(`${seed}-layover`, 65, 135);
  const secondDuration =
    estimateFlightMinutes(hub, destination) + seededInt(`${seed}-2`, -8, 24);

  return [
    {
      from: origin,
      to: hub,
      departureTime: createDateTime(dateString, startMinutes),
      arrivalTime: createDateTime(dateString, startMinutes + firstDuration),
      carrier: carrier.name,
      flightNumber: `${carrier.code}${seededInt(`${seed}-flight-a`, 120, 899)}`,
      durationMinutes: firstDuration,
      stopCount: 0,
      operatingCarrier: carrier.name
    },
    {
      from: hub,
      to: destination,
      departureTime: createDateTime(dateString, startMinutes + firstDuration + layover),
      arrivalTime: createDateTime(
        dateString,
        startMinutes + firstDuration + layover + secondDuration
      ),
      carrier: carrier.name,
      flightNumber: `${carrier.code}${seededInt(`${seed}-flight-b`, 900, 3199)}`,
      durationMinutes: secondDuration,
      stopCount: 0,
      operatingCarrier: carrier.name
    }
  ] satisfies Segment[];
}

function buildFingerprint(outbound: Segment[], inbound?: Segment[]) {
  const outboundKey = outbound
    .map((segment) => `${segment.from}-${segment.to}-${segment.departureTime}`)
    .join("|");
  const inboundKey = inbound
    ?.map((segment) => `${segment.from}-${segment.to}-${segment.departureTime}`)
    .join("|");

  return `${outboundKey}::${inboundKey ?? "one-way"}`;
}

function getUniqueAirlines(segments: Segment[]) {
  return unique(segments.map((segment) => segment.carrier));
}

function roundCurrency(value: number) {
  return Math.max(25, Math.round(value / 5) * 5);
}

function convertUsd(value: number, currency: CurrencyCode) {
  return roundCurrency(value * FX_RATES[currency]);
}

function cabinBagIncluded(cabin: CabinClass) {
  return cabin !== "economy";
}

function buildFareRules(
  providerKind: BookingOption["providerKind"],
  cabin: CabinClass,
  carrier: AirlineProfile,
  includeBagOverride?: boolean
): FareRules {
  const carryOnIncluded = providerKind === "mix" ? true : carrier.type !== "lowcost";
  const checkedBagIncluded =
    includeBagOverride ?? (cabinBagIncluded(cabin) || carrier.type === "premium");

  if (providerKind === "mix") {
    return {
      carryOnIncluded: true,
      checkedBagIncluded: false,
      changeability: "nonrefundable",
      refundability: "none",
      seatSelection: "paid"
    };
  }

  if (providerKind === "ota") {
    return {
      carryOnIncluded,
      checkedBagIncluded,
      changeability: cabin === "business" ? "changeFee" : "nonrefundable",
      refundability: cabin === "business" ? "credit" : "none",
      seatSelection: checkedBagIncluded ? "included" : "paid"
    };
  }

  if (cabin === "business") {
    return {
      carryOnIncluded: true,
      checkedBagIncluded: true,
      changeability: "freeChanges",
      refundability: "cash",
      seatSelection: "included"
    };
  }

  if (cabin === "premiumEconomy") {
    return {
      carryOnIncluded: true,
      checkedBagIncluded: true,
      changeability: "changeFee",
      refundability: "credit",
      seatSelection: "included"
    };
  }

  return {
    carryOnIncluded,
    checkedBagIncluded,
    changeability: carrier.type === "lowcost" ? "nonrefundable" : "changeFee",
    refundability: carrier.type === "lowcost" ? "none" : "credit",
    seatSelection: carrier.type === "lowcost" ? "paid" : "paid"
  };
}

function buildRestrictions(
  providerKind: BookingOption["providerKind"],
  fareRules: FareRules,
  selfTransfer: boolean
) {
  const restrictions: string[] = [];

  restrictions.push(
    fareRules.changeability === "freeChanges"
      ? "Changes included"
      : fareRules.changeability === "changeFee"
        ? "Changes allowed with fee"
        : "Changes not allowed"
  );

  restrictions.push(
    fareRules.refundability === "cash"
      ? "Cash refund available"
      : fareRules.refundability === "credit"
        ? "Airline credit only"
        : "Non-refundable"
  );

  if (!fareRules.checkedBagIncluded) {
    restrictions.push("Checked bag extra");
  }

  if (providerKind === "ota") {
    restrictions.push("Service changes handled by OTA");
  }

  if (selfTransfer) {
    restrictions.push("Separate tickets and re-check required");
  }

  return restrictions;
}

function buildNotes(providerKind: BookingOption["providerKind"], selfTransfer: boolean) {
  const notes =
    providerKind === "airline"
      ? ["Book direct for cleaner disruption handling"]
      : providerKind === "ota"
        ? ["Lower headline fare may hide service and payment fees"]
        : ["Lower price built from separate one-way tickets"];

  if (selfTransfer) {
    notes.push("Missed-connection protection is limited");
  }

  return notes;
}

function priceBaseUsd(
  request: SearchRequest,
  blueprint: MockItineraryBlueprint,
  extraBias: number
) {
  const distanceKm = calculateDistanceKm(blueprint.origin, blueprint.destination);
  const baseDistance = request.tripType === "roundTrip" ? distanceKm * 0.08 : distanceKm * 0.05;
  const demand = 120 + seededInt(`${blueprint.fingerprint}-demand`, 0, 75);
  const stopDiscount =
    (blueprint.outbound.length - 1 + (blueprint.inbound?.length ?? 1) - 1) * 28;

  return (
    (baseDistance + demand - stopDiscount) *
    MARKET_FACTORS[request.regionalMarket] *
    CABIN_FACTORS[request.cabin] *
    (1 + blueprint.priceBias + extraBias)
  );
}

export function createDirectBookingOption(
  request: SearchRequest,
  blueprint: MockItineraryBlueprint
) {
  const carrierName = blueprint.outbound[0]?.carrier ?? "Airline";
  const carrier = AIRLINES.find((item) => item.name === carrierName) ?? AIRLINES[0];
  const fareRules = buildFareRules("airline", request.cabin, carrier);
  const baseUsd = priceBaseUsd(request, blueprint, carrier.brandBias);
  const taxesUsd = baseUsd * 0.19 + 48;
  const baggageUsd =
    fareRules.checkedBagIncluded ? 0 : request.passengers * (request.tripType === "roundTrip" ? 90 : 45);
  const paymentUsd = carrier.type === "lowcost" ? 10 : 0;

  const baseFare = convertUsd(baseUsd, request.displayCurrency);
  const taxes = convertUsd(taxesUsd, request.displayCurrency);
  const baggageFeeEstimate = convertUsd(baggageUsd, request.displayCurrency);
  const paymentFees = convertUsd(paymentUsd, request.displayCurrency);

  return {
    providerId: carrier.code.toLowerCase(),
    providerName: carrier.name,
    providerKind: "airline",
    pointOfSale: request.regionalMarket,
    currency: request.displayCurrency,
    baseFare,
    taxes,
    baggageFeeEstimate,
    paymentFees,
    totalPrice: baseFare + taxes + baggageFeeEstimate + paymentFees,
    fareRules,
    restrictions: buildRestrictions("airline", fareRules, blueprint.selfTransfer),
    notes: buildNotes("airline", blueprint.selfTransfer),
    supportScore: 82 + carrier.flexibilityBias,
    directBooking: true,
    deepLink: "#"
  } satisfies BookingOption;
}

export function createOtaBookingOptions(
  request: SearchRequest,
  blueprint: MockItineraryBlueprint
) {
  const carrierName = blueprint.outbound[0]?.carrier ?? "Airline";
  const carrier = AIRLINES.find((item) => item.name === carrierName) ?? AIRLINES[0];
  const baseFareRules = buildFareRules("ota", request.cabin, carrier);
  const baseUsd = priceBaseUsd(request, blueprint, carrier.brandBias);

  return pickOtas(blueprint.fingerprint).map((ota) => {
    const discountedBaseUsd = baseUsd * (1 + ota.discountBias);
    const taxesUsd = discountedBaseUsd * 0.18 + 52;
    const baggageUsd =
      baseFareRules.checkedBagIncluded
        ? 0
        : request.passengers * (request.tripType === "roundTrip" ? 95 : 48) + ota.baggagePaddingUsd;

    const baseFare = convertUsd(discountedBaseUsd, request.displayCurrency);
    const taxes = convertUsd(taxesUsd, request.displayCurrency);
    const baggageFeeEstimate = convertUsd(baggageUsd, request.displayCurrency);
    const paymentFees = convertUsd(ota.paymentFeeUsd, request.displayCurrency);

    return {
      providerId: ota.id,
      providerName: ota.name,
      providerKind: "ota",
      pointOfSale: request.regionalMarket,
      currency: request.displayCurrency,
      baseFare,
      taxes,
      baggageFeeEstimate,
      paymentFees,
      totalPrice: baseFare + taxes + baggageFeeEstimate + paymentFees,
      fareRules: baseFareRules,
      restrictions: buildRestrictions("ota", baseFareRules, blueprint.selfTransfer),
      notes: buildNotes("ota", blueprint.selfTransfer),
      supportScore: ota.supportScore,
      directBooking: false,
      deepLink: "#"
    } satisfies BookingOption;
  });
}

export function createMixBookingOption(
  request: SearchRequest,
  blueprint: MockItineraryBlueprint
) {
  const carrierName = blueprint.outbound[0]?.carrier ?? "Airline";
  const carrier = AIRLINES.find((item) => item.name === carrierName) ?? AIRLINES[0];
  const fareRules = buildFareRules("mix", request.cabin, carrier);
  const baseUsd = priceBaseUsd(request, blueprint, -0.08);
  const taxesUsd = baseUsd * 0.15 + 45;
  const baggageUsd = request.passengers * (request.tripType === "roundTrip" ? 105 : 52);
  const paymentUsd = 18;

  const baseFare = convertUsd(baseUsd, request.displayCurrency);
  const taxes = convertUsd(taxesUsd, request.displayCurrency);
  const baggageFeeEstimate = convertUsd(baggageUsd, request.displayCurrency);
  const paymentFees = convertUsd(paymentUsd, request.displayCurrency);

  return {
    providerId: "mix-engine",
    providerName: "Split-ticket Engine",
    providerKind: "mix",
    pointOfSale: request.regionalMarket,
    currency: request.displayCurrency,
    baseFare,
    taxes,
    baggageFeeEstimate,
    paymentFees,
    totalPrice: baseFare + taxes + baggageFeeEstimate + paymentFees,
    fareRules,
    restrictions: buildRestrictions("mix", fareRules, blueprint.selfTransfer),
    notes: buildNotes("mix", blueprint.selfTransfer),
    supportScore: 40,
    directBooking: false,
    deepLink: "#"
  } satisfies BookingOption;
}

function buildBlueprint(
  request: SearchRequest,
  seed: string,
  origin: string,
  destination: string,
  outboundCarrier: AirlineProfile,
  inboundCarrier: AirlineProfile,
  outboundStops: 0 | 1,
  inboundStops: 0 | 1,
  departureMinutes: number,
  returnMinutes: number,
  priceBias: number,
  flexibilityBias: number,
  mixAndMatch = false,
  selfTransfer = false
): MockItineraryBlueprint {
  const outbound = buildLegSegments(
    `${seed}-outbound`,
    request.departDate,
    origin,
    destination,
    outboundCarrier,
    outboundStops,
    departureMinutes
  );

  const inbound =
    request.tripType === "roundTrip" && request.returnDate
      ? buildLegSegments(
          `${seed}-inbound`,
          request.returnDate,
          destination,
          origin,
          inboundCarrier,
          inboundStops,
          returnMinutes
        )
      : undefined;

  const carriers = unique([
    ...getUniqueAirlines(outbound),
    ...(inbound ? getUniqueAirlines(inbound) : [])
  ]);
  const fingerprint = buildFingerprint(outbound, inbound);
  const firstDeparture = new Date(outbound[0].departureTime).getTime();
  const finalArrival = new Date((inbound ?? outbound).at(-1)?.arrivalTime ?? outbound[0].arrivalTime).getTime();

  return {
    id: `itinerary-${hashString(seed)}`,
    fingerprint,
    origin,
    destination,
    outbound,
    inbound,
    overnight: finalArrival - firstDeparture > 1000 * 60 * 60 * 18,
    selfTransfer,
    mixAndMatch,
    airlineDisplay: carriers.join(" + "),
    priceBias,
    flexibilityBias
  };
}

export function buildCoreBlueprints(
  request: SearchRequest,
  originOptions: string[],
  destinationOptions: string[]
) {
  const primaryOrigin = originOptions[0];
  const primaryDestination = destinationOptions[0];
  const alternateOrigin = originOptions[1] ?? primaryOrigin;
  const alternateDestination = destinationOptions[1] ?? primaryDestination;
  const carriers = pickAirlines(primaryOrigin, primaryDestination, 5);

  const templates = [
    {
      origin: primaryOrigin,
      destination: primaryDestination,
      outboundCarrier: carriers[0] ?? AIRLINES[0],
      inboundCarrier: carriers[0] ?? AIRLINES[0],
      outboundStops: 0 as const,
      inboundStops: 0 as const,
      departureMinutes: 425,
      returnMinutes: 780,
      priceBias: 0.04,
      flexibilityBias: 12
    },
    {
      origin: primaryOrigin,
      destination: primaryDestination,
      outboundCarrier: carriers[1] ?? AIRLINES[1],
      inboundCarrier: carriers[1] ?? AIRLINES[1],
      outboundStops: 0 as const,
      inboundStops: 0 as const,
      departureMinutes: 690,
      returnMinutes: 965,
      priceBias: -0.03,
      flexibilityBias: 6
    },
    {
      origin: primaryOrigin,
      destination: primaryDestination,
      outboundCarrier: carriers[2] ?? AIRLINES[2],
      inboundCarrier: carriers[2] ?? AIRLINES[2],
      outboundStops: 1 as const,
      inboundStops: 1 as const,
      departureMinutes: 515,
      returnMinutes: 845,
      priceBias: -0.07,
      flexibilityBias: 1
    },
    {
      origin: primaryOrigin,
      destination: primaryDestination,
      outboundCarrier: carriers[3] ?? AIRLINES[3],
      inboundCarrier: carriers[3] ?? AIRLINES[3],
      outboundStops: 1 as const,
      inboundStops: 0 as const,
      departureMinutes: 830,
      returnMinutes: 1110,
      priceBias: -0.01,
      flexibilityBias: 8
    },
    {
      origin: alternateOrigin,
      destination: alternateDestination,
      outboundCarrier: carriers[4] ?? AIRLINES[4],
      inboundCarrier: carriers[4] ?? AIRLINES[4],
      outboundStops: 0 as const,
      inboundStops: 0 as const,
      departureMinutes: 370,
      returnMinutes: 725,
      priceBias: -0.05,
      flexibilityBias: 4
    }
  ];

  return templates.map((template, index) =>
    buildBlueprint(
      request,
      `${primaryOrigin}-${primaryDestination}-${index}`,
      template.origin,
      template.destination,
      template.outboundCarrier,
      template.inboundCarrier,
      template.outboundStops,
      template.inboundStops,
      template.departureMinutes + seededInt(`${index}-dep`, -30, 34),
      template.returnMinutes + seededInt(`${index}-ret`, -25, 40),
      template.priceBias,
      template.flexibilityBias
    )
  );
}

export function buildMixBlueprints(
  request: SearchRequest,
  originOptions: string[],
  destinationOptions: string[]
) {
  if (request.tripType !== "roundTrip" || !request.returnDate) {
    return [];
  }

  const primaryOrigin = originOptions[0];
  const primaryDestination = destinationOptions[0];
  const carriers = pickAirlines(primaryOrigin, primaryDestination, 4);

  return [
    buildBlueprint(
      request,
      `${primaryOrigin}-${primaryDestination}-mix-a`,
      primaryOrigin,
      primaryDestination,
      carriers[0] ?? AIRLINES[0],
      carriers[1] ?? AIRLINES[1],
      0,
      0,
      540,
      930,
      -0.09,
      -7,
      true,
      true
    ),
    buildBlueprint(
      request,
      `${primaryOrigin}-${primaryDestination}-mix-b`,
      primaryOrigin,
      primaryDestination,
      carriers[2] ?? AIRLINES[2],
      carriers[3] ?? AIRLINES[3],
      1,
      0,
      760,
      1190,
      -0.12,
      -11,
      true,
      true
    )
  ];
}

function estimateCellBasePrice(request: SearchRequest, departDate: string, returnDate?: string) {
  const distanceKm = calculateDistanceKm(request.origin, request.destination);
  const routeBase = request.tripType === "roundTrip" ? distanceKm * 0.075 : distanceKm * 0.048;
  const marketFactor = MARKET_FACTORS[request.regionalMarket];
  const cabinFactor = CABIN_FACTORS[request.cabin];
  const weekdayFactor = seededNumber(`${departDate}-${returnDate ?? "one-way"}-weekday`) * 0.18;
  const totalUsd = (routeBase + 135) * marketFactor * cabinFactor * (0.92 + weekdayFactor);
  const fareUsd = totalUsd * 0.82;

  return {
    totalPrice: convertUsd(totalUsd, request.displayCurrency),
    farePrice: convertUsd(fareUsd, request.displayCurrency)
  };
}

export function buildFlexibleDateMatrix(request: SearchRequest) {
  const cells: FlexibleDateCell[] = [];

  if (request.tripType === "roundTrip" && request.returnDate) {
    for (let departOffset = -2; departOffset <= 2; departOffset += 1) {
      for (let returnOffset = -2; returnOffset <= 2; returnOffset += 1) {
        const departDate = format(addDays(new Date(request.departDate), departOffset), "yyyy-MM-dd");
        const returnDate = format(addDays(new Date(request.returnDate), returnOffset), "yyyy-MM-dd");

        if (new Date(returnDate) <= new Date(departDate)) {
          continue;
        }

        const estimate = estimateCellBasePrice(request, departDate, returnDate);
        cells.push({
          departDate,
          returnDate,
          ...estimate
        });
      }
    }
  } else {
    for (let departOffset = -3; departOffset <= 3; departOffset += 1) {
      const departDate = format(addDays(new Date(request.departDate), departOffset), "yyyy-MM-dd");
      const estimate = estimateCellBasePrice(request, departDate);
      cells.push({
        departDate,
        ...estimate
      });
    }
  }

  const cheapestTotal = Math.min(...cells.map((cell) => cell.totalPrice));
  const cheapestFare = Math.min(...cells.map((cell) => cell.farePrice));

  return cells.map((cell): FlexibleDateCell => {
    const bestTag: FlexibleDateCell["bestTag"] =
      cell.totalPrice === cheapestTotal
        ? "lowestTotal"
        : cell.farePrice === cheapestFare
          ? "lowestFare"
          : undefined;

    return {
      ...cell,
      bestTag
    };
  });
}

export function buildGoogleFlightsUrl(request: SearchRequest) {
  const route = `${request.origin} ${request.destination} ${request.departDate}${
    request.returnDate ? ` ${request.returnDate}` : ""
  }`;
  return `https://www.google.com/travel/flights?hl=en&q=${encodeURIComponent(route)}`;
}

export function describeAirport(code: string) {
  const airport = lookupAirport(code);
  return airport ? `${airport.city} · ${airport.name}` : code;
}
