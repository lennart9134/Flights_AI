import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { RegionalComparisonPanel } from "@/components/regional-comparison-panel";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { DEFAULT_SEARCH_REQUEST, searchFlights } from "@/lib/flights/search-service";

export const dynamic = "force-dynamic";

export default async function RegionalComparisonPage() {
  const response = await searchFlights(DEFAULT_SEARCH_REQUEST);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container pb-16">
        <div className="mt-6 space-y-8">
          <PageHero
            eyebrow="Regional comparison"
            title="See when a route prices differently by market."
            description={`Current example: ${response.request.origin} to ${response.request.destination} in ${response.request.displayCurrency}. Run the main search to explore more routes once the layout feels right.`}
          >
            <div className="pt-2">
              <Button asChild variant="secondary" size="lg">
                <Link href="/">Back to flight search</Link>
              </Button>
            </div>
          </PageHero>

          <RegionalComparisonPanel response={response} />
        </div>
      </main>
    </div>
  );
}
