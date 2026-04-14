import { z } from "zod";

const searchRequestBaseSchema = z.object({
  origin: z.string().trim().min(2).max(60),
  destination: z
    .string()
    .trim()
    .min(2)
    .max(60),
  departDate: z.string().min(10).max(10),
  returnDate: z
    .string()
    .optional()
    .transform((value) => value || undefined),
  tripType: z.enum(["roundTrip", "oneWay"]),
  passengers: z.number().int().min(1).max(6),
  cabin: z.enum(["economy", "premiumEconomy", "business"]),
  nearbyAirports: z.boolean().optional().default(false),
  mixAndMatchEnabled: z.boolean().optional().default(true),
  regionalMarket: z.enum(["US", "DE", "GB", "IN"]),
  displayCurrency: z.enum(["USD", "EUR", "GBP"])
});

function withRoundTripValidation<T extends z.AnyZodObject>(schema: T) {
  return schema.refine(
    (value) => (value.tripType === "oneWay" ? true : Boolean(value.returnDate)),
    {
      message: "Round-trip searches require a return date.",
      path: ["returnDate"]
    }
  );
}

export const searchRequestSchema = withRoundTripValidation(searchRequestBaseSchema);

export const savedSearchSchema = withRoundTripValidation(
  searchRequestBaseSchema.extend({
    name: z.string().trim().min(2).max(40)
  })
);

export const priceAlertSchema = withRoundTripValidation(
  searchRequestBaseSchema.extend({
    email: z.string().email(),
    targetPrice: z.number().int().positive()
  })
);
