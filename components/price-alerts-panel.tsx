"use client";

import { useState } from "react";
import { BellRing, LineChart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PriceAlertRecord } from "@/lib/flights/types";
import { formatCompactDate, formatCurrency } from "@/lib/utils";

interface PriceAlertsPanelProps {
  alerts: PriceAlertRecord[];
  onCreate?: (input: { email: string; targetPrice: number }) => Promise<void>;
  isSaving?: boolean;
  showCreateForm?: boolean;
}

export function PriceAlertsPanel({
  alerts,
  onCreate,
  isSaving = false,
  showCreateForm = true
}: PriceAlertsPanelProps) {
  const [email, setEmail] = useState("traveler@example.com");
  const [targetPrice, setTargetPrice] = useState("550");

  return (
    <Card className="border-white/70 bg-white/75">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Price alerts</CardTitle>
        <CardDescription>
          Alert users when the realistic trip total drops below a target.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showCreateForm && onCreate ? (
          <form
            className="grid gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              await onCreate({
                email,
                targetPrice: Number(targetPrice)
              });
            }}
          >
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="traveler@example.com"
            />
            <div className="flex gap-3">
              <Input
                value={targetPrice}
                onChange={(event) => setTargetPrice(event.target.value)}
                placeholder="550"
              />
              <Button type="submit" disabled={isSaving}>
                <BellRing className="h-4 w-4" />
                {isSaving ? "Saving..." : "Create"}
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            Create new alerts directly from the search experience on the homepage.
          </p>
        )}

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-3xl border border-border/70 bg-white/85 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-primary">{alert.routeLabel}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatCompactDate(alert.departDate)}
                    {alert.returnDate ? ` → ${formatCompactDate(alert.returnDate)}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">
                    {formatCurrency(alert.targetPrice, alert.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">target</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <LineChart className="h-4 w-4 text-accent" />
                Last tracked total{" "}
                {formatCurrency(alert.lastTrackedPrice, alert.currency)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
