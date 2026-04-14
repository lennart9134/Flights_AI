import { addDays, format } from "date-fns";

import type { PriceAlertRecord, SavedSearchRecord } from "@/lib/flights/types";

const today = new Date();

export const mockSavedSearches: SavedSearchRecord[] = [
  {
    id: "saved-nyc-lon",
    name: "Summer London trip",
    origin: "NYC",
    destination: "LON",
    departDate: format(addDays(today, 35), "yyyy-MM-dd"),
    returnDate: format(addDays(today, 43), "yyyy-MM-dd"),
    tripType: "roundTrip",
    passengers: 1,
    cabin: "economy",
    nearbyAirports: true,
    mixAndMatchEnabled: true,
    regionalMarket: "US",
    displayCurrency: "USD",
    createdAt: new Date().toISOString()
  },
  {
    id: "saved-ber-bcn",
    name: "Weekend sun break",
    origin: "BER",
    destination: "BCN",
    departDate: format(addDays(today, 21), "yyyy-MM-dd"),
    returnDate: format(addDays(today, 24), "yyyy-MM-dd"),
    tripType: "roundTrip",
    passengers: 2,
    cabin: "economy",
    nearbyAirports: false,
    mixAndMatchEnabled: false,
    regionalMarket: "DE",
    displayCurrency: "EUR",
    createdAt: new Date().toISOString()
  }
];

export const mockPriceAlerts: PriceAlertRecord[] = [
  {
    id: "alert-1",
    routeLabel: "NYC -> LON",
    origin: "NYC",
    destination: "LON",
    departDate: format(addDays(today, 35), "yyyy-MM-dd"),
    returnDate: format(addDays(today, 43), "yyyy-MM-dd"),
    tripType: "roundTrip",
    email: "traveler@example.com",
    targetPrice: 560,
    currency: "USD",
    regionalMarket: "US",
    createdAt: new Date().toISOString(),
    lastTrackedPrice: 612,
    active: true
  }
];
