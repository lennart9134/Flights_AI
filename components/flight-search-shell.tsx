"use client";

import { useState, useTransition } from "react";

import { FeatureLinks } from "@/components/feature-links";
import { FlightResultCard } from "@/components/flight-result-card";
import { FlexibleDatesView } from "@/components/flexible-dates-view";
import { PageHero } from "@/components/page-hero";
import { ResultsSummary } from "@/components/results-summary";
import { SearchForm } from "@/components/search-form";
import { SiteHeader } from "@/components/site-header";
import type { SearchRequest, SearchResponse } from "@/lib/flights/types";

interface FlightSearchShellProps {
  initialResponse: SearchResponse;
}

export function FlightSearchShell({ initialResponse }: FlightSearchShellProps) {
  const [request, setRequest] = useState<SearchRequest>(initialResponse.request);
  const [response, setResponse] = useState<SearchResponse>(initialResponse);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [, startTransition] = useTransition();

  async function runSearch(nextRequest: SearchRequest) {
    setIsSearching(true);
    setStatusMessage(null);

    try {
      const searchResponse = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(nextRequest)
      });

      if (!searchResponse.ok) {
        throw new Error("Search failed");
      }

      const nextResponse = (await searchResponse.json()) as SearchResponse;

      startTransition(() => {
        setRequest(nextRequest);
        setResponse(nextResponse);
      });
    } catch (error) {
      console.error(error);
      setStatusMessage("Search failed. Please double-check the route and dates.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container pb-16">
        <div className="mt-6 space-y-8">
          <PageHero
            eyebrow="Flights"
            title="Search cheaper flights with the real total in focus."
            description="Compare direct airlines, OTAs, and mix-and-match options without burying baggage fees, restrictions, or booking-channel tradeoffs."
          >
            <div className="pt-4">
              <SearchForm
                value={request}
                onChange={setRequest}
                onSubmit={runSearch}
                isSearching={isSearching}
                compact
              />
            </div>
          </PageHero>

          {statusMessage ? (
            <p className="text-sm font-medium text-primary">{statusMessage}</p>
          ) : null}

          <div className="space-y-8">
            <ResultsSummary response={response} />
            <FlexibleDatesView cells={response.flexibleDates} request={response.request} />

            <section className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold text-primary">Top matches</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  The strongest three options are shown side by side so the tradeoffs are easier
                  to compare.
                </p>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                {response.itineraries.slice(0, 3).map((itinerary) => (
                  <FlightResultCard
                    key={itinerary.fingerprint}
                    itinerary={itinerary}
                    currency={response.request.displayCurrency}
                    compact
                  />
                ))}
              </div>

              {response.itineraries.length > 3 ? (
                <div className="space-y-4 pt-2">
                  <div>
                    <h3 className="text-xl font-semibold text-primary">Alternative options</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Broader choices with more detail below the primary comparison set.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {response.itineraries.slice(3).map((itinerary) => (
                      <FlightResultCard
                        key={itinerary.fingerprint}
                        itinerary={itinerary}
                        currency={response.request.displayCurrency}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            <FeatureLinks />
          </div>
        </div>
      </main>
    </div>
  );
}
