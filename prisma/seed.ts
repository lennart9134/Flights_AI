import { addDays, format } from "date-fns";

import { prisma } from "../lib/prisma";

async function main() {
  const today = new Date();

  await prisma.savedSearch.createMany({
    data: [
      {
        name: "Summer London trip",
        origin: "NYC",
        destination: "LON",
        departDate: new Date(`${format(addDays(today, 35), "yyyy-MM-dd")}T00:00:00Z`),
        returnDate: new Date(`${format(addDays(today, 43), "yyyy-MM-dd")}T00:00:00Z`),
        tripType: "roundTrip",
        passengers: 1,
        cabin: "economy",
        nearbyAirports: true,
        mixAndMatchEnabled: true,
        regionalMarket: "US",
        displayCurrency: "USD"
      }
    ],
    skipDuplicates: true
  });

  await prisma.priceAlert.createMany({
    data: [
      {
        routeLabel: "NYC -> LON",
        origin: "NYC",
        destination: "LON",
        departDate: new Date(`${format(addDays(today, 35), "yyyy-MM-dd")}T00:00:00Z`),
        returnDate: new Date(`${format(addDays(today, 43), "yyyy-MM-dd")}T00:00:00Z`),
        tripType: "roundTrip",
        email: "traveler@example.com",
        targetPrice: 560,
        currency: "USD",
        regionalMarket: "US",
        lastTrackedPrice: 612,
        active: true
      }
    ],
    skipDuplicates: true
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
