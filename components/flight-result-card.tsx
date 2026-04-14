import { AlertTriangle, BriefcaseBusiness, ShieldAlert, TicketSlash } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { BookingOption, Itinerary } from "@/lib/flights/types";
import { formatCompactDate, formatCurrency, formatDuration, formatTime } from "@/lib/utils";

const tagConfig: Record<
  Itinerary["tags"][number],
  {
    label: string;
    variant: "default" | "success" | "warning" | "outline";
  }
> = {
  cheapestFare: {
    label: "Cheapest fare",
    variant: "outline"
  },
  cheapestTotal: {
    label: "Cheapest total cost",
    variant: "success"
  },
  bestValue: {
    label: "Best value",
    variant: "default"
  },
  bestFlexibility: {
    label: "Best flexibility",
    variant: "warning"
  }
};

function SegmentLine({
  label,
  segments
}: {
  label: string;
  segments: Itinerary["outbound"];
}) {
  const first = segments[0];
  const last = segments.at(-1) ?? segments[0];

  return (
    <div className="rounded-2xl border border-primary/10 bg-[rgba(247,245,239,0.96)] p-4 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-lg font-semibold text-primary">
            {formatTime(first.departureTime)} · {first.from} to {formatTime(last.arrivalTime)} ·{" "}
            {last.to}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {formatCompactDate(first.departureTime.slice(0, 10))} · {segments[0].carrier}
            {segments.length > 1 ? ` with ${segments.length - 1} stop` : " nonstop"}
          </p>
        </div>
        <p className="text-sm font-medium text-slate-600">
          {formatDuration(
            Math.round(
              (new Date(last.arrivalTime).getTime() - new Date(first.departureTime).getTime()) /
                60000
            )
          )}
        </p>
      </div>
    </div>
  );
}

function BookingOptionTile({
  title,
  option,
  currency
}: {
  title: string;
  option?: BookingOption;
  currency: string;
}) {
  if (!option) {
    return (
      <div className="rounded-2xl border border-dashed border-primary/15 bg-[rgba(247,245,239,0.72)] p-4 text-sm text-slate-600">
        No option available.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/10 bg-[rgba(247,245,239,0.96)] p-4 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">{title}</p>
          <p className="mt-1 text-sm text-slate-600">{option.providerName}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-primary">
            {formatCurrency(option.totalPrice, currency)}
          </p>
          <p className="text-xs text-slate-600">
            Fare {formatCurrency(option.baseFare, currency)}
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <p>Bags: {formatCurrency(option.baggageFeeEstimate, currency)} est.</p>
        <p>Payment fees: {formatCurrency(option.paymentFees, currency)}</p>
        <p>
          Flex rules:{" "}
          {option.fareRules.changeability === "freeChanges"
            ? "Free changes"
            : option.fareRules.changeability === "changeFee"
              ? "Changes with fee"
              : "No changes"}
        </p>
      </div>
    </div>
  );
}

export function FlightResultCard({
  itinerary,
  currency,
  compact = false
}: {
  itinerary: Itinerary;
  currency: string;
  compact?: boolean;
}) {
  const directVsOtaDelta =
    itinerary.bestDirect && itinerary.bestOta
      ? itinerary.bestDirect.totalPrice - itinerary.bestOta.totalPrice
      : undefined;

  if (compact) {
    return (
      <Card className="h-full overflow-hidden border-primary/10 bg-[rgba(255,255,255,0.92)] shadow-soft">
        <CardContent className="flex h-full flex-col p-5">
          <div className="flex flex-wrap gap-2">
            {itinerary.tags.map((tag) => (
              <Badge key={tag} variant={tagConfig[tag].variant}>
                {tagConfig[tag].label}
              </Badge>
            ))}
            {itinerary.selfTransfer ? (
              <Badge variant="danger">Self-transfer</Badge>
            ) : null}
          </div>

          <div className="mt-4">
            <h3 className="text-xl font-semibold text-primary">{itinerary.airlineDisplay}</h3>
            <p className="mt-1 text-sm text-slate-600">
              {itinerary.origin} to {itinerary.destination} · {itinerary.stopSummary}
            </p>
          </div>

          <div className="mt-4 rounded-3xl border border-primary/0 bg-gradient-to-br from-primary via-primary to-slate-800 p-4 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Realistic total
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {formatCurrency(itinerary.cheapestTotal, currency)}
            </p>
            <p className="mt-1 text-sm text-white/75">
              Fare {formatCurrency(itinerary.cheapestFare, currency)}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <SegmentLine label="Outbound" segments={itinerary.outbound} />
            {itinerary.inbound ? <SegmentLine label="Return" segments={itinerary.inbound} /> : null}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-primary/10 bg-[rgba(247,245,239,0.96)] p-4 shadow-soft">
              <p className="text-sm font-semibold text-primary">Best direct</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {itinerary.bestDirect
                  ? formatCurrency(itinerary.bestDirect.totalPrice, currency)
                  : "Unavailable"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {itinerary.bestDirect?.providerName ?? "No direct option"}
              </p>
            </div>
            <div className="rounded-2xl border border-primary/10 bg-[rgba(247,245,239,0.96)] p-4 shadow-soft">
              <p className="text-sm font-semibold text-primary">
                {itinerary.mixAndMatch ? "Best OTA / split" : "Best OTA"}
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {itinerary.bestOta
                  ? formatCurrency(itinerary.bestOta.totalPrice, currency)
                  : "Unavailable"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {itinerary.bestOta?.providerName ?? "No OTA option"}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-primary/10 bg-[rgba(247,245,239,0.96)] p-4 shadow-soft">
              <p className="text-sm font-semibold text-primary">Baggage and fare rules</p>
              <p className="mt-2 text-sm text-slate-600">{itinerary.baggageSummary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {itinerary.restrictionSummary.slice(0, 3).map((restriction) => (
                  <Badge key={restriction} variant="outline">
                    {restriction}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-[rgba(247,245,239,0.96)] p-4 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-primary">Direct vs OTA</p>
                {typeof directVsOtaDelta === "number" ? (
                  <span className="text-sm font-medium text-slate-700">
                    {directVsOtaDelta > 0 ? "OTA saves" : "Direct saves"}{" "}
                    {formatCurrency(Math.abs(directVsOtaDelta), currency)}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Compare the cleanest booking path with the lowest resale option at a glance.
              </p>
            </div>

            {itinerary.selfTransfer ? (
              <div className="rounded-2xl border border-danger/25 bg-danger/10 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-danger">
                  <ShieldAlert className="h-4 w-4" />
                  Self-transfer risk
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Separate tickets can reduce protection on missed connections.
                </p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-primary/10 bg-[rgba(255,255,255,0.92)] shadow-soft">
      <CardContent className="p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {itinerary.tags.map((tag) => (
                <Badge key={tag} variant={tagConfig[tag].variant}>
                  {tagConfig[tag].label}
                </Badge>
              ))}
              {itinerary.mixAndMatch ? (
                <Badge variant="warning">Mix-and-match</Badge>
              ) : null}
              {itinerary.selfTransfer ? (
                <Badge variant="danger">Self-transfer warning</Badge>
              ) : null}
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-primary">{itinerary.airlineDisplay}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {itinerary.origin} to {itinerary.destination} · {itinerary.stopSummary}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-primary/0 bg-gradient-to-br from-primary via-primary to-slate-800 p-5 text-right shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Realistic total
            </p>
            <p className="mt-2 text-4xl font-semibold text-white">
              {formatCurrency(itinerary.cheapestTotal, currency)}
            </p>
            <p className="mt-2 text-sm text-white/75">
              Headline fare {formatCurrency(itinerary.cheapestFare, currency)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <SegmentLine label="Outbound" segments={itinerary.outbound} />
            {itinerary.inbound ? <SegmentLine label="Return" segments={itinerary.inbound} /> : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-primary/10 bg-[rgba(247,245,239,0.96)] p-5 shadow-soft">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <BriefcaseBusiness className="h-4 w-4 text-accent" />
                  Baggage-aware total
                </div>
                <p className="mt-3 text-sm text-slate-600">{itinerary.baggageSummary}</p>
              </div>
              <div className="rounded-3xl border border-primary/10 bg-[rgba(247,245,239,0.96)] p-5 shadow-soft">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <TicketSlash className="h-4 w-4 text-accent" />
                  Fare restrictions
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {itinerary.restrictionSummary.map((restriction) => (
                    <Badge key={restriction} variant="outline">
                      {restriction}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {itinerary.selfTransfer ? (
              <div className="rounded-3xl border border-danger/25 bg-danger/10 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-danger">
                  <ShieldAlert className="h-4 w-4" />
                  Self-transfer risk
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Separate tickets can mean re-checking bags, clearing immigration, and losing
                  through-protection on missed connections.
                </p>
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-primary/10 bg-[rgba(242,237,228,0.95)] p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary">Direct vs OTA</p>
                <p className="mt-1 text-sm text-slate-600">
                  Compare the cleanest booking path against the lowest resale channel.
                </p>
              </div>
              {typeof directVsOtaDelta === "number" ? (
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">
                    {directVsOtaDelta > 0 ? "OTA saves" : "Direct saves"}
                  </p>
                  <p className="text-sm text-slate-700">
                    {formatCurrency(Math.abs(directVsOtaDelta), currency)}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3">
              <BookingOptionTile
                title="Best direct"
                option={itinerary.bestDirect}
                currency={currency}
              />
              <BookingOptionTile
                title={itinerary.mixAndMatch ? "Best OTA or split ticket" : "Best OTA"}
                option={itinerary.bestOta}
                currency={currency}
              />
            </div>

            <div className="mt-4 rounded-2xl border border-primary/10 bg-[rgba(255,255,255,0.92)] p-4 shadow-soft">
              <div className="flex items-start gap-2 text-sm font-semibold text-primary">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
                Why the total differs
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Base fare is only one part of the decision. We estimate bag fees, payment fees,
                flexibility rules, and support friction so users can see the real tradeoff at a
                glance.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
