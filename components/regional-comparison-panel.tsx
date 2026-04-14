import { Globe2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SearchResponse } from "@/lib/flights/types";
import { formatCurrency } from "@/lib/utils";

interface RegionalComparisonPanelProps {
  response: SearchResponse;
}

export function RegionalComparisonPanel({
  response
}: RegionalComparisonPanelProps) {
  const availableRegionalComparisons = response.meta.regionalComparisons.filter(
    (comparison) => comparison.status === "available"
  );
  const cheapestRegionalComparison = [...availableRegionalComparisons].sort((left, right) => {
    return (left.totalPrice ?? Number.MAX_SAFE_INTEGER) - (right.totalPrice ?? Number.MAX_SAFE_INTEGER);
  })[0];

  return (
    <Card className="border-white/70 bg-white/80">
      <CardHeader className="gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Globe2 className="h-4 w-4 text-accent" />
          Regional price comparison
        </div>
        <CardTitle className="text-2xl text-primary">Compare points of sale</CardTitle>
        <CardDescription className="max-w-3xl">
          This is the honest way to answer the “would it be cheaper with a VPN?” question. Prices
          can differ by market, but billing-country rules, taxes, residency, or payment acceptance
          can still affect the final outcome.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {cheapestRegionalComparison?.totalPrice ? (
          <div className="rounded-3xl border border-border/70 bg-secondary/45 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Lowest observed market
            </p>
            <p className="mt-2 text-lg font-semibold text-primary">
              {cheapestRegionalComparison.label}
            </p>
            <p className="mt-1 text-3xl font-semibold text-foreground">
              {formatCurrency(
                cheapestRegionalComparison.totalPrice,
                cheapestRegionalComparison.currency
              )}
            </p>
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {response.meta.regionalComparisons.map((comparison) => (
            <div
              key={comparison.market}
              className="rounded-2xl border border-border/70 bg-white/85 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-primary">{comparison.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {comparison.isSelected ? "Selected market" : "Comparison market"}
                  </p>
                </div>
                {comparison.isSelected ? (
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
                    Current
                  </span>
                ) : null}
              </div>
              <p className="mt-4 text-2xl font-semibold text-primary">
                {typeof comparison.totalPrice === "number"
                  ? formatCurrency(comparison.totalPrice, comparison.currency)
                  : "Unavailable"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {typeof comparison.deltaVsSelected === "number"
                  ? comparison.deltaVsSelected < 0
                    ? `${formatCurrency(
                        Math.abs(comparison.deltaVsSelected),
                        comparison.currency
                      )} lower than selected`
                    : comparison.deltaVsSelected > 0
                      ? `${formatCurrency(
                          comparison.deltaVsSelected,
                          comparison.currency
                        )} higher than selected`
                      : "Matches selected market"
                  : comparison.note ?? "No comparable fare"}
              </p>
            </div>
          ))}
        </div>

        {response.meta.regionalPricingNote ? (
          <p className="text-sm text-muted-foreground">{response.meta.regionalPricingNote}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
