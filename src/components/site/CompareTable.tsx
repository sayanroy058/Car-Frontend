import { Link } from "@tanstack/react-router";
import { CheckCircle2, Minus, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/store";
import { formatPrice, formatPriceShort } from "@/components/site/CarCard";
import type { Listing } from "@/lib/types";

type Row = {
  key: string;
  label: string;
  get: (l: Listing) => string | number;
  better?: "min" | "max";
  format?: (v: number, l: Listing) => string;
};

const ROWS: Row[] = [
  {
    key: "price",
    label: "Final price",
    get: (l) => l.pricing?.finalPrice ?? l.expectedPrice,
    better: "min",
    format: (v) => formatPrice(v),
  },
  { key: "year", label: "Year", get: (l) => l.year, better: "max" },
  {
    key: "km",
    label: "Kilometers",
    get: (l) => l.kmDriven,
    better: "min",
    format: (v) => `${v.toLocaleString()} km`,
  },
  { key: "fuel", label: "Fuel", get: (l) => l.fuelType },
  { key: "trans", label: "Transmission", get: (l) => l.transmission },
  { key: "body", label: "Body type", get: (l) => l.bodyType },
  { key: "own", label: "Ownership", get: (l) => l.ownership },
  { key: "city", label: "Location", get: (l) => `${l.registrationCity}, ${l.registrationState}` },
  { key: "ext", label: "Exterior", get: (l) => l.exteriorCondition },
  { key: "int", label: "Interior", get: (l) => l.interiorCondition },
  { key: "eng", label: "Engine", get: (l) => l.engineCondition },
  { key: "tires", label: "Tires", get: (l) => l.tireCondition },
  { key: "battery", label: "Battery", get: (l) => l.batteryCondition },
  { key: "insurance", label: "Insurance", get: (l) => l.insuranceStatus },
  { key: "keys", label: "Keys", get: (l) => l.keys, better: "max" },
];

export function CompareTable({ listings }: { listings: Listing[] }) {
  const { toggleCompare } = useApp();
  if (listings.length === 0) return null;

  const bestFor = (row: Row): number | null => {
    if (!row.better) return null;
    const vals = listings.map((l) => Number(row.get(l))).filter((n) => !Number.isNaN(n));
    if (vals.length === 0) return null;
    return row.better === "min" ? Math.min(...vals) : Math.max(...vals);
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border/60">
            <th className="w-44 p-4 text-left align-bottom text-xs uppercase tracking-wider text-muted-foreground">
              Compare
            </th>
            {listings.map((l) => {
              const price = l.pricing?.finalPrice ?? l.expectedPrice;
              return (
                <th key={l.id} className="border-l border-border/40 p-4 text-left align-bottom">
                  <Link to="/buy/$id" params={{ id: l.id }} className="block">
                    <img
                      src={l.images[0]}
                      alt=""
                      className="mb-3 h-24 w-full rounded-lg object-cover"
                    />
                    <div className="font-semibold leading-tight">
                      {l.year} {l.brand} {l.model}
                    </div>
                    <div className="text-xs text-muted-foreground">{l.variant}</div>
                    <div className="mt-1 text-base font-bold tracking-tight gradient-text">
                      {formatPriceShort(price)}
                    </div>
                  </Link>
                  <button
                    onClick={() => toggleCompare(l.id)}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" /> Remove
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const best = bestFor(row);
            return (
              <tr key={row.key} className="border-b border-border/40 last:border-0">
                <td className="p-4 text-muted-foreground">{row.label}</td>
                {listings.map((l) => {
                  const raw = row.get(l);
                  const num = Number(raw);
                  const isBest = best !== null && !Number.isNaN(num) && num === best;
                  const display =
                    row.format && !Number.isNaN(num) ? row.format(num, l) : String(raw);
                  return (
                    <td
                      key={l.id}
                      className={`border-l border-border/40 p-4 ${isBest ? "bg-success/10" : ""}`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {isBest && <Trophy className="h-3.5 w-3.5 text-success" />}
                        <span className={isBest ? "font-semibold" : ""}>{display}</span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function CompareBanner() {
  const { compare, listings, toggleCompare, clearCompare } = useApp();
  const cars = listings.filter((l) => compare.includes(l.id));
  if (cars.length === 0) return null;
  return (
    <div className="sticky bottom-4 z-30 mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-background/90 p-3 shadow-lg backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-gradient-to-r from-primary to-accent border-0">
          {cars.length}/3 selected
        </Badge>
        {cars.map((l) => (
          <span
            key={l.id}
            className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card px-2 py-1 text-xs"
          >
            {l.brand} {l.model}
            <button
              onClick={() => toggleCompare(l.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button asChild size="sm" disabled={cars.length < 2}>
          <Link to="/compare">Compare {cars.length} cars</Link>
        </Button>
        <Button size="sm" variant="ghost" onClick={clearCompare}>
          <Minus className="mr-1 h-3 w-3" />
          Clear
        </Button>
      </div>
    </div>
  );
}

export { CheckCircle2 };
