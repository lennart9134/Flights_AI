# Flights AI

Flights AI is a production-style MVP for a flight comparison product that helps travelers understand the difference between a cheap-looking fare and the trip that actually costs least after baggage, booking fees, fare restrictions, and booking-channel friction.

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- Prisma
- PostgreSQL

## What the MVP includes

- Round-trip and one-way search
- Flexible dates recommendations
- Nearby airports expansion for metro areas
- Airline direct vs OTA comparison
- One-way mix-and-match results
- Baggage fee aware total-cost estimates
- Fare restriction summaries
- Self-transfer warnings
- Price alerts
- Saved searches
- Regional point-of-sale and display currency settings
- Clear labels for cheapest fare, cheapest total cost, best value, and best flexibility

## Live pricing

Flights AI now supports a real Skyscanner integration through the Flights Live Prices API when `SKYSCANNER_API_KEY` is configured. Without that key, the app falls back to deterministic mock data so the product still runs locally.

## Important note about market comparison

The product includes a regional point-of-sale comparison panel to help users see whether the same trip prices differently by market. This is the honest version of “would it be cheaper through a VPN?” A lower price in another market can be real, but it may still depend on supplier billing-country rules, residency requirements, taxes, or payment acceptance.

## Project structure

- `app/`: Next.js app router pages and API routes
- `components/`: reusable UI and product components
- `lib/flights/`: domain models, provider adapters, mock pricing logic, and scoring
- `lib/persistence/`: Prisma-backed repositories with mock fallback
- `prisma/`: PostgreSQL schema and seed script

## Local setup

1. Install dependencies: `pnpm install`
2. Copy `.env.example` to `.env`
3. Add `DATABASE_URL` if you want persistent saved searches and price alerts
4. Add `SKYSCANNER_API_KEY` if you want live Skyscanner results
5. If you configured PostgreSQL, generate the schema with `pnpm db:push`
6. Seed demo data if desired: `pnpm db:seed`
7. Start the app: `pnpm dev`

If no `DATABASE_URL` is configured, the app falls back to in-memory demo persistence for saved searches and price alerts. If no `SKYSCANNER_API_KEY` is configured, the search layer falls back to mock provider data.

## Vercel deployment

This project can deploy to Vercel without a database or Skyscanner key on day one:

- No `DATABASE_URL`: saved searches and price alerts fall back to in-memory demo mode
- No `SKYSCANNER_API_KEY`: search falls back to deterministic mock flight data

Recommended Vercel settings:

- Framework preset: `Next.js`
- Install command: `pnpm install`
- Build command: `pnpm build`
- Output directory: leave empty

Optional environment variables:

- `DATABASE_URL`: for PostgreSQL-backed saved searches and price alerts
- `SKYSCANNER_API_KEY`: for live Skyscanner results
- `SKYSCANNER_API_BASE_URL`: leave default unless your Skyscanner account requires a custom base URL

The repo includes `pnpm-workspace.yaml` so Prisma and related packages are allowed to run their install/build scripts during CI installs on Vercel.
