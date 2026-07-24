import { createFileRoute, Link, notFound, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wrench,
  Download,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/buy/$id/defects")({
  component: DefectsReport,
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Report not found</h1>
      <Button asChild className="mt-4">
        <Link to="/buy">Back to inventory</Link>
      </Button>
    </div>
  ),
});

type Severity = "Minor" | "Moderate" | "Major";

const DEFECTS: {
  area: string;
  category: string;
  severity: Severity;
  note: string;
  action: string;
  cost: string;
}[] = [
  {
    area: "Front bumper",
    category: "Exterior",
    severity: "Minor",
    note: "Light scuff on left edge — paint touch-up completed.",
    action: "Cosmetic touch-up done",
    cost: "Included",
  },
  {
    area: "Alloy wheel (RR)",
    category: "Wheels",
    severity: "Minor",
    note: "Small kerb mark on rear-right alloy.",
    action: "Refurbished",
    cost: "Included",
  },
  {
    area: "Windshield",
    category: "Glass",
    severity: "Minor",
    note: "Tiny stone chip on lower passenger side, resin sealed.",
    action: "Sealed, monitor only",
    cost: "Included",
  },
  {
    area: "Driver seat bolster",
    category: "Interior",
    severity: "Moderate",
    note: "Mild wear on outer leather bolster.",
    action: "Re-stitched",
    cost: "Included",
  },
  {
    area: "Tail-lamp cluster",
    category: "Lighting",
    severity: "Minor",
    note: "Hairline scratch on lens; no cracks, fully functional.",
    action: "No action needed",
    cost: "—",
  },
  {
    area: "Underbody shield",
    category: "Underbody",
    severity: "Minor",
    note: "Surface rust on exhaust heat shield.",
    action: "Cleaned and anti-rust coated",
    cost: "Included",
  },
  {
    area: "Front brake pads",
    category: "Brakes",
    severity: "Moderate",
    note: "Approx. 40% pad life remaining.",
    action: "Recommend replacement within 5,000 km",
    cost: "₹4,500 (est.)",
  },
  {
    area: "12V battery",
    category: "Electricals",
    severity: "Minor",
    note: "Health at 82%. Expected ~12 months remaining.",
    action: "Monitor, replace as needed",
    cost: "₹6,800 (est.)",
  },
];

const SEV_META: Record<Severity, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  Minor: { bg: "bg-success/15", text: "text-success", icon: CheckCircle2 },
  Moderate: { bg: "bg-warning/15", text: "text-warning", icon: AlertTriangle },
  Major: { bg: "bg-destructive/15", text: "text-destructive", icon: XCircle },
};

function DefectsReport() {
  const { id } = useParams({ from: "/buy/$id/defects" });
  const { listings } = useApp();
  const listing = listings.find((l) => l.id === id);
  const [filter, setFilter] = useState<"All" | Severity>("All");

  if (!listing) throw notFound();

  const counts = useMemo(
    () => ({
      Minor: DEFECTS.filter((d) => d.severity === "Minor").length,
      Moderate: DEFECTS.filter((d) => d.severity === "Moderate").length,
      Major: DEFECTS.filter((d) => d.severity === "Major").length,
    }),
    [],
  );
  const filtered = filter === "All" ? DEFECTS : DEFECTS.filter((d) => d.severity === filter);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/buy/$id"
        params={{ id: listing.id }}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to car details
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="secondary" className="mb-2">
            Full transparency
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Defects Report</h1>
          <p className="text-muted-foreground">
            {listing.year} {listing.brand} {listing.model} · {listing.variant}
          </p>
          <p className="text-xs text-muted-foreground">VIN {listing.vin}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Minor" value={counts.Minor} tone="success" />
        <SummaryCard label="Moderate" value={counts.Moderate} tone="warning" />
        <SummaryCard label="Major" value={counts.Major} tone="destructive" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["All", "Minor", "Moderate", "Major"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
          >
            {f}
            {f !== "All" && ` (${counts[f]})`}
          </Button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {filtered.map((d, i) => {
          const meta = SEV_META[d.severity];
          const Icon = meta.icon;
          return (
            <div key={i} className="rounded-2xl border border-border/60 bg-card p-5">
              <div className="flex items-start gap-3">
                <div
                  className={`grid h-9 w-9 flex-none place-items-center rounded-full ${meta.bg} ${meta.text}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-base font-semibold">{d.area}</div>
                      <div className="text-xs text-muted-foreground">{d.category}</div>
                    </div>
                    <Badge variant="outline" className={meta.text}>
                      {d.severity}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{d.note}</p>
                  <Separator className="my-3" />
                  <div className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Wrench className="mt-0.5 h-4 w-4 text-primary" />
                      <span>
                        <span className="text-muted-foreground">Action: </span>
                        {d.action}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Est. cost: </span>
                      <span className="font-medium">{d.cost}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-card p-10 text-center text-sm text-muted-foreground">
            No defects in this category.
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/buy/$id" params={{ id: listing.id }}>
            Back to details
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/buy/$id/inspection" params={{ id: listing.id }}>
            View inspection report
          </Link>
        </Button>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warning" | "destructive";
}) {
  const cls =
    tone === "success"
      ? "border-success/30 bg-success/5 text-success"
      : tone === "warning"
        ? "border-warning/30 bg-warning/5 text-warning"
        : "border-destructive/30 bg-destructive/5 text-destructive";
  return (
    <div className={`rounded-2xl border p-5 ${cls}`}>
      <div className="text-xs uppercase tracking-wider opacity-80">{label} issues</div>
      <div className="mt-1 text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
