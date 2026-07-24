import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Banknote, CheckCircle2, Landmark, Percent, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EmiCalculator } from "@/components/site/EmiCalculator";
import { Seo } from "@/components/site/Seo";

export const Route = createFileRoute("/finance")({
  component: FinancePage,
});

const PARTNERS = [
  { name: "HDFC Bank", rate: "8.9% p.a.", max: "₹50 L", logo: "HB" },
  { name: "ICICI Bank", rate: "9.2% p.a.", max: "₹40 L", logo: "IC" },
  { name: "Axis Finance", rate: "9.5% p.a.", max: "₹35 L", logo: "AX" },
  { name: "Kotak Mahindra", rate: "9.1% p.a.", max: "₹45 L", logo: "KM" },
  { name: "Bajaj Finserv", rate: "10.5% p.a.", max: "₹30 L", logo: "BF" },
  { name: "SBFC", rate: "11.0% p.a.", max: "₹25 L", logo: "SB" },
];

function FinancePage() {
  const [price, setPrice] = useState(2500000);

  return (
    <div>
      <Seo
        title="Finance & EMI — DriveHub"
        description="Calculate your EMI and compare car loan partners. Financing in minutes."
        canonical="/finance"
      />
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="container relative mx-auto px-4 py-20 text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs backdrop-blur">
            <Banknote className="h-3.5 w-3.5 text-accent" />
            Financing in minutes
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            Drive now, pay over <span className="gradient-text">time</span>.
          </h1>
          <p className="mt-4 max-w-xl text-white/70">
            Pre-approved EMI from 12+ lenders. Transparent rates, no hidden charges, approval while
            you browse. Down payments from 0% on select cars.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/buy">Find your car</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/sell">Sell your car</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">EMI calculator</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Adjust the car price and your loan terms to estimate monthly payments.
            </p>
            <div className="mt-4">
              <Label className="mb-1.5 inline-block">Car price (₹)</Label>
              <Input
                type="number"
                value={price}
                min={100000}
                step={50000}
                onChange={(e) => setPrice(Math.max(0, +e.target.value))}
              />
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <EmiCalculator price={price} />
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold tracking-tight">Eligibility & documents</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { i: CheckCircle2, t: "Age 21–65", d: "Salaried or self-employed Indian resident." },
            {
              i: Percent,
              t: "Income",
              d: "Monthly income ₹25,000+ (or equivalent business turnover).",
            },
            {
              i: ShieldCheck,
              t: "Documents",
              d: "PAN, Aadhaar, last 3 payslips / 2-yr ITR, bank statements.",
            },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <x.i className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{x.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold tracking-tight">Lending partners</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare indicative rates. Final rate depends on your credit profile.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PARTNERS.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                {p.logo}
              </div>
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">
                  From {p.rate} · up to {p.max}
                </div>
              </div>
              <Landmark className="ml-auto h-5 w-5 text-muted-foreground" />
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold tracking-tight">Financing FAQ</h2>
          <Accordion type="single" collapsible className="mt-6">
            {[
              {
                q: "How fast is approval?",
                a: "Most pre-approvals are instant. Final disbursal typically within 24–48 hours after document verification.",
              },
              {
                q: "Is there a down payment?",
                a: "Down payment starts from 0% on select cars and typically ranges 10–30%. A larger down payment lowers your EMI and interest.",
              },
              {
                q: "Can I prepay or foreclose?",
                a: "Yes. Most partners allow foreclosure after 6 EMIs, with nominal charges as per RBI norms.",
              },
              {
                q: "Do I need a co-applicant?",
                a: "Not mandatory, but a co-applicant can improve eligibility and the approved loan amount.",
              },
            ].map((x, i) => (
              <AccordionItem key={i} value={`f-${i}`}>
                <AccordionTrigger className="text-left text-base">{x.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{x.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
