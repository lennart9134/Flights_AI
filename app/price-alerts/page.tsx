import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { PriceAlertsPanel } from "@/components/price-alerts-panel";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { listPriceAlerts } from "@/lib/persistence/repository";

export const dynamic = "force-dynamic";

export default async function PriceAlertsPage() {
  const alerts = await listPriceAlerts();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container pb-16">
        <div className="mt-6 space-y-8">
          <PageHero
            eyebrow="Price alerts"
            title="Track the routes that are worth waiting on."
            description="Search stays fast and uncluttered on the homepage. Alerts live here so users can monitor prices without turning the search page into a dashboard."
          >
            <div className="pt-2">
              <Button asChild variant="secondary" size="lg">
                <Link href="/">Back to flight search</Link>
              </Button>
            </div>
          </PageHero>

          <PriceAlertsPanel alerts={alerts} showCreateForm={false} />
        </div>
      </main>
    </div>
  );
}
