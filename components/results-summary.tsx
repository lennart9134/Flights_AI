import { ExternalLink, MapPinned, ShieldCheck, Ticket, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SearchResponse } from "@/lib/flights/types";
import { formatCurrency } from "@/lib/utils";

interface ResultsSummaryProps {
  response: SearchResponse;
}

function findTaggedRoute(
  response: SearchResponse,
  tag: SearchResponse["itineraries"][number]["tags"][number]
) {
  return response.itineraries.find((itinerary) => itinerary.tags.includes(tag));
}

export function ResultsSummary({ response }: ResultsSummaryProps) {
  const cheapestFare = findTaggedRoute(response, "cheapestFare");
  const cheapestTotal = findTaggedRoute(response, "cheapestTotal");
  const bestValue = findTaggedRoute(response, "bestValue");
  const bestFlexibility = findTaggedRoute(response, "bestFlexibility");

  const summaryCards = [
    {
      title: "Cheapest fare",
      subtitle: cheapestFare?.airlineDisplay ?? "No result",
      amount: cheapestFare ? formatCurrency(cheapestFare.cheapestFare, response.request.displayCurrency) : "—",
      icon: Ticket,
      className: "border-primary/10 bg-[rgba(244,239,230,0.96)] shadow-soft",
      iconClassName: "text-accent",
      titleClassName: "text-primary",
      amountClassName: "text-foreground",
      subtitleClassName: "text-slate-600"
    },
    {
      title: "Cheapest total",
      subtitle: cheapestTotal?.airlineDisplay ?? "No result",
      amount: cheapestTotal
        ? formatCurrency(cheapestTotal.cheapestTotal, response.request.displayCurrency)
        : "—",
      icon: Wallet,
      className:
        "border-primary/0 bg-gradient-to-br from-primary via-primary to-slate-800 shadow-panel",
      iconClassName: "text-white/80",
      titleClassName: "text-white/80",
      amountClassName: "text-white",
      subtitleClassName: "text-white/70"
    },
    {
      title: "Best value",
      subtitle: bestValue?.airlineDisplay ?? "No result",
      amount: bestValue ? `${bestValue.valueScore}/100` : "—",
      icon: ShieldCheck,
      className: "border-accent/20 bg-[rgba(231,244,246,0.94)] shadow-soft",
      iconClassName: "text-accent",
      titleClassName: "text-primary",
      amountClassName: "text-foreground",
      subtitleClassName: "text-slate-600"
    },
    {
      title: "Best flexibility",
      subtitle: bestFlexibility?.airlineDisplay ?? "No result",
      amount: bestFlexibility ? `${bestFlexibility.flexibilityScore}/100` : "—",
      icon: MapPinned,
      className: "border-warning/20 bg-[rgba(255,244,224,0.96)] shadow-soft",
      iconClassName: "text-warning",
      titleClassName: "text-primary",
      amountClassName: "text-foreground",
      subtitleClassName: "text-slate-600"
    }
  ];
  return (
    <Card className="border-primary/10 bg-[rgba(255,255,255,0.9)] shadow-soft">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="text-2xl text-primary">Decision-ready comparison</CardTitle>
            <CardDescription className="mt-1 max-w-2xl">
              Each itinerary separates headline fare from realistic total cost, then layers in
              baggage, change rules, booking channel friction, and self-transfer risk.
            </CardDescription>
          </div>
          <Button asChild variant="outline">
            <a
              href={response.meta.liveGoogleFlightsUrl}
              target="_blank"
              rel="noreferrer"
            >
              Cross-check on Google Flights
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => (
            <div
              key={item.title}
              className={`rounded-3xl border p-5 ${item.className}`}
            >
              <item.icon className={`h-5 w-5 ${item.iconClassName}`} />
              <p className={`mt-4 text-sm font-semibold ${item.titleClassName}`}>{item.title}</p>
              <p className={`mt-1 text-2xl font-semibold ${item.amountClassName}`}>{item.amount}</p>
              <p className={`mt-2 text-sm ${item.subtitleClassName}`}>{item.subtitle}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-3xl border border-primary/10 bg-[rgba(246,244,238,0.94)] p-5 shadow-soft">
            <p className="text-sm font-semibold text-primary">What was searched</p>
            <p className="mt-2 text-sm text-slate-600">
              {response.nearbyAirportsUsed.origins.join(", ")} to{" "}
              {response.nearbyAirportsUsed.destinations.join(", ")} · Point of sale{" "}
              {response.request.regionalMarket} · Currency {response.request.displayCurrency}
            </p>
            <p className="mt-3 text-sm text-slate-600">{response.meta.disclaimer}</p>
          </div>
          <div className="rounded-3xl border border-primary/10 bg-[rgba(246,244,238,0.94)] p-5 shadow-soft">
            <p className="text-sm font-semibold text-primary">Sources in this MVP</p>
            <p className="mt-2 text-sm text-slate-600">
              {response.meta.providersQueried.join(" · ")}
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Source mode: {response.meta.sourceMode === "live" ? "Live Skyscanner" : "Mock fallback"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
