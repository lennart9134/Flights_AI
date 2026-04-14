import type { BookingOption, SearchRequest, Segment } from "@/lib/flights/types";

export interface ProviderContext {
  request: SearchRequest;
  originOptions: string[];
  destinationOptions: string[];
}

export interface NormalizedOffer {
  id: string;
  fingerprint: string;
  origin: string;
  destination: string;
  outbound: Segment[];
  inbound?: Segment[];
  airlineDisplay: string;
  overnight: boolean;
  selfTransfer: boolean;
  mixAndMatch: boolean;
  flexibilityBias: number;
  bookingOption: BookingOption;
}

export interface FlightSearchProvider {
  id: string;
  displayName: string;
  kind: "airline" | "ota" | "mix";
  search(context: ProviderContext): Promise<NormalizedOffer[]>;
}
