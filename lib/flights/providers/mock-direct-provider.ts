import {
  buildCoreBlueprints,
  createDirectBookingOption
} from "@/lib/flights/mock-data";
import type { FlightSearchProvider, NormalizedOffer, ProviderContext } from "@/lib/flights/providers/types";

export class MockDirectAirlineProvider implements FlightSearchProvider {
  id = "mock-direct-airlines";
  displayName = "Mock Direct Airlines";
  kind = "airline" as const;

  async search(context: ProviderContext) {
    return buildCoreBlueprints(
      context.request,
      context.originOptions,
      context.destinationOptions
    ).map(
      (blueprint) =>
        ({
          id: blueprint.id,
          fingerprint: blueprint.fingerprint,
          origin: blueprint.origin,
          destination: blueprint.destination,
          outbound: blueprint.outbound,
          inbound: blueprint.inbound,
          airlineDisplay: blueprint.airlineDisplay,
          overnight: blueprint.overnight,
          selfTransfer: blueprint.selfTransfer,
          mixAndMatch: blueprint.mixAndMatch,
          flexibilityBias: blueprint.flexibilityBias,
          bookingOption: createDirectBookingOption(context.request, blueprint)
        }) satisfies NormalizedOffer
    );
  }
}
