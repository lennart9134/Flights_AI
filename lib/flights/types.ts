export type TripType = "roundTrip" | "oneWay";
export type CabinClass = "economy" | "premiumEconomy" | "business";
export type Market = "US" | "DE" | "GB" | "IN";
export type CurrencyCode = "USD" | "EUR" | "GBP";
export type ProviderKind = "airline" | "ota" | "mix";
export type ItineraryTag =
  | "cheapestFare"
  | "cheapestTotal"
  | "bestValue"
  | "bestFlexibility";

export interface SearchRequest {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  tripType: TripType;
  passengers: number;
  cabin: CabinClass;
  nearbyAirports: boolean;
  mixAndMatchEnabled: boolean;
  regionalMarket: Market;
  displayCurrency: CurrencyCode;
}

export interface Segment {
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  carrier: string;
  flightNumber: string;
  durationMinutes: number;
  stopCount: number;
  operatingCarrier?: string;
}

export interface FareRules {
  carryOnIncluded: boolean;
  checkedBagIncluded: boolean;
  changeability: "nonrefundable" | "changeFee" | "freeChanges";
  refundability: "none" | "credit" | "cash";
  seatSelection: "paid" | "included";
}

export interface BookingOption {
  providerId: string;
  providerName: string;
  providerKind: ProviderKind;
  pointOfSale: Market;
  currency: CurrencyCode;
  baseFare: number;
  taxes: number;
  baggageFeeEstimate: number;
  paymentFees: number;
  totalPrice: number;
  fareRules: FareRules;
  restrictions: string[];
  notes: string[];
  supportScore: number;
  directBooking: boolean;
  deepLink: string;
}

export interface Itinerary {
  id: string;
  fingerprint: string;
  tripType: TripType;
  origin: string;
  destination: string;
  outbound: Segment[];
  inbound?: Segment[];
  bookingOptions: BookingOption[];
  totalDurationMinutes: number;
  overnight: boolean;
  selfTransfer: boolean;
  flexibilityScore: number;
  valueScore: number;
  cheapestFare: number;
  cheapestTotal: number;
  bestDirect?: BookingOption;
  bestOta?: BookingOption;
  cheapestFareProvider?: BookingOption;
  cheapestTotalProvider?: BookingOption;
  tags: ItineraryTag[];
  restrictionSummary: string[];
  baggageSummary: string;
  airlineDisplay: string;
  stopSummary: string;
  mixAndMatch: boolean;
}

export interface FlexibleDateCell {
  departDate: string;
  returnDate?: string;
  totalPrice: number;
  farePrice: number;
  bestTag?: "lowestTotal" | "lowestFare";
}

export interface RegionalComparison {
  market: Market;
  label: string;
  currency: CurrencyCode;
  totalPrice?: number;
  deltaVsSelected?: number;
  isSelected: boolean;
  status: "available" | "unavailable";
  note?: string;
}

export interface SearchResponse {
  request: SearchRequest;
  itineraries: Itinerary[];
  flexibleDates: FlexibleDateCell[];
  nearbyAirportsUsed: {
    origins: string[];
    destinations: string[];
  };
  meta: {
    providersQueried: string[];
    generatedAt: string;
    liveGoogleFlightsUrl: string;
    disclaimer: string;
    sourceMode: "live" | "mock";
    regionalComparisons: RegionalComparison[];
    regionalPricingNote?: string;
  };
}

export interface SavedSearchRecord {
  id: string;
  name: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  tripType: TripType;
  passengers: number;
  cabin: CabinClass;
  nearbyAirports: boolean;
  mixAndMatchEnabled: boolean;
  regionalMarket: Market;
  displayCurrency: CurrencyCode;
  createdAt: string;
}

export interface PriceAlertRecord {
  id: string;
  routeLabel: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  tripType: TripType;
  email: string;
  targetPrice: number;
  currency: CurrencyCode;
  regionalMarket: Market;
  createdAt: string;
  lastTrackedPrice: number;
  active: boolean;
}
