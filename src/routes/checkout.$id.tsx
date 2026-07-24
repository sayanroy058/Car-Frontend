import { createFileRoute, Link, notFound, useParams, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  Car,
  CheckCircle2,
  CreditCard,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/lib/store";
import { formatPrice, formatPriceShort } from "@/components/site/CarCard";
import { emiFor } from "@/components/site/EmiCalculator";
import type { BookingType } from "@/lib/types";

export const Route = createFileRoute("/checkout/$id")({
  component: CheckoutPage,
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Listing not found</h1>
      <Button asChild className="mt-4">
        <Link to="/buy">Back to inventory</Link>
      </Button>
    </div>
  ),
});

const RESERVE_FEE = 7999;

function CheckoutPage() {
  const { id } = useParams({ from: "/checkout/$id" });
  const { listings, user, addBooking } = useApp();
  const nav = useNavigate();
  const listing = listings.find((l) => l.id === id);

  const [type, setType] = useState<BookingType>("reserve");
  const [tenure, setTenure] = useState(5);
  const [downPct, setDownPct] = useState(20);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [city, setCity] = useState(listing?.registrationCity ?? "");
  const [done, setDone] = useState(false);

  if (!listing) throw notFound();

  const price = listing.pricing?.finalPrice ?? listing.expectedPrice;
  const downPayment = Math.round((price * downPct) / 100);
  const monthly = emiFor(price, downPayment, tenure, 9.5);
  const dueNow = type === "reserve" ? RESERVE_FEE : downPayment;

  function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (!listing) return;
    if (!user) {
      toast.error("Sign in to continue");
      nav({ to: "/login" });
      return;
    }
    if (!name || !phone) {
      toast.error("Please fill your name and phone");
      return;
    }
    addBooking({
      listingId: listing.id,
      userId: user.id,
      buyerName: name,
      buyerEmail: email,
      buyerPhone: phone,
      type,
      amount: price,
      reserveFee: type === "reserve" ? RESERVE_FEE : undefined,
      tenure,
      downPayment,
    });
    setDone(true);
  }

  if (done) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">
          {type === "reserve" ? "Car reserved!" : "Purchase confirmed!"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {listing.year} {listing.brand} {listing.model} · {formatPrice(price)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {type === "reserve"
            ? `Refundable ${formatPriceShort(RESERVE_FEE)} received. Holds the car for 48 hours.`
            : `Down payment ${formatPriceShort(downPayment)} received. We'll arrange delivery & paperwork.`}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/dashboard">View bookings</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/buy">Keep browsing</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Link
        to="/buy/$id"
        params={{ id: listing.id }}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to {listing.brand} {listing.model}
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">Checkout</h1>
      <p className="text-sm text-muted-foreground">
        {listing.year} {listing.brand} {listing.model} · {listing.variant}
      </p>

      {!user && (
        <div className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm">
          You’ll need to sign in to complete this booking.{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </div>
      )}

      <form onSubmit={confirm} className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Type */}
          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Choose an option</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <TypeCard
                active={type === "reserve"}
                onClick={() => setType("reserve")}
                icon={CalendarClock}
                title="Reserve"
                desc="Hold the car for 48 hours"
                amount={formatPrice(RESERVE_FEE)}
              />
              <TypeCard
                active={type === "purchase"}
                onClick={() => setType("purchase")}
                icon={CreditCard}
                title="Buy now"
                desc="Pay down payment today"
                amount={formatPriceShort(downPayment)}
              />
            </div>
          </section>

          {/* Finance */}
          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Financing</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Range
                label={`Down payment (${downPct}%)`}
                min={0}
                max={60}
                step={5}
                value={downPct}
                onChange={setDownPct}
              />
              <Range
                label={`Tenure (${tenure} yrs)`}
                min={1}
                max={7}
                step={1}
                value={tenure}
                onChange={setTenure}
              />
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">Loan amount</span>
              <span className="text-right font-medium">{formatPrice(price - downPayment)}</span>
              <span className="text-muted-foreground">Monthly EMI</span>
              <span className="text-right font-medium">{formatPrice(monthly)}/mo</span>
              <span className="text-muted-foreground">Total payable</span>
              <span className="text-right font-medium">
                {formatPrice(monthly * tenure * 12 + downPayment)}
              </span>
            </div>
          </section>

          {/* Details */}
          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Your details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 inline-block">Full name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label className="mb-1.5 inline-block">Phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 ..."
                  required
                />
              </div>
              <div>
                <Label className="mb-1.5 inline-block">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5 inline-block">Delivery city</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <img src={listing.images[0]} alt="" className="aspect-[16/9] w-full object-cover" />
            <div className="p-5">
              <div className="text-lg font-bold tracking-tight">
                {listing.brand} {listing.model}
              </div>
              <div className="text-xs text-muted-foreground">
                {listing.variant} · {listing.year}
              </div>
              <Separator className="my-3" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Drive-away price</span>
                  <span className="font-medium">{formatPrice(price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due now</span>
                  <span className="text-xl font-bold tracking-tight gradient-text">
                    {formatPrice(dueNow)}
                  </span>
                </div>
              </div>
              <Button type="submit" size="lg" className="mt-4 w-full" disabled={!user}>
                {type === "reserve"
                  ? `Reserve for ${formatPriceShort(RESERVE_FEE)}`
                  : `Confirm & pay ${formatPriceShort(dueNow)}`}
              </Button>
              <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" />
                  7-day money-back guarantee
                </span>
                <span className="inline-flex items-center gap-2">
                  <Car className="h-3.5 w-3.5 text-success" />
                  Free home delivery
                </span>
                <span className="inline-flex items-center gap-2">
                  <BadgeCheck className="h-3.5 w-3.5 text-success" />
                  RC transfer handled
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-success" />
                  Pick up in {listing.registrationCity}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

function TypeCard({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
  amount,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  amount: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${active ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"}`}
    >
      <div className="flex items-center justify-between">
        <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
        {active && <CheckCircle2 className="h-4 w-4 text-primary" />}
      </div>
      <div className="mt-2 text-base font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
      <div className="mt-2 text-sm font-medium">{amount}</div>
    </button>
  );
}

function Range({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="rounded-lg border border-border/60 p-3">
      <div className="mb-2 text-xs text-muted-foreground">{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-primary/20 accent-primary"
      />
    </div>
  );
}
