"use client";

import { useEffect, useState } from "react";
import { CalendarRange, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SavedSearchRecord, SearchRequest } from "@/lib/flights/types";
import { formatCompactDate } from "@/lib/utils";

interface SavedSearchesPanelProps {
  currentRequest?: SearchRequest;
  savedSearches: SavedSearchRecord[];
  onSave?: (name: string) => Promise<void>;
  onApply?: (savedSearch: SavedSearchRecord) => void;
  isSaving?: boolean;
  showSaveForm?: boolean;
}

export function SavedSearchesPanel({
  currentRequest,
  savedSearches,
  onSave,
  onApply,
  isSaving = false,
  showSaveForm = true
}: SavedSearchesPanelProps) {
  const [name, setName] = useState(
    currentRequest ? `${currentRequest.origin} to ${currentRequest.destination} watchlist` : ""
  );

  useEffect(() => {
    if (currentRequest) {
      setName(`${currentRequest.origin} to ${currentRequest.destination} watchlist`);
    }
  }, [currentRequest]);

  return (
    <Card className="border-white/70 bg-white/75">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Saved searches</CardTitle>
        <CardDescription>
          Keep important routes handy and re-run them when you want.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSaveForm && onSave && currentRequest ? (
          <form
            className="flex gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              await onSave(name);
            }}
          >
            <Input value={name} onChange={(event) => setName(event.target.value)} />
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            Run a flight search from the homepage to save a new route.
          </p>
        )}

        <div className="space-y-3">
          {savedSearches.map((search) => (
            <div
              key={search.id}
              className="flex w-full items-start justify-between rounded-3xl border border-border/70 bg-white/85 p-4 text-left"
            >
              <div>
                <p className="text-sm font-semibold text-primary">{search.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search.origin} → {search.destination}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <CalendarRange className="h-4 w-4" />
                <span>
                  {formatCompactDate(search.departDate)}
                  {search.returnDate ? ` → ${formatCompactDate(search.returnDate)}` : ""}
                </span>
                {onApply ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onApply(search)}
                  >
                    Load
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
