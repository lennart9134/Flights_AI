import { FlightSearchShell } from "@/components/flight-search-shell";
import { DEFAULT_SEARCH_REQUEST, searchFlights } from "@/lib/flights/search-service";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initialResponse = await searchFlights(DEFAULT_SEARCH_REQUEST);

  return <FlightSearchShell initialResponse={initialResponse} />;
}
