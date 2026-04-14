import {
  buildCoreBlueprints,
  createOtaBookingOptions
} from "@/lib/flights/mock-data";
import type { FlightSearchProvider, NormalizedOffer, ProviderContext } from "@/lib/flights/providers/types";

export class MockOtaProvider implements FlightSearchProvider {
  id = "mock-otas";
  displayName = "Mock OTA Marketplaces";
  kind = "ota" as const;

  async search(context: ProviderContext) {
    return buildCoreBlueprints(
      context.request,
      context.originOptions,
      context.destinationOptions
    ).flatMap((blueprint) =>
      createOtaBookingOptions(context.request, blueprint).map(
        (bookingOption) =>
          ({
            id: `${blueprint.id}-${bookingOption.providerId}`,
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
            bookingOption
          }) satisfies NormalizedOffer
      )
    );
  }
}
