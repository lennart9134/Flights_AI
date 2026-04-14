import { NextResponse } from "next/server";

import { searchRequestSchema } from "@/lib/flights/schemas";
import { searchFlights } from "@/lib/flights/search-service";
import type { SearchRequest } from "@/lib/flights/types";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = searchRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const searchRequest: SearchRequest = {
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
  };

  const response = await searchFlights(searchRequest);
  return NextResponse.json(response);
}
