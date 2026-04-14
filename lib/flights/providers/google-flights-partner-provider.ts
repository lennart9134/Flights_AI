import type {
  FlightSearchProvider,
  NormalizedOffer,
  ProviderContext
} from "@/lib/flights/providers/types";

export class GoogleFlightsPartnerProvider implements FlightSearchProvider {
  id = "google-flights-live";
  displayName = "Google Flights Live API";
  kind = "ota" as const;

  async search(context: ProviderContext): Promise<NormalizedOffer[]> {
    void context;
    throw new Error(
      "Google Flights live pricing requires partner credentials and is not enabled in this MVP."
    );
  }
}
