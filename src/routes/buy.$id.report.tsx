import { createFileRoute, Link, notFound, useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/site/Seo";
import { useApp } from "@/lib/store";
import { formatPrice } from "@/components/site/CarCard";

export const Route = createFileRoute("/buy/$id/report")({
  component: HistoryReport,
  errorComponent: ({ error }) => (
    <div className="container mx-auto p-10 text-center text-destructive">{String(error)}</div>
  ),
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Listing not found</h1>
      <Button asChild className="mt-4">
        <Link to="/buy">Back to inventory</Link>
      </Button>
    </div>
  ),
});

function HistoryReport() {
  const { id } = useParams({ from: "/buy/$id/report" });
  const { listings } = useApp();
  const listing = listings.find((l) => l.id === id);

  if (!listing) throw notFound();

  const price = listing.pricing?.finalPrice ?? listing.expectedPrice;

  const inspectionScore = useMemo(
    () => (8.6 + (listing.id.charCodeAt(0) % 10) / 20).toFixed(1),
    [listing.id],
  );

  const serviceHistory = useMemo(
    () => [
      {
        date: "Mar 2024",
        km: 42100,
        service: "Periodic service + brake fluid",
        workshop: "Authorized service center",
      },
      {
        date: "Sep 2023",
        km: 33800,
        service: "Engine oil & filter change",
        workshop: "Authorized service center",
      },
      {
        date: "Feb 2023",
        km: 24500,
        service: "Wheel alignment & balancing",
        workshop: "Multi-brand workshop",
      },
      {
        date: "Jul 2022",
        km: 14200,
        service: "1st free service",
        workshop: "Authorized service center",
      },
    ],
    [],
  );

  const defectsList = useMemo(
    () =>
      [
        {
          area: "Front bumper",
          severity: "Minor",
          note: "Light scuff on left edge — paint touch-up done.",
        },
        {
          area: "Alloy wheel (RR)",
          severity: "Minor",
          note: "Small kerb mark on rear-right alloy.",
        },
        {
          area: "Windshield",
          severity: "Minor",
          note: "Tiny stone chip on lower passenger side, sealed.",
        },
        {
          area: "Driver seat bolster",
          severity: "Moderate",
          note: "Mild wear on outer leather bolster.",
        },
      ] as const,
    [],
  );

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Seo
        title={`History report — ${listing.brand} ${listing.model} — DriveHub`}
        description="Full vehicle history report: service records, ownership, inspection score, and defects."
        canonical={`/buy/${listing.id}/report`}
      />

      <div className="print:hidden mb-4 flex items-center justify-between">
        <Link
          to="/buy/$id"
          params={{ id: listing.id }}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to listing
        </Link>
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          Print / Save as PDF
        </Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm print:border-0 print:shadow-none">
        <div className="flex items-start justify-between border-b border-border/60 pb-6">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              DriveHub Vehicle History Report
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              {listing.year} {listing.brand} {listing.model}
            </h1>
            <p className="text-sm text-muted-foreground">{listing.variant}</p>
          </div>
          <div className="text-right text-sm">
            <div className="text-muted-foreground">Report date</div>
            <div className="font-medium">{new Date().toLocaleDateString()}</div>
            <div className="mt-2 text-muted-foreground">VIN</div>
            <div className="font-mono text-xs">{listing.vin || "—"}</div>
          </div>
        </div>

        <Section title="Vehicle summary">
          <Grid
            items={[
              ["Registration", `${listing.registrationYear} · ${listing.registrationState}`],
              ["Kilometers", `${listing.kmDriven.toLocaleString()} km`],
              ["Fuel type", listing.fuelType],
              ["Transmission", listing.transmission],
              ["Ownership", listing.ownership],
              ["Insurance", listing.insuranceStatus],
              ["Road tax", listing.roadTaxStatus],
              ["Final price", formatPrice(price)],
            ]}
          />
        </Section>

        <Section title="Inspection score">
          <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
            <ShieldCheck className="h-8 w-8 text-success" />
            <div>
              <div className="text-2xl font-bold text-success">{inspectionScore}/10</div>
              <div className="text-xs text-muted-foreground">
                200-point inspection by certified engineers
              </div>
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              ["Exterior body", listing.exteriorCondition],
              ["Interior & upholstery", listing.interiorCondition],
              ["Engine & transmission", listing.engineCondition],
              ["Tires & wheels", listing.tireCondition],
              ["Battery & electricals", listing.batteryCondition],
              ["Service history", listing.serviceHistory],
            ].map(([label, status]) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-lg border border-border/60 p-3 text-sm"
              >
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">{label}</span>
                <span className="ml-auto font-medium">{status}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Ownership & accident history">
          <Grid
            items={[
              ["Ownership", listing.ownership],
              ["Accident history", listing.accidentHistory],
              ["Modifications", listing.modifications],
              ["Keys available", String(listing.keys)],
            ]}
          />
        </Section>

        <Section title="Service history">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="pb-2">Date</th>
                <th className="pb-2">KM</th>
                <th className="pb-2">Service</th>
                <th className="pb-2">Workshop</th>
              </tr>
            </thead>
            <tbody>
              {serviceHistory.map((s, i) => (
                <tr key={i} className="border-t border-border/60">
                  <td className="py-2">{s.date}</td>
                  <td className="py-2">{s.km.toLocaleString()}</td>
                  <td className="py-2">{s.service}</td>
                  <td className="py-2 text-muted-foreground">{s.workshop}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Defects summary">
          <div className="space-y-2">
            {defectsList.map((d, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-border/60 p-3 text-sm"
              >
                <div
                  className={`mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full ${
                    d.severity === "Minor"
                      ? "bg-success/15 text-success"
                      : "bg-warning/15 text-warning"
                  }`}
                >
                  {d.severity === "Minor" ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                </div>
                <div>
                  <span className="font-medium">{d.area}</span>
                  <span className="ml-2 text-xs text-muted-foreground">({d.severity})</span>
                  <p className="text-muted-foreground">{d.note}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <div className="mt-6 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
          This report was generated by DriveHub on {new Date().toLocaleDateString()}. This is a demo
          document and does not represent a legal vehicle history certificate.
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Grid({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k} className="flex justify-between border-b border-border/60 py-2 text-sm">
          <span className="text-muted-foreground">{k}</span>
          <span className="text-right font-medium">{v}</span>
        </div>
      ))}
    </div>
  );
}
