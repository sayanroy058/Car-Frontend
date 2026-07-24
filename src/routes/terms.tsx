import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: July 2026 · Demo document</p>
      <div className="mt-8 space-y-6">
        <Section title="Acceptance of terms">
          <p>
            By using DriveHub you agree to these terms. DriveHub is a demo application provided for
            illustration only and is not a real commercial service.
          </p>
        </Section>
        <Section title="Listings & inspections">
          <p>
            Cars are submitted by sellers and undergo a simulated 200-point inspection. Pricing,
            condition, and availability shown are sample data and do not represent real offers.
          </p>
        </Section>
        <Section title="Bookings & payments">
          <p>
            Reservations and purchases in this demo create a local record only. No real payment is
            processed and no car is held or transferred. Do not enter real payment information.
          </p>
        </Section>
        <Section title="User conduct">
          <p>
            You agree to provide accurate information when listing a vehicle and to refrain from
            abusive or fraudulent activity, even within the demo environment.
          </p>
        </Section>
        <Section title="Limitation of liability">
          <p>
            DriveHub is provided “as is” without warranties. As a demonstration, it carries no
            commercial obligations or guarantees regarding listings, financing, or transactions.
          </p>
        </Section>
        <Section title="Changes">
          <p>
            These terms may be updated at any time. Continued use of the demo constitutes acceptance
            of the revised terms.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
