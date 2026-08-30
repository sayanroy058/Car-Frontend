import {
  createFileRoute,
  Link,
  notFound,
  useParams,
} from "@tanstack/react-router";
import { CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/site/Seo";
import { useListing } from "@/lib/useListing";
import { formatPrice } from "@/components/site/CarCard";
import { maskRegistrationNumber } from "@/lib/regions";

export const Route = createFileRoute("/buy/$id/report")({
  component: HistoryReport,
  errorComponent: ({ error }) => (
    <div className="container mx-auto p-10 text-center text-destructive">
      {String(error)}
    </div>
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

/**
 * Printable summary of a listing.
 *
 * Everything here is either stored on the listing or derived from it. The
 * previous version presented a fabricated inspection score (derived from the
 * listing id), a fixed service log and a fixed defect list — identical for every
 * car — as if they were real records. There is no inspection programme yet, so
 * this is now explicitly a seller declaration rather than a certificate.
 */
function HistoryReport() {
  const { id } = useParams({ from: "/buy/$id/report" });
  // Fetches the listing when the store hasn't loaded yet, so a refresh or a
  // shared link no longer renders "not found" before data arrives.
  const { listing, isLoading, notFound: missing } = useListing(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Loading report…
      </div>
    );
  }
  if (missing || !listing) throw notFound();

  const price = listing.pricing?.finalPrice ?? listing.expectedPrice;
  const specs: Array<[string, string]> = [
    [
      "Engine",
      listing.displacementCc
        ? `${listing.displacementCc} cc`
        : "Electric motor",
    ],
    [
      "Max power",
      listing.maxPowerBhp
        ? listing.maxPowerRpm
          ? `${listing.maxPowerBhp} bhp @ ${listing.maxPowerRpm.toLocaleString("en-IN")} rpm`
          : `${listing.maxPowerBhp} bhp`
        : "—",
    ],
    [
      "Max torque",
      listing.maxTorqueNm
        ? listing.maxTorqueRpm
          ? `${listing.maxTorqueNm} Nm @ ${listing.maxTorqueRpm.toLocaleString("en-IN")} rpm`
          : `${listing.maxTorqueNm} Nm`
        : "—",
    ],
    ["Drivetrain", listing.driveTrain ?? "—"],
    [
      "Mileage (claimed)",
      listing.mileageKmpl ? `${listing.mileageKmpl} kmpl` : "—",
    ],
    ["Airbags", listing.airbags != null ? String(listing.airbags) : "—"],
    ["Seating", listing.seating ? `${listing.seating} adults` : "—"],
    ["Boot space", listing.bootSpaceL ? `${listing.bootSpaceL} L` : "—"],
    ["Fuel tank", listing.fuelTankL ? `${listing.fuelTankL} L` : "—"],
  ];

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Seo
        title={`Vehicle summary — ${listing.brand} ${listing.model} — DriveHub`}
        description="Seller-declared vehicle summary: registration, specifications, condition and declared defects."
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
              DriveHub vehicle summary
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              {listing.year} {listing.brand} {listing.model}
            </h1>
            <p className="text-sm text-muted-foreground">{listing.variant}</p>
          </div>
          <div className="text-right text-sm">
            <div className="text-muted-foreground">Generated</div>
            <div className="font-medium">{new Date().toLocaleDateString()}</div>
            <div className="mt-2 text-muted-foreground">Registration</div>
            <div className="font-mono text-xs">
              {maskRegistrationNumber(listing.registrationNumber) || "—"}
            </div>
          </div>
        </div>
        <Section title="Vehicle summary">
          <Grid
            items={[
              ["Registration year", String(listing.registrationYear)],
              [
                "Registered in",
                `${listing.registrationCity}, ${listing.registrationState}`,
              ],
              ["Kilometers", `${listing.kmDriven.toLocaleString("en-IN")} km`],
              ["Fuel type", listing.fuelType],
              ["Transmission", listing.transmission],
              ["Ownership", listing.ownership],
              ["Insurance", listing.insuranceStatus],
              ["Road tax", listing.roadTaxStatus],
              ["VIN / Chassis", listing.vin || "—"],
              ["Listed price", formatPrice(price)],
            ]}
          />
        </Section>
        <Section title="Specifications">
          <Grid items={specs} />
        </Section>
        ];
        <Section title="Condition as declared by the seller">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Exterior body", listing.exteriorCondition],
              ["Interior & upholstery", listing.interiorCondition],
              ["Engine & transmission", listing.engineCondition],
              ["Tires & wheels", listing.tireCondition],
              ["Battery & electricals", listing.batteryCondition],
              ["Service history", listing.serviceHistory],
              ["Accident history", listing.accidentHistory],
              ["Modifications", listing.modifications],
            ].map(([label, status]) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-lg border border-border/60 p-3 text-sm"
              >
                <CheckCircle2 className="h-4 w-4 flex-none text-muted-foreground" />
                <span className="text-muted-foreground">{label}</span>
                <span className="ml-auto text-right font-medium">
                  {status || "Not stated"}
                </span>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Declared defects">
          {listing.defects?.trim() ? (
            <p className="rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm">
              {listing.defects}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              The seller has not declared any defects.
            </p>
          )}
        </Section>
        <Section title="Declared features">
          {listing.highlights?.length ? (
            <div className="flex flex-wrap gap-2">
              {listing.highlights.map((h) => (
                <span
                  key={h}
                  className="rounded-full border border-border/60 px-2.5 py-1 text-xs"
                >
                  {h}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No features declared.
            </p>
          )}
        </Section>
        <div className="mt-6 flex gap-3 rounded-xl border border-border/60 bg-secondary/30 p-4 text-xs text-muted-foreground">
          <FileText className="h-4 w-4 flex-none" />
          <p>
            This summary reproduces information provided by the seller and has
            not been independently verified. It is not a vehicle history
            certificate. Ask us to arrange an independent pre-delivery
            inspection (PDI) before you buy.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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
        <div
          key={k}
          className="flex justify-between border-b border-border/60 py-2 text-sm"
        >
          <span className="text-muted-foreground">{k}</span>
          <span className="text-right font-medium">{v}</span>
        </div>
      ))}
    </div>
  );
}
