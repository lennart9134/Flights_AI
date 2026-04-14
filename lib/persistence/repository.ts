import type { PriceAlert, SavedSearch } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { mockPriceAlerts, mockSavedSearches } from "@/lib/persistence/mock-store";
import type { PriceAlertRecord, SavedSearchRecord } from "@/lib/flights/types";
import { routeLabel } from "@/lib/utils";

function shouldUseDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function mapSavedSearch(record: SavedSearch): SavedSearchRecord {
  return {
    id: record.id,
    name: record.name,
    origin: record.origin,
    destination: record.destination,
    departDate: record.departDate.toISOString().slice(0, 10),
    returnDate: record.returnDate?.toISOString().slice(0, 10),
    tripType: record.tripType as SavedSearchRecord["tripType"],
    passengers: record.passengers,
    cabin: record.cabin as SavedSearchRecord["cabin"],
    nearbyAirports: record.nearbyAirports,
    mixAndMatchEnabled: record.mixAndMatchEnabled,
    regionalMarket: record.regionalMarket as SavedSearchRecord["regionalMarket"],
    displayCurrency: record.displayCurrency as SavedSearchRecord["displayCurrency"],
    createdAt: record.createdAt.toISOString()
  };
}

function mapPriceAlert(record: PriceAlert): PriceAlertRecord {
  return {
    id: record.id,
    routeLabel: record.routeLabel,
    origin: record.origin,
    destination: record.destination,
    departDate: record.departDate.toISOString().slice(0, 10),
    returnDate: record.returnDate?.toISOString().slice(0, 10),
    tripType: record.tripType as PriceAlertRecord["tripType"],
    email: record.email,
    targetPrice: record.targetPrice,
    currency: record.currency as PriceAlertRecord["currency"],
    regionalMarket: record.regionalMarket as PriceAlertRecord["regionalMarket"],
    createdAt: record.createdAt.toISOString(),
    lastTrackedPrice: record.lastTrackedPrice,
    active: record.active
  };
}

export async function listSavedSearches() {
  if (shouldUseDatabase()) {
    try {
      const records = await prisma.savedSearch.findMany({
        orderBy: {
          createdAt: "desc"
        },
        take: 6
      });

      return records.map(mapSavedSearch);
    } catch (error) {
      console.error("Falling back to mock saved searches.", error);
    }
  }

  return mockSavedSearches;
}

export async function createSavedSearch(
  input: Omit<SavedSearchRecord, "id" | "createdAt">
) {
  const fallbackRecord: SavedSearchRecord = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };

  if (shouldUseDatabase()) {
    try {
      const record = await prisma.savedSearch.create({
        data: {
          ...input,
          departDate: new Date(`${input.departDate}T00:00:00Z`),
          returnDate: input.returnDate
            ? new Date(`${input.returnDate}T00:00:00Z`)
            : null
        }
      });

      return mapSavedSearch(record);
    } catch (error) {
      console.error("Falling back to mock saved search persistence.", error);
    }
  }

  mockSavedSearches.unshift(fallbackRecord);
  return fallbackRecord;
}

export async function listPriceAlerts() {
  if (shouldUseDatabase()) {
    try {
      const records = await prisma.priceAlert.findMany({
        orderBy: {
          createdAt: "desc"
        },
        take: 6
      });

      return records.map(mapPriceAlert);
    } catch (error) {
      console.error("Falling back to mock price alerts.", error);
    }
  }

  return mockPriceAlerts;
}

export async function createPriceAlert(
  input: Omit<PriceAlertRecord, "id" | "createdAt" | "routeLabel" | "active">
) {
  const fallbackRecord: PriceAlertRecord = {
    ...input,
    id: crypto.randomUUID(),
    routeLabel: routeLabel(input.origin, input.destination),
    createdAt: new Date().toISOString(),
    active: true
  };

  if (shouldUseDatabase()) {
    try {
      const record = await prisma.priceAlert.create({
        data: {
          ...input,
          routeLabel: routeLabel(input.origin, input.destination),
          departDate: new Date(`${input.departDate}T00:00:00Z`),
          returnDate: input.returnDate
            ? new Date(`${input.returnDate}T00:00:00Z`)
            : null,
          active: true
        }
      });

      return mapPriceAlert(record);
    } catch (error) {
      console.error("Falling back to mock price alert persistence.", error);
    }
  }

  mockPriceAlerts.unshift(fallbackRecord);
  return fallbackRecord;
}
