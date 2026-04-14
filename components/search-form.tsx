"use client";

import { ArrowRightLeft, Search, Settings2 } from "lucide-react";

import { LocationCombobox } from "@/components/location-combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CABIN_OPTIONS,
  CURRENCY_OPTIONS,
  MARKET_OPTIONS
} from "@/lib/flights/mock-data";
import type { SearchRequest } from "@/lib/flights/types";

interface SearchFormProps {
  value: SearchRequest;
  onChange: (value: SearchRequest) => void;
  onSubmit: (value: SearchRequest) => void;
  isSearching: boolean;
  compact?: boolean;
}

export function SearchForm({
  value,
  onChange,
  onSubmit,
  isSearching,
  compact = false
}: SearchFormProps) {
  function update<K extends keyof SearchRequest>(key: K, nextValue: SearchRequest[K]) {
    onChange({
      ...value,
      [key]: nextValue
    });
  }

  function renderFields(showReturnDate: boolean) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_180px_180px]">
          <div className="space-y-2">
            <Label htmlFor="origin">Origin</Label>
            <LocationCombobox
              id="origin"
              value={value.origin}
              placeholder="New York or JFK"
              onChange={(nextValue) => update("origin", nextValue)}
            />
            <p className="text-xs text-muted-foreground">
              City names, metro codes, and airport codes all work.
            </p>
          </div>
          <div className="flex items-end justify-center pb-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() =>
                onChange({
                  ...value,
                  origin: value.destination,
                  destination: value.origin
                })
              }
              aria-label="Swap origin and destination"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <LocationCombobox
              id="destination"
              value={value.destination}
              placeholder="London or LHR"
              onChange={(nextValue) => update("destination", nextValue)}
            />
            <p className="text-xs text-muted-foreground">
              Try inputs like London, Paris, Tokyo, BER, or LON.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="depart-date">Depart</Label>
            <Input
              id="depart-date"
              type="date"
              value={value.departDate}
              onChange={(event) => update("departDate", event.target.value)}
            />
          </div>
          {showReturnDate ? (
            <div className="space-y-2">
              <Label htmlFor="return-date">Return</Label>
              <Input
                id="return-date"
                type="date"
                value={value.returnDate ?? ""}
                onChange={(event) => update("returnDate", event.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="passengers-inline">Passengers</Label>
              <Select
                id="passengers-inline"
                value={String(value.passengers)}
                onChange={(event) => update("passengers", Number(event.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((passengerCount) => (
                  <option key={passengerCount} value={passengerCount}>
                    {passengerCount} traveler{passengerCount === 1 ? "" : "s"}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="passengers">Passengers</Label>
            <Select
              id="passengers"
              value={String(value.passengers)}
              onChange={(event) => update("passengers", Number(event.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map((passengerCount) => (
                <option key={passengerCount} value={passengerCount}>
                  {passengerCount} traveler{passengerCount === 1 ? "" : "s"}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cabin">Cabin</Label>
            <Select
              id="cabin"
              value={value.cabin}
              onChange={(event) =>
                update("cabin", event.target.value as SearchRequest["cabin"])
              }
            >
              {CABIN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="market">Point of sale</Label>
            <Select
              id="market"
              value={value.regionalMarket}
              onChange={(event) =>
                update(
                  "regionalMarket",
                  event.target.value as SearchRequest["regionalMarket"]
                )
              }
            >
              {MARKET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Display currency</Label>
            <Select
              id="currency"
              value={value.displayCurrency}
              onChange={(event) =>
                update(
                  "displayCurrency",
                  event.target.value as SearchRequest["displayCurrency"]
                )
              }
            >
              {CURRENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <div className="flex items-start justify-between rounded-3xl border border-border/70 bg-secondary/50 p-4">
            <div>
              <p className="text-sm font-semibold text-primary">Nearby airports</p>
              <p className="text-sm text-muted-foreground">
                Expand metro areas like NYC and LON for cheaper alternates.
              </p>
            </div>
            <Switch
              checked={value.nearbyAirports}
              onCheckedChange={(checked) => update("nearbyAirports", checked)}
            />
          </div>
          <div className="flex items-start justify-between rounded-3xl border border-border/70 bg-secondary/50 p-4">
            <div>
              <p className="text-sm font-semibold text-primary">Mix one-way tickets</p>
              <p className="text-sm text-muted-foreground">
                Surface split-ticket round trips that may save money but lower protection.
              </p>
            </div>
            <Switch
              checked={value.mixAndMatchEnabled}
              onCheckedChange={(checked) => update("mixAndMatchEnabled", checked)}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-auto rounded-3xl px-6 py-4"
            disabled={isSearching}
          >
            <Search className="h-4 w-4" />
            {isSearching ? "Searching..." : "Search fares"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-white/70 bg-white/90 shadow-panel">
      {!compact ? (
        <CardHeader className="gap-3 border-b border-white/70 bg-white/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Settings2 className="h-4 w-4" />
            Search across direct airlines, OTAs, and split-ticket combinations
          </div>
          <CardTitle className="text-2xl text-primary">Search smarter, not just cheaper</CardTitle>
          <CardDescription>
            The fare list below ranks realistic trip cost and clearly explains where the tradeoffs
            come from.
          </CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className={compact ? "p-5 sm:p-6" : "p-6"}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(value);
          }}
        >
          <Tabs
            value={value.tripType}
            onValueChange={(nextValue) =>
              onChange({
                ...value,
                tripType: nextValue as SearchRequest["tripType"],
                returnDate:
                  nextValue === "oneWay" ? undefined : value.returnDate ?? value.departDate
              })
            }
          >
            <TabsList>
              <TabsTrigger value="roundTrip">Round-trip</TabsTrigger>
              <TabsTrigger value="oneWay">One-way</TabsTrigger>
            </TabsList>
            <TabsContent value="roundTrip">{renderFields(true)}</TabsContent>
            <TabsContent value="oneWay">{renderFields(false)}</TabsContent>
          </Tabs>
        </form>
      </CardContent>
    </Card>
  );
}
