import { MockDirectAirlineProvider } from "@/lib/flights/providers/mock-direct-provider";
import { MockMixAndMatchProvider } from "@/lib/flights/providers/mock-mix-provider";
import { MockOtaProvider } from "@/lib/flights/providers/mock-ota-provider";
import { SkyscannerLivePricesProvider } from "@/lib/flights/providers/skyscanner-provider";

export const mockProviders = [
  new MockDirectAirlineProvider(),
  new MockOtaProvider(),
  new MockMixAndMatchProvider()
];

export const skyscannerProvider = new SkyscannerLivePricesProvider();
