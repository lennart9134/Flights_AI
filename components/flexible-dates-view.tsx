import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FlexibleDateCell, SearchRequest } from "@/lib/flights/types";
import { formatCompactDate, formatCurrency } from "@/lib/utils";

interface FlexibleDatesViewProps {
  cells: FlexibleDateCell[];
  request: SearchRequest;
}

function FlexibleDatePill({
  cell,
  currency
}: {
  cell: FlexibleDateCell;
  currency: string;
}) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-[rgba(247,245,239,0.96)] p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">
            {formatCompactDate(cell.departDate)}
            {cell.returnDate ? ` → ${formatCompactDate(cell.returnDate)}` : ""}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Fare {formatCurrency(cell.farePrice, currency)}
          </p>
        </div>
        {cell.bestTag ? (
          <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white shadow-soft">
            {cell.bestTag === "lowestTotal" ? "Lowest total" : "Lowest fare"}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-2xl font-semibold text-primary">
        {formatCurrency(cell.totalPrice, currency)}
      </p>
    </div>
  );
}

export function FlexibleDatesView({ cells, request }: FlexibleDatesViewProps) {
  const sortedCells = [...cells].sort((left, right) => left.totalPrice - right.totalPrice);

  return (
    <Card className="border-primary/10 bg-[rgba(255,255,255,0.9)] shadow-soft">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Flexible dates</CardTitle>
        <CardDescription>
          Shift the trip slightly to spot lower realistic totals without re-running the whole
          search.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sortedCells.slice(0, request.tripType === "roundTrip" ? 9 : 7).map((cell) => (
            <FlexibleDatePill
              key={`${cell.departDate}-${cell.returnDate ?? "one-way"}`}
              cell={cell}
              currency={request.displayCurrency}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
