import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Car,
  ChevronRight,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
  Quote,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  Zap,
  HeartHandshake,
  Gauge,
  Calculator,
} from "lucide-react";
import heroCar from "@/assets/hero-car.jpg";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useApp } from "@/lib/store";
import { CarCard, formatPriceShort } from "@/components/site/CarCard";
import { Seo } from "@/components/site/Seo";
import { Badge } from "@/components/ui/badge";
import { BRANDS, BODY_TYPES } from "@/lib/constants";

export const Route = createFileRoute("/")({
  component: Landing,
});

/* ------------------------------------------------------------------ */
/* Reveal-on-scroll wrapper                                            */
/* ------------------------------------------------------------------ */
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className || ""}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
function Landing() {
  const { listings } = useApp();
  const nav = useNavigate();
  const featured = listings.filter((l) => l.status === "listed").slice(0, 6);
  const heroListing = featured[0] ?? listings[0];
  const spotlight = featured[1] ?? featured[0];

  const [brand, setBrand] = useState("");
  const [body, setBody] = useState("");
  const [budget, setBudget] = useState("");

  function search() {
    nav({
      to: "/buy",
      search: {
        brand: brand ? [brand] : undefined,
        body: body ? [body] : undefined,
        budget: budget || undefined,
      },
    });
  }

  const stats = [
    { value: "12k+", label: "Cars delivered", icon: Car },
    { value: "4.8/5", label: "Customer rating", icon: Star },
    { value: "200+", label: "Inspection points", icon: ShieldCheck },
    { value: "7-Day", label: "Easy returns", icon: BadgeCheck },
  ];

  const values = [
    {
      icon: ShieldCheck,
      title: "200-Point Inspection",
      desc: "Master technicians verify safety, performance, and cosmetics on every car before it's listed.",
      tone: "primary",
    },
    {
      icon: Wrench,
      title: "Refurbished In-House",
      desc: "Detailed, repaired, and photographed to showroom standards so every car feels new.",
      tone: "accent",
    },
    {
      icon: Banknote,
      title: "Instant Financing",
      desc: "Pre-approved EMI in minutes with rates starting at 7.9% APR. No paperwork marathon.",
      tone: "success",
    },
    {
      icon: BadgeCheck,
      title: "7-Day Money-Back",
      desc: "Changed your mind? Return it within seven days for a full refund — no questions asked.",
      tone: "primary",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Browse & Discover",
      desc: "Explore certified inventory with transparent pricing and detailed inspection reports.",
      icon: Search,
    },
    {
      step: "02",
      title: "Finance & Reserve",
      desc: "Get pre-approved in minutes, reserve with a small token, and book home delivery.",
      icon: Banknote,
    },
    {
      step: "03",
      title: "Drive It Home",
      desc: "Sign digitally, take delivery, and enjoy 7 days of worry-free, money-back ownership.",
      icon: Zap,
    },
  ];

  const testimonials = [
    {
      name: "Priya R.",
      role: "Sold a hatchback",
      text: "Sold my old car in 36 hours. The inspection came to my home and payment hit my account the same day.",
      rating: 5,
    },
    {
      name: "Marcus B.",
      role: "Bought a Polestar 2",
      text: "The refurbishment was honestly better than the demo car at the dealership. Felt brand new.",
      rating: 5,
    },
    {
      name: "Lina K.",
      role: "Financed in minutes",
      text: "Financing was approved while I was still browsing. Picked up the keys two days later. Incredible.",
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: "How is the price calculated?",
      a: "We start from the seller's expected price, then add refurbishment, inspection, transport, documentation, commission, and a small margin. Every listing shows the full transparent breakdown.",
    },
    {
      q: "Do you offer financing?",
      a: "Yes. Pre-approved EMI options are available in under five minutes, with rates starting at 7.9% APR for qualified buyers.",
    },
    {
      q: "What's covered by the 7-day return?",
      a: "Any reason at all. Return the car within 7 days or 300 miles for a full refund, excluding documented minor wear charges.",
    },
    {
      q: "How do you inspect cars?",
      a: "Every vehicle passes through a 200-point inspection by certified master technicians before it ever appears on DriveHub.",
    },
  ];

  return (
    <div className="overflow-hidden">
      <Seo
        title="DriveHub — Premium Used Cars, Inspected & Refurbished"
        description="Buy and sell certified pre-owned cars. 200-point inspection, refurbished by experts, financing in minutes."
        canonical="/"
      />

      {/* ============================================================ */}
      {/* HERO                                                          */}
      {/* ============================================================ */}
      <section className="relative min-h-[92vh] overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={heroCar}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
        </div>

        {/* Glow accents */}
        <div
          className="absolute -right-40 top-0 h-[42rem] w-[42rem] rounded-full blur-3xl"
          style={{ background: "var(--gradient-glow)" }}
        />
        <div className="absolute inset-0 grid-bg opacity-20" />

        <div className="container relative z-10 mx-auto flex min-h-[92vh] flex-col justify-center px-4 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Left: copy + search */}
            <div className="max-w-2xl text-white">
              <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                12,000+ cars delivered · Rated 4.8/5
              </div>

              <h1 className="animate-fade-in-up delay-100 mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                The smartest way
                <br />
                to <span className="gradient-text">buy & sell</span>
                <br />
                pre-owned cars.
              </h1>

              <p className="animate-fade-in-up delay-200 mt-6 max-w-xl text-lg leading-relaxed text-white/75">
                Inspected, refurbished, and certified — with transparent pricing
                and finance approvals in minutes. A premium experience from your
                first click to your driveway.
              </p>

              {/* Search card */}
              <div className="animate-fade-in-up delay-300 mt-8 rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur-xl shadow-2xl">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
                  <Select value={brand || undefined} onValueChange={setBrand}>
                    <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white shadow-none">
                      <SelectValue placeholder="Any brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANDS.slice(0, 10).map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={body || undefined} onValueChange={setBody}>
                    <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white shadow-none">
                      <SelectValue placeholder="Body type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BODY_TYPES.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={budget || undefined} onValueChange={setBudget}>
                    <SelectTrigger className="h-12 border-white/10 bg-white/5 text-white shadow-none">
                      <SelectValue placeholder="Budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1000000">Under ₹10 L</SelectItem>
                      <SelectItem value="1000000-2500000">₹10 L - ₹25 L</SelectItem>
                      <SelectItem value="2500000-5000000">₹25 L - ₹50 L</SelectItem>
                      <SelectItem value="5000000+">₹50 L+</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="lg"
                    className="h-12 gap-2 lg:px-8"
                    onClick={search}
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>

              <div className="animate-fade-in-up delay-400 mt-6 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" variant="secondary" className="gap-1.5">
                  <Link to="/buy">
                    Browse all cars <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="gap-1.5 border border-white/20 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to="/sell">Sell your car</Link>
                </Button>
              </div>
            </div>

            {/* Right: floating featured card */}
            <div className="relative hidden lg:block">
              <div className="animate-fade-in delay-300 animate-float overflow-hidden rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-2xl">
                {heroListing?.images?.[0] && (
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={heroListing.images[0]}
                      alt={`${heroListing.brand} ${heroListing.model}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <Badge className="absolute left-4 top-4 border-0 bg-accent text-accent-foreground shadow-lg">
                      <Sparkles className="mr-1 h-3 w-3" /> Featured today
                    </Badge>
                  </div>
                )}
                <div className="p-6 text-white">
                  <div className="flex items-center gap-2 text-xs font-medium text-white/70">
                    <ShieldCheck className="h-4 w-4 text-success" />
                    200-point certified · 7-day returns
                  </div>
                  <div className="mt-3 text-2xl font-bold">
                    {heroListing
                      ? `${heroListing.year} ${heroListing.brand} ${heroListing.model}`
                      : "2022 Tesla Model 3 LR"}
                  </div>
                  <div className="mt-1 text-sm text-white/60">
                    {heroListing?.variant} ·{" "}
                    {heroListing?.kmDriven?.toLocaleString()} km
                  </div>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-white/50">
                        Starting at
                      </div>
                      <div className="text-3xl font-extrabold text-accent">
                        {heroListing?.pricing?.finalPrice
                          ? formatPriceShort(heroListing.pricing.finalPrice)
                          : "₹39.90 L"}
                      </div>
                    </div>
                    <Button asChild size="sm" className="gap-1">
                      <Link to="/buy">
                        View <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Floating mini badges */}
              <div className="absolute -left-8 top-12 hidden animate-float rounded-2xl border border-border/60 bg-card p-4 shadow-xl xl:block">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Low mileage</div>
                    <div className="text-xs text-muted-foreground">Avg. 32k km</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 hidden animate-float rounded-2xl border border-border/60 bg-card p-4 shadow-xl xl:block">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                    <HeartHandshake className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Trusted by 12k+</div>
                    <div className="text-xs text-muted-foreground">Happy drivers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/60 md:flex">
          <span className="text-[11px] uppercase tracking-[0.2em]">Scroll</span>
          <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/30 p-1">
            <div className="h-2 w-1 animate-bounce rounded-full bg-white/60" />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* BRAND MARQUEE                                                */}
      {/* ============================================================ */}
      <section className="border-y border-border/60 bg-card/50 py-8">
        <div className="container mx-auto px-4">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Every major brand, certified & ready
          </p>
          <div className="relative overflow-hidden">
            <div className="flex animate-marquee items-center gap-16 whitespace-nowrap">
              {[...BRANDS, ...BRANDS].map((b, i) => (
                <span
                  key={`${b}-${i}`}
                  className="text-2xl font-bold tracking-tight text-muted-foreground/40 transition-colors hover:text-primary"
                >
                  {b}
                </span>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* STATS BAND                                                   */}
      {/* ============================================================ */}
      <section className="container mx-auto px-4 py-16">
        <Reveal>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 text-center transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <s.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-extrabold tracking-tight">
                  {s.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ============================================================ */}
      {/* BROWSE BY BODY TYPE                                          */}
      {/* ============================================================ */}
      <section className="container mx-auto px-4 py-12">
        <Reveal>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow">Find your fit</div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Shop by body type
              </h2>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              From compact city cars to long-distance tourers and family SUVs —
              pick the shape that fits your life.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {BODY_TYPES.map((b, i) => (
              <Link
                key={b}
                to="/buy"
                search={{ body: [b] }}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Car className="h-7 w-7" />
                </div>
                <div className="text-sm font-semibold">{b}</div>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ============================================================ */}
      {/* FEATURED CARS                                                */}
      {/* ============================================================ */}
      <section className="container mx-auto px-4 py-16">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <div className="eyebrow">Curated this week</div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Featured arrivals
              </h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link to="/buy">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Reveal>

        {featured.length > 0 && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            {/* Spotlight (first car) */}
            <Reveal>
              <Link
                to="/buy/$id"
                params={{ id: featured[0].id }}
                className="group relative block h-full min-h-[22rem] overflow-hidden rounded-3xl border border-border/60 shadow-sm transition-all hover:shadow-2xl"
              >
                <img
                  src={featured[0].images[0]}
                  alt={`${featured[0].brand} ${featured[0].model}`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <Badge className="absolute left-5 top-5 border-0 bg-accent text-accent-foreground shadow-lg">
                  <Sparkles className="mr-1 h-3 w-3" /> Editor's pick
                </Badge>
                <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                  <div className="text-xs font-medium uppercase tracking-wide text-white/70">
                    {featured[0].variant} · {featured[0].year}
                  </div>
                  <div className="mt-1 text-3xl font-extrabold tracking-tight">
                    {featured[0].brand} {featured[0].model}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-2xl font-bold text-accent">
                      {featured[0].pricing?.finalPrice
                        ? formatPriceShort(featured[0].pricing.finalPrice)
                        : "—"}
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-md transition-colors group-hover:bg-white group-hover:text-black">
                      Explore <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>

            {/* Secondary featured grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {featured.slice(1, 3).map((l, i) => (
                <Reveal key={l.id} delay={i * 100}>
                  <CarCard listing={l} />
                </Reveal>
              ))}
            </div>
          </div>
        )}

        <Reveal>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(3, 6).map((l) => (
              <CarCard key={l.id} listing={l} />
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="gap-1.5">
              <Link to="/buy">
                Browse full inventory <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>

      {/* ============================================================ */}
      {/* WHY DRIVEHUB — value props                                   */}
      {/* ============================================================ */}
      <section className="bg-secondary/40 py-20">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <div className="eyebrow mx-auto w-fit">Why DriveHub</div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                A more trustworthy way to change cars
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Every step is engineered to remove friction, hidden costs, and
                doubt — so you can buy or sell with total confidence.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 100}>
                <div className="group h-full rounded-3xl border border-border/60 bg-card p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                  <div
                    className={`grid h-14 w-14 place-items-center rounded-2xl transition-all duration-300 group-hover:scale-110 ${
                      v.tone === "accent"
                        ? "bg-accent/15 text-accent"
                        : v.tone === "success"
                          ? "bg-success/15 text-success"
                          : "bg-primary/15 text-primary"
                    }`}
                  >
                    <v.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {v.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* HOW IT WORKS                                                 */}
      {/* ============================================================ */}
      <section className="container mx-auto px-4 py-20">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="eyebrow mx-auto w-fit">Simple process</div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              From browse to driveway in 3 steps
            </h2>
          </div>
        </Reveal>

        <div className="relative mt-14 grid gap-8 md:grid-cols-3">
          {/* connecting line */}
          <div className="absolute left-0 right-0 top-9 hidden border-t-2 border-dashed border-border md:block" />
          {steps.map((s, i) => (
            <Reveal key={s.step} delay={i * 120}>
              <div className="relative text-center">
                <div className="relative z-10 mx-auto flex h-18 w-18 flex-col items-center justify-center rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="mx-auto mt-3 w-fit rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
                  Step {s.step}
                </div>
                <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SELL CTA                                                     */}
      {/* ============================================================ */}
      <section className="container mx-auto px-4 pb-8">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-[2rem] px-8 py-14 text-white md:px-14 md:py-20"
            style={{ background: "var(--gradient-hero)" }}
          >
            <div
              className="absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl"
              style={{ background: "var(--gradient-glow)" }}
            />
            <div className="absolute inset-0 grid-bg opacity-20" />

            <div className="relative grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  Sell with confidence
                </div>
                <h2 className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">
                  Sell your car in 48 hours.
                </h2>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-white/75">
                  Schedule a home inspection, receive a verified offer, and
                  finish paperwork digitally — no chasing buyers or haggling in
                  parking lots.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg" variant="secondary" className="gap-1.5">
                    <Link to="/sell">
                      Get instant quote <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="ghost"
                    className="gap-1.5 border border-white/20 text-white hover:bg-white/10 hover:text-white"
                  >
                    <Link to="/about">How it works</Link>
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { n: "1", t: "Share car details and service history.", icon: Calculator },
                  { n: "2", t: "Book a doorstep inspection slot.", icon: Clock },
                  { n: "3", t: "Approve the offer and get paid fast.", icon: Banknote },
                ].map((row) => (
                  <div
                    key={row.n}
                    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-all hover:bg-white/10 hover:-translate-y-0.5"
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-base font-extrabold text-accent-foreground">
                      {row.n}
                    </div>
                    <row.icon className="h-5 w-5 text-accent" />
                    <p className="flex-1 text-sm text-white/85">{row.t}</p>
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============================================================ */}
      {/* TESTIMONIALS                                                 */}
      {/* ============================================================ */}
      <section className="container mx-auto px-4 py-20">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="eyebrow mx-auto w-fit">Loved by drivers</div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Customers notice the difference
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Thousands of buyers and sellers trust DriveHub for a calmer, more
              transparent way to change cars.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div className="group relative h-full rounded-3xl border border-border/60 bg-card p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                {i === 0 && (
                  <div className="absolute -right-3 -top-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                )}
                <Quote className="h-9 w-9 text-primary/15" />
                <div className="mt-3 flex gap-0.5 text-accent">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-7 text-foreground/90">
                  "{t.text}"
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {t.name.slice(0, 1)}
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* TRUST BAR                                                    */}
      {/* ============================================================ */}
      <section className="border-y border-border/60 bg-secondary/40">
        <div className="container mx-auto grid gap-6 px-4 py-12 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Certified Quality", desc: "200-point inspection on every vehicle" },
            { icon: Clock, title: "Fast Process", desc: "From browse to delivery in 4 days" },
            { icon: Users, title: "Trusted by 12k+", desc: "Happy customers across India" },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 100}>
              <div className="group flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                  <item.icon className="h-7 w-7" />
                </div>
                <div>
                  <div className="font-bold">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* FAQ                                                          */}
      {/* ============================================================ */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <div className="eyebrow">Answers first</div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                Frequently asked questions
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Everything you need to know before you buy or sell. Can't find
                what you're looking for? Our team replies within an hour.
              </p>
              <Button asChild className="mt-6 gap-1.5">
                <Link to="/support">
                  Contact us <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((f, i) => (
                  <AccordionItem
                    key={i}
                    value={`q-${i}`}
                    className="border-b border-border/60 last:border-0"
                  >
                    <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-7 text-muted-foreground">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FINAL CTA                                                    */}
      {/* ============================================================ */}
      <section className="container mx-auto px-4 pb-20">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-[2rem] px-8 py-16 text-center text-white md:px-14 md:py-20"
            style={{ background: "var(--gradient-primary)" }}
          >
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="relative mx-auto max-w-2xl">
              <Sparkles className="mx-auto h-10 w-10 text-white" />
              <h2 className="mt-5 text-3xl font-extrabold tracking-tight md:text-5xl">
                Ready to find your next car?
              </h2>
              <p className="mt-4 text-lg text-white/80">
                Browse certified inventory or get an instant quote for yours —
                no obligations, ever.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" variant="secondary" className="gap-1.5">
                  <Link to="/buy">
                    Browse cars <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="gap-1.5 border border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to="/sell">Sell your car</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
