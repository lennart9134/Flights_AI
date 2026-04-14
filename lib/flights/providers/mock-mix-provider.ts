import {
  buildMixBlueprints,
  createMixBookingOption
} from "@/lib/flights/mock-data";
import type { FlightSearchProvider, NormalizedOffer, ProviderContext } from "@/lib/flights/providers/types";

export class MockMixAndMatchProvider implements FlightSearchProvider {
  id = "mock-mix-match";
  displayName = "Mock Mix-and-Match Engine";
  kind = "mix" as const;

  async search(context: ProviderContext) {
    if (!context.request.mixAndMatchEnabled) {
      return [];
    }

    return buildMixBlueprints(
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
          bookingOption: createMixBookingOption(context.request, blueprint)
        }) satisfies NormalizedOffer
    );
  }
}
