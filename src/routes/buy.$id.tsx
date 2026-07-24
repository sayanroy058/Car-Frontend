import { createFileRoute, Link, notFound, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Car,
  CheckCircle2,
  FileText,
  Fuel,
  GaugeCircle,
  Heart,
  MapPin,
  MessageCircle,
  PlayCircle,
  Scale,
  Settings2,
  Share2,
  ShieldCheck,
  Star,
  Wrench,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { CarCard, formatPrice } from "@/components/site/CarCard";
import { EmiCalculator } from "@/components/site/EmiCalculator";
import { CheckoutDialog } from "@/components/site/CheckoutDialog";
import { OfferForm } from "@/components/site/OfferForm";
import { TestDriveDialog } from "@/components/site/TestDriveDialog";
import { Reviews } from "@/components/site/Reviews";
import { DetailSkeleton } from "@/components/site/Skeletons";
import { Seo } from "@/components/site/Seo";
import { Lightbox } from "@/components/site/Lightbox";
import { emiEstimate, ADMIN_ID, ADMIN_NAME } from "@/lib/constants";
import { getListing, getSimilar } from "@/lib/api";
import { qk } from "@/lib/queries";
import { startConversation } from "@/lib/api";
import type { BookingType } from "@/lib/types";

export const Route = createFileRoute("/buy/$id")({
  component: VehicleDetail,
  pendingComponent: () => <DetailSkeleton />,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: qk.listing(params.id),
      queryFn: () => getListing(params.id),
    });
    await context.queryClient.ensureQueryData({
      queryKey: qk.similar(params.id),
      queryFn: () => getSimilar(params.id),
    });
  },
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Car not found</h1>
      <Button asChild className="mt-4">
        <Link to="/buy">Back to inventory</Link>
      </Button>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container mx-auto p-10 text-center text-destructive">{String(error)}</div>
  ),
});

function VehicleDetail() {
  const { id } = useParams({ from: "/buy/$id" });
  const { listings, user, markViewed, toggleWishlist, wishlist, compare, toggleCompare } = useApp();
  const nav = useNavigate();

  const listing = listings.find((l) => l.id === id);
  const [active, setActive] = useState(0);
  const [checkout, setCheckout] = useState<BookingType | null>(null);
  const [video, setVideo] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [testDrive, setTestDrive] = useState(false);

  useEffect(() => {
    if (listing) markViewed(listing.id);
  }, [listing?.id]);

  if (!listing) throw notFound();

  function share() {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({ title: `${listing!.year} ${listing!.brand} ${listing!.model}`, url })
        .catch(() => {});
    } else {
      navigator.clipboard
        .writeText(url)
        .then(() => toast.success("Link copied to clipboard!"))
        .catch(() => toast.error("Couldn't copy link"));
    }
  }

  async function startChat() {
    if (!user) {
      toast.error("Sign in to start a chat");
      nav({ to: "/login" });
      return;
    }
    try {
      const conv = await startConversation({
        listingId: listing!.id,
        buyerId: user.id,
        sellerId: ADMIN_ID,
        sellerName: ADMIN_NAME,
        listingTitle: `${listing!.year} ${listing!.brand} ${listing!.model}`,
      });
      nav({ to: "/chat/$id", params: { id: conv.id } });
    } catch {
      toast.error("Couldn't start conversation");
    }
  }

  const price = listing.pricing?.finalPrice ?? listing.expectedPrice;
  const emi = emiEstimate(price);
  const similar = listings
    .filter((l) => l.id !== listing.id && l.bodyType === listing.bodyType)
    .slice(0, 3);
  const fav = wishlist.includes(listing.id);
  const inCompare = compare.includes(listing.id);

  const highlightTags = useMemo(
    () => [
      "Sunroof",
      "Apple CarPlay",
      "Android Auto",
      "360° Camera",
      "Ventilated seats",
      "ADAS Level 2",
      "Premium audio",
      "Wireless charging",
      "LED Matrix headlamps",
    ],
    [],
  );
  const inspectionScore = useMemo(
    () => (8.6 + (listing.id.charCodeAt(0) % 10) / 20).toFixed(1),
    [listing.id],
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
        {
          area: "Tail-lamp cluster",
          severity: "Minor",
          note: "Hairline scratch, no cracks, fully functional.",
        },
        {
          area: "Underbody",
          severity: "Minor",
          note: "Surface rust on exhaust shield — treated and coated.",
        },
      ] as const,
    [],
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

  return (
    <div className="container mx-auto px-4 py-8">
      <Seo
        title={`${listing.year} ${listing.brand} ${listing.model} ${listing.variant} — DriveHub`}
        description={`${listing.year} ${listing.brand} ${listing.model}, ${listing.kmDriven.toLocaleString()} km, ${listing.fuelType}, ${listing.transmission}. Inspected & refurbished. ${formatPrice(price)}.`}
        canonical={`/buy/${listing.id}`}
        ogTitle={`${listing.year} ${listing.brand} ${listing.model} — ${formatPrice(price)}`}
        ogDescription={`${listing.kmDriven.toLocaleString()} km · ${listing.fuelType} · ${listing.registrationCity}`}
      />
      <Link
        to="/buy"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to inventory
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          {/* Gallery */}
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="relative aspect-[16/10] bg-muted">
              <img
                src={listing.images[active]}
                alt={`${listing.brand} ${listing.model}`}
                className="h-full w-full cursor-zoom-in object-cover"
                onClick={() => setLightbox(true)}
              />
              <div className="absolute right-4 top-4 flex gap-2">
                <button
                  className="grid h-10 w-10 place-items-center rounded-full bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => share()}
                  aria-label="Share listing"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  className="grid h-10 w-10 place-items-center rounded-full bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => toggleWishlist(listing.id)}
                  aria-label={fav ? "Remove from wishlist" : "Add to wishlist"}
                  aria-pressed={fav}
                >
                  <Heart className={`h-4 w-4 ${fav ? "fill-destructive text-destructive" : ""}`} />
                </button>
              </div>
              <button
                onClick={() => setVideo(true)}
                className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-medium transition hover:bg-background/90"
              >
                <PlayCircle className="h-4 w-4" /> Walkaround video
              </button>
            </div>
            <div className="flex min-w-0 max-w-full gap-2 overflow-x-auto p-3">
              {listing.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={i === active}
                  className={`relative h-16 w-24 flex-none overflow-hidden rounded-lg border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${i === active ? "border-primary" : "border-transparent"}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {listing.bodyType}
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight">
                  {listing.year} {listing.brand} {listing.model}
                </h1>
                <p className="text-muted-foreground">{listing.variant}</p>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Listed price
                </div>
                <div className="font-display text-3xl font-bold gradient-text">
                  {formatPrice(price)}
                </div>
                <div className="text-xs text-muted-foreground">EMI from {formatPrice(emi)}/mo</div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { i: GaugeCircle, l: `${listing.kmDriven.toLocaleString()} km` },
                { i: Fuel, l: listing.fuelType },
                { i: Settings2, l: listing.transmission },
                { i: Calendar, l: `${listing.ownership}` },
              ].map((x, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl border border-border/60 bg-card p-3 text-sm"
                >
                  <x.i className="h-4 w-4 text-primary" />
                  {x.l}
                </div>
              ))}
            </div>

            <Tabs defaultValue="overview" className="mt-8">
              <TabsList className="grid w-full grid-cols-4 md:grid-cols-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="specs">Specs</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="inspection">Inspection</TabsTrigger>
                <TabsTrigger value="defects">Defects</TabsTrigger>
                <TabsTrigger value="service">Service</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 pt-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {listing.description}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      i: ShieldCheck,
                      t: "200-point inspection",
                      d: "Mechanical, electrical & cosmetic",
                    },
                    { i: BadgeCheck, t: "7-day money back", d: "No questions asked return" },
                    { i: Wrench, t: "6-month warranty", d: "Engine & transmission" },
                    { i: Car, t: "Free RC transfer", d: "All paperwork handled" },
                  ].map((b, i) => (
                    <div
                      key={i}
                      className="flex gap-3 rounded-xl border border-border/60 bg-card p-3"
                    >
                      <b.i className="h-5 w-5 flex-none text-primary" />
                      <div>
                        <div className="text-sm font-semibold">{b.t}</div>
                        <div className="text-xs text-muted-foreground">{b.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Highlights</h3>
                  <div className="flex flex-wrap gap-2">
                    {highlightTags.map((f) => (
                      <Badge key={f} variant="outline">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="specs" className="pt-4 space-y-6">
                <Section title="Identity & registration">
                  <SpecGrid
                    items={[
                      ["Brand", listing.brand],
                      ["Model", listing.model],
                      ["Variant", listing.variant],
                      ["Manufacturing year", listing.year],
                      ["Registration year", listing.registrationYear],
                      ["VIN / Chassis", listing.vin],
                      ["Body type", listing.bodyType],
                      ["Registration state", listing.registrationState],
                      ["Registration city", listing.registrationCity],
                      ["Insurance", listing.insuranceStatus],
                      ["Road tax", listing.roadTaxStatus],
                    ]}
                  />
                </Section>
                <Section title="Engine & performance">
                  <SpecGrid
                    items={[
                      ["Fuel type", listing.fuelType],
                      ["Transmission", listing.transmission],
                      ["Kilometers driven", `${listing.kmDriven.toLocaleString()} km`],
                      ["Mileage (est.)", listing.fuelType === "Electric" ? "—" : "14–18 km/l"],
                      ["Drivetrain", "AWD / FWD"],
                      ["Engine displacement", "1998 cc"],
                      ["Max power", "190 bhp @ 5000 rpm"],
                      ["Max torque", "320 Nm @ 2000 rpm"],
                    ]}
                  />
                </Section>
                <Section title="Ownership">
                  <SpecGrid
                    items={[
                      ["Ownership", listing.ownership],
                      ["No. of keys", listing.keys],
                      ["Service history", listing.serviceHistory],
                      ["Accident history", listing.accidentHistory],
                      ["Modifications", listing.modifications],
                    ]}
                  />
                </Section>
                <Section title="Dimensions & capacity">
                  <SpecGrid
                    items={[
                      ["Seating", "5 adults"],
                      ["Boot space", "455 L"],
                      ["Fuel tank", "60 L"],
                      ["Ground clearance", "165 mm"],
                      ["Length × Width × Height", "4,690 × 1,850 × 1,450 mm"],
                      ["Wheelbase", "2,820 mm"],
                    ]}
                  />
                </Section>
              </TabsContent>

              <TabsContent value="features" className="pt-4 space-y-6">
                {Object.entries(FEATURES_BY_GROUP).map(([group, items]) => (
                  <Section key={group} title={group}>
                    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                      {items.map((f) => (
                        <div
                          key={f}
                          className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm"
                        >
                          <CheckCircle2 className="h-4 w-4 flex-none text-success" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </Section>
                ))}
              </TabsContent>

              <TabsContent value="inspection" className="pt-4 space-y-4">
                <div className="flex flex-wrap justify-end gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/buy/$id/inspection" params={{ id: listing.id }}>
                      View full inspection report →
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/buy/$id/report" params={{ id: listing.id }}>
                      <FileText className="mr-1 h-4 w-4" />
                      History report
                    </Link>
                  </Button>
                </div>
                <div className="rounded-2xl border border-success/30 bg-success/5 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 font-display text-lg font-semibold">
                        <ShieldCheck className="h-5 w-5 text-success" />
                        Inspection score
                      </div>
                      <p className="text-xs text-muted-foreground">
                        200-point check by certified engineers
                      </p>
                    </div>
                    <div className="font-display text-3xl font-bold text-success">
                      {inspectionScore}/10
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Exterior body", listing.exteriorCondition, 88],
                    ["Interior & upholstery", listing.interiorCondition, 92],
                    ["Engine & transmission", listing.engineCondition, 95],
                    ["Suspension & brakes", "Very Good", 87],
                    ["Tires & wheels", listing.tireCondition, 78],
                    ["Battery & electricals", listing.batteryCondition, 90],
                    ["AC & climate control", "Excellent", 96],
                    ["Infotainment & ADAS", "Excellent", 94],
                  ].map(([label, status, pct]) => (
                    <div
                      key={label as string}
                      className="rounded-xl border border-border/60 bg-card p-4"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{label}</span>
                        <Badge variant="outline" className="text-xs">
                          {status}
                        </Badge>
                      </div>
                      <Progress value={pct as number} className="mt-2 h-1.5" />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="defects" className="pt-4 space-y-4">
                <div className="flex justify-end">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/buy/$id/defects" params={{ id: listing.id }}>
                      View full defects report →
                    </Link>
                  </Button>
                </div>
                <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4 text-sm">
                  <Star className="mr-2 inline h-4 w-4 text-warning" />
                  Full transparency — every cosmetic or mechanical issue noted by our engineers.
                </div>
                <div className="space-y-2">
                  {defectsList.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4"
                    >
                      <div
                        className={`mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-full ${d.severity === "Minor" ? "bg-success/15 text-success" : d.severity === "Moderate" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"}`}
                      >
                        {d.severity === "Minor" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-semibold">{d.area}</div>
                          <Badge variant="outline" className="text-[10px]">
                            {d.severity}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">{d.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="service" className="pt-4 space-y-3">
                <p className="text-sm text-muted-foreground">{listing.serviceHistory}</p>
                <div className="overflow-hidden rounded-2xl border border-border/60">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">KM</th>
                        <th className="p-3">Service</th>
                        <th className="p-3">Workshop</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceHistory.map((s, i) => (
                        <tr key={i} className="border-t border-border/60">
                          <td className="p-3">{s.date}</td>
                          <td className="p-3">{s.km.toLocaleString()}</td>
                          <td className="p-3">{s.service}</td>
                          <td className="p-3 text-muted-foreground">{s.workshop}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="pt-4">
                {listing.pricing ? (
                  <div className="rounded-2xl border border-border/60 bg-card p-5">
                    {[
                      ["Base price", listing.pricing.basePrice],
                      ["Refurbishment", listing.pricing.refurbishment],
                      ["Repair", listing.pricing.repair],
                      ["Transportation", listing.pricing.transportation],
                      ["Inspection", listing.pricing.inspection],
                      ["Documentation", listing.pricing.documentation],
                      ["Platform commission", listing.pricing.commission],
                      ["Margin", listing.pricing.margin],
                    ].map(([k, v]) => (
                      <div
                        key={k as string}
                        className="flex justify-between border-b border-border/60 py-2 text-sm last:border-0"
                      >
                        <span className="text-muted-foreground">{k}</span>
                        <span className="font-medium">{formatPrice(v as number)}</span>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between pt-2 font-display text-lg font-bold">
                      <span>Final price</span>
                      <span className="gradient-text">
                        {formatPrice(listing.pricing.finalPrice)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Pricing pending admin review.</p>
                )}
              </TabsContent>

              <TabsContent value="emi" className="pt-4">
                <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                  <h3 className="mb-4 font-display text-base font-semibold">EMI calculator</h3>
                  <EmiCalculator price={price} />
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="pt-4">
                <Reviews listing={listing} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sticky sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Total drive-away
            </div>
            <div className="mt-1 font-display text-3xl font-bold">{formatPrice(price)}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              From <span className="font-semibold text-foreground">{formatPrice(emi)}/mo</span> · 60
              months
            </div>
            <div className="mt-4 grid gap-2">
              <Button size="lg" className="w-full" onClick={() => setCheckout("purchase")}>
                Buy now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => setCheckout("reserve")}
              >
                Reserve · ₹7,999
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="w-full"
                onClick={() => setTestDrive(true)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book a test drive
              </Button>
              <Button
                size="lg"
                variant={inCompare ? "secondary" : "ghost"}
                className="w-full"
                onClick={() => toggleCompare(listing.id)}
              >
                <Scale className="mr-2 h-4 w-4" />
                {inCompare ? "In compare list" : "Add to compare"}
              </Button>
              <Button size="lg" variant="ghost" className="w-full" onClick={startChat}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat with DriveHub
              </Button>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-3.5 w-3.5 text-success" />
                7-day return guarantee
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="h-3.5 w-3.5 text-success" />
                200-point inspection passed
              </div>
              <div className="flex items-center gap-2">
                <Car className="h-3.5 w-3.5 text-success" />
                Free home delivery
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <h3 className="font-display text-sm font-semibold">Location</h3>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {listing.registrationCity}, {listing.registrationState}
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <OfferForm listing={listing} />
          </div>
        </aside>
      </div>

      {checkout && (
        <CheckoutDialog
          listing={listing}
          open={!!checkout}
          onOpenChange={(v) => !v && setCheckout(null)}
          type={checkout}
        />
      )}

      <TestDriveDialog listing={listing} open={testDrive} onOpenChange={setTestDrive} />

      <Dialog open={video} onOpenChange={setVideo}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Walkaround video</DialogTitle>
            <DialogDescription>
              {listing.year} {listing.brand} {listing.model} · {listing.variant}
            </DialogDescription>
          </DialogHeader>
          <div className="grid aspect-video place-items-center rounded-xl border border-border/60 bg-muted text-center">
            <div className="space-y-2 p-6">
              <PlayCircle className="mx-auto h-10 w-10 text-primary" />
              <p className="text-sm text-muted-foreground">
                Walkaround video will be available here once the final cut is uploaded. For now,
                book an in-person or live-video inspection with an advisor.
              </p>
              <Button asChild size="sm" className="mt-2">
                <Link to="/support">Request live inspection</Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Lightbox
        images={listing.images}
        open={lightbox}
        onOpenChange={setLightbox}
        index={active}
        onIndexChange={setActive}
        alt={`${listing.year} ${listing.brand} ${listing.model}`}
      />

      {/* Similar */}
      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 font-display text-xl font-semibold">Similar cars</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((l) => (
              <CarCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SpecGrid({ items }: { items: Array<[string, string | number]> }) {
  return (
    <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k} className="flex justify-between border-b border-border/60 py-2 text-sm">
          <span className="text-muted-foreground">{k}</span>
          <span className="text-right font-medium">{String(v)}</span>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

const FEATURES_BY_GROUP: Record<string, string[]> = {
  Safety: [
    "6 Airbags",
    "ABS with EBD",
    "Electronic Stability Program",
    "Hill-hold assist",
    "ISOFIX child seat mounts",
    "Tire pressure monitor",
    "360° surround camera",
    "Blind-spot monitor",
    "Lane-keep assist",
    "Forward collision warning",
  ],
  "Comfort & convenience": [
    "Dual-zone climate control",
    "Ventilated front seats",
    "Electric driver seat memory",
    "Auto-dimming IRVM",
    "Rain-sensing wipers",
    "Auto LED headlamps",
    "Push-button start",
    "Cruise control",
    "Hands-free tailgate",
    "Wireless phone charger",
  ],
  Infotainment: [
    '10.25" touchscreen',
    "Wireless Apple CarPlay",
    "Wireless Android Auto",
    "12-speaker premium audio",
    "Bluetooth 5.0",
    "Voice assistant",
    "Connected car app",
    "OTA updates",
  ],
  Exterior: [
    "LED Matrix headlamps",
    "LED DRLs",
    "Panoramic sunroof",
    '18" alloy wheels',
    "Roof rails",
    "Shark-fin antenna",
    "Auto-folding ORVMs",
  ],
  Interior: [
    "Leatherette upholstery",
    "Ambient lighting (64 colors)",
    "Cooled glovebox",
    "60:40 split rear seat",
    "Rear AC vents",
    "USB-C charging (4)",
    "Wireless smart key",
  ],
};
