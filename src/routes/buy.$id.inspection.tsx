import { createFileRoute, Link, notFound, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Seo } from "@/components/site/Seo";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/buy/$id/inspection")({
  component: InspectionReport,
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Report not found</h1>
      <Button asChild className="mt-4">
        <Link to="/buy">Back to inventory</Link>
      </Button>
    </div>
  ),
});

const INSPECTION_STAGES = [
  { label: "Vehicle intake & documentation", pct: 100, done: true, inProgress: false },
  { label: "Mechanical inspection", pct: 100, done: true, inProgress: false },
  { label: "Electrical & diagnostics", pct: 100, done: true, inProgress: false },
  { label: "Cosmetic & body inspection", pct: 80, done: false, inProgress: true },
  { label: "Road test", pct: 0, done: false, inProgress: false },
  { label: "Final QC & certification", pct: 0, done: false, inProgress: false },
];

const DEFECT_TRACKER = [
  { area: "Front bumper scuff", status: "Resolved" as const },
  { area: "Rear-right alloy kerb mark", status: "Resolved" as const },
  { area: "Driver seat bolster wear", status: "In progress" as const },
  { area: "Windshield stone chip", status: "Resolved" as const },
];

const SECTIONS: {
  title: string;
  items: { label: string; status: string; pct: number; note?: string }[];
}[] = [
  {
    title: "Engine & transmission",
    items: [
      {
        label: "Engine start & idle",
        status: "Excellent",
        pct: 96,
        note: "Smooth cold start, no abnormal noise.",
      },
      {
        label: "Engine oil condition",
        status: "Good",
        pct: 88,
        note: "Clear, within service interval.",
      },
      {
        label: "Transmission shifting",
        status: "Excellent",
        pct: 95,
        note: "Crisp shifts in all gears.",
      },
      { label: "Clutch / torque converter", status: "Very Good", pct: 90 },
      { label: "Exhaust emissions", status: "Pass", pct: 92 },
    ],
  },
  {
    title: "Suspension, brakes & steering",
    items: [
      { label: "Front suspension", status: "Very Good", pct: 87 },
      { label: "Rear suspension", status: "Very Good", pct: 88 },
      { label: "Brake pads (F/R)", status: "Good", pct: 74, note: "~40% pad life remaining." },
      { label: "Brake discs", status: "Good", pct: 80 },
      { label: "Steering alignment", status: "Excellent", pct: 95 },
    ],
  },
  {
    title: "Exterior & body",
    items: [
      {
        label: "Paint thickness uniformity",
        status: "Good",
        pct: 84,
        note: "Minor repaint on front bumper.",
      },
      { label: "Panel gaps", status: "Excellent", pct: 96 },
      { label: "Glass & windshield", status: "Good", pct: 88 },
      { label: "Lights & indicators", status: "Excellent", pct: 98 },
    ],
  },
  {
    title: "Interior, AC & electricals",
    items: [
      { label: "Upholstery & trims", status: "Very Good", pct: 90 },
      { label: "AC cooling performance", status: "Excellent", pct: 96 },
      { label: "Infotainment & speakers", status: "Excellent", pct: 95 },
      { label: "All power windows", status: "Excellent", pct: 97 },
      { label: "Battery health", status: "Good", pct: 82 },
    ],
  },
  {
    title: "Tires & wheels",
    items: [
      { label: "Tire tread (avg.)", status: "Good", pct: 72, note: "~5.2 mm remaining." },
      { label: "Tire age", status: "Good", pct: 80 },
      { label: "Alloy wheel condition", status: "Good", pct: 78, note: "Minor kerb mark on RR." },
      { label: "Spare wheel", status: "Excellent", pct: 95 },
    ],
  },
];

function InspectionReport() {
  const { id } = useParams({ from: "/buy/$id/inspection" });
  const { listings } = useApp();
  const listing = listings.find((l) => l.id === id);
  if (!listing) throw notFound();

  const total = SECTIONS.reduce((a, s) => a + s.items.reduce((x, i) => x + i.pct, 0), 0);
  const count = SECTIONS.reduce((a, s) => a + s.items.length, 0);
  const overall = (total / count / 10).toFixed(1);

  return (
    <div className="container mx-auto px-4 py-8">
      <Seo
        title={`Inspection report — ${listing.brand} ${listing.model} — DriveHub`}
        description="200-point inspection report with detailed checks across all vehicle systems."
        canonical={`/buy/${listing.id}/inspection`}
      />
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
            200-point inspection
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Inspection Report</h1>
          <p className="text-muted-foreground">
            {listing.year} {listing.brand} {listing.model} · {listing.variant}
          </p>
          <p className="text-xs text-muted-foreground">
            VIN {listing.vin} · {listing.registrationCity}, {listing.registrationState}
          </p>
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

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-success/30 bg-success/5 p-5 md:col-span-1">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-success" /> Overall score
          </div>
          <div className="mt-2 font-display text-5xl font-bold text-success">
            {overall}
            <span className="text-xl text-muted-foreground">/10</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {count} checkpoints across {SECTIONS.length} systems
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 md:col-span-2">
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <Stat label="Inspector" value="Certified Engineer" />
            <Stat label="Inspected on" value="22 Jun 2026" />
            <Stat label="Location" value={listing.registrationCity} />
            <Stat label="Odometer" value={`${listing.kmDriven.toLocaleString()} km`} />
          </div>
          <Separator className="my-4" />
          <p className="text-xs text-muted-foreground">
            This report covers mechanical, electrical, structural and cosmetic checks. Each item is
            graded by a certified engineer using calibrated tools. Defects flagged here are mirrored
            on the Defects page.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="mb-4 font-display text-sm font-semibold">Inspection stages</h2>
        <div className="space-y-3">
          {INSPECTION_STAGES.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div
                className={`grid h-8 w-8 flex-none place-items-center rounded-full ${
                  s.done
                    ? "bg-success/15 text-success"
                    : s.inProgress
                      ? "bg-primary/15 text-primary"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {s.done ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : s.inProgress ? (
                  <Wrench className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{s.label}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {s.done ? "Done" : s.inProgress ? "In progress" : "Pending"}
                  </Badge>
                </div>
                <Progress value={s.pct} className="mt-1.5 h-1.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="mb-4 font-display text-sm font-semibold">Defect resolution tracker</h2>
        <div className="space-y-2">
          {DEFECT_TRACKER.map((d) => (
            <div
              key={d.area}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 p-3 text-sm"
            >
              <span className="font-medium">{d.area}</span>
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  d.status === "Resolved"
                    ? "border-success/40 text-success"
                    : d.status === "In progress"
                      ? "border-primary/40 text-primary"
                      : "border-warning/40 text-warning"
                }`}
              >
                {d.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {SECTIONS.map((sec) => (
          <section key={sec.title} className="rounded-2xl border border-border/60 bg-card p-5">
            <h2 className="text-lg font-semibold">{sec.title}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {sec.items.map((it) => (
                <div key={it.label} className="rounded-xl border border-border/60 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      {it.label}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {it.status}
                    </Badge>
                  </div>
                  <Progress value={it.pct} className="mt-2 h-1.5" />
                  {it.note && <p className="mt-2 text-xs text-muted-foreground">{it.note}</p>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/buy/$id" params={{ id: listing.id }}>
            Back to details
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/buy/$id/defects" params={{ id: listing.id }}>
            View defects report
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}
