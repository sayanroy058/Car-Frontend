import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-xs text-muted-foreground">Last updated: July 2026 · Demo document</p>
      <div className="prose-cards mt-8 space-y-6">
        <Section title="Overview">
          <p>
            DriveHub (“we”, “us”) is a demonstration used-car marketplace. This policy explains how
            information is handled. Because this is a front-end-only demo, all data is stored
            locally in your browser and never sent to any server.
          </p>
        </Section>
        <Section title="Information we collect">
          <ul className="list-disc space-y-1 pl-5">
            <li>Account details you enter (name, email, phone) when registering or selling.</li>
            <li>Listing details and media you submit for inspection.</li>
            <li>Preferences such as theme and wishlist, saved on your device.</li>
          </ul>
        </Section>
        <Section title="How we use information">
          <p>
            In a production build this data would be used to operate listings, process bookings, and
            provide support. In this demo it remains in your browser’s local storage to simulate the
            experience without transmitting anything.
          </p>
        </Section>
        <Section title="Data storage">
          <p>
            Data persists only in your browser under a local storage key. Clearing your browser data
            or using Settings → Reset demo data removes it entirely.
          </p>
        </Section>
        <Section title="Your rights">
          <p>
            You can view, edit, or delete your information at any time from the Profile and Settings
            pages. You may reset all demo data instantly from Settings.
          </p>
        </Section>
        <Section title="Contact">
          <p>
            Questions about this policy? Use the Contact page. This is a sample document for
            demonstration purposes only.
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
