import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { SavedSearchesPanel } from "@/components/saved-searches-panel";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { listSavedSearches } from "@/lib/persistence/repository";

export const dynamic = "force-dynamic";

export default async function SavedSearchesPage() {
  const savedSearches = await listSavedSearches();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container pb-16">
        <div className="mt-6 space-y-8">
          <PageHero
            eyebrow="Saved searches"
            title="Keep routes you care about out of the way until you need them."
            description="This page is for route management, not the main search flow. Save new searches from the homepage once a result is worth revisiting."
          >
            <div className="pt-2">
              <Button asChild variant="secondary" size="lg">
                <Link href="/">Back to flight search</Link>
              </Button>
            </div>
          </PageHero>

          <SavedSearchesPanel savedSearches={savedSearches} showSaveForm={false} />
        </div>
      </main>
    </div>
  );
}
