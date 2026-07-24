import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, ScanLine, ShieldCheck, Truck, Wrench } from "lucide-react";
import { Seo } from "@/components/site/Seo";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <div>
      <Seo
        title="About DriveHub — Trusted Used Car Marketplace"
        description="DriveHub inspects every car on 200+ points, refurbishes in-house, and prices transparently."
        canonical="/about"
      />
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="container relative mx-auto px-4 py-20 text-white">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            A used car marketplace built on <span className="gradient-text">trust</span>.
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            We inspect every car on 200+ points, refurbish in-house, and price transparently. No
            hidden fees, no haggling.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {[
            { i: ScanLine, t: "1. Submit", d: "Tell us about your car." },
            { i: ShieldCheck, t: "2. Inspect", d: "Free at-home 200-point inspection." },
            { i: Wrench, t: "3. Refurbish", d: "We detail, repair, and certify." },
            { i: BadgeCheck, t: "4. List", d: "Transparent pricing on our marketplace." },
            { i: Truck, t: "5. Deliver", d: "Doorstep delivery, 7-day returns." },
          ].map((s) => (
            <div key={s.t} className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <s.i className="h-6 w-6 text-primary" />
              <h3 className="mt-3 text-base font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold tracking-tight">Our mission</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We started DriveHub because buying a used car shouldn't feel like a gamble. Every car
              on our platform passes a rigorous 200-point inspection, gets refurbished by certified
              technicians, and is priced with full cost transparency — including refurbishment,
              transportation, and platform margin.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              For sellers, we make it effortless: book an at-home inspection, get a verified offer,
              and receive payment within 48 hours.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              ["12k+", "Cars sold"],
              ["98%", "Customer satisfaction"],
              ["48h", "Average sale time"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                <div className="text-3xl font-bold gradient-text">{n}</div>
                <div className="mt-1 text-sm text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
