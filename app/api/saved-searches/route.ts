import { NextResponse } from "next/server";

import { savedSearchSchema } from "@/lib/flights/schemas";
import { createSavedSearch, listSavedSearches } from "@/lib/persistence/repository";

export async function GET() {
  const searches = await listSavedSearches();
  return NextResponse.json(searches);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = savedSearchSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const savedSearch = await createSavedSearch({
    name: parsed.data.name,
    origin: parsed.data.origin,
    destination: parsed.data.destination,
    departDate: parsed.data.departDate,
    returnDate: parsed.data.returnDate,
    tripType: parsed.data.tripType,
    passengers: parsed.data.passengers,
    cabin: parsed.data.cabin,
    nearbyAirports: parsed.data.nearbyAirports,
    mixAndMatchEnabled: parsed.data.mixAndMatchEnabled,
    regionalMarket: parsed.data.regionalMarket,
    displayCurrency: parsed.data.displayCurrency
  });

  return NextResponse.json(savedSearch);
}
