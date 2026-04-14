import { NextResponse } from "next/server";

import { priceAlertSchema } from "@/lib/flights/schemas";
import { createPriceAlert, listPriceAlerts } from "@/lib/persistence/repository";

export async function GET() {
  const alerts = await listPriceAlerts();
  return NextResponse.json(alerts);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = priceAlertSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const alert = await createPriceAlert({
    origin: parsed.data.origin,
    destination: parsed.data.destination,
    departDate: parsed.data.departDate,
    returnDate: parsed.data.returnDate,
    tripType: parsed.data.tripType,
    email: parsed.data.email,
    targetPrice: parsed.data.targetPrice,
    currency: parsed.data.displayCurrency,
    regionalMarket: parsed.data.regionalMarket,
    lastTrackedPrice:
      typeof payload.lastTrackedPrice === "number"
        ? payload.lastTrackedPrice
        : parsed.data.targetPrice
  });

  return NextResponse.json(alert);
}
