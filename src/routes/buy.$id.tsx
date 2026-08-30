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
import { useListing } from "@/lib/useListing";
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
import { HIGHLIGHT_OPTIONS } from "@/lib/highlights";
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
  const {
    listings: storeListings,
    user,
    markViewed,
    toggleWishlist,
    wishlist,
    compare,
    toggleCompare,
  } = useApp();
  const nav = useNavigate();

  // Falls back to fetching the listing when the store hasn't loaded it, so a
  // refresh or shared link no longer 404s before data arrives.
  const { listing, isLoading, notFound: missing } = useListing(id);
  const [active, setActive] = useState(0);
  const [checkout, setCheckout] = useState<BookingType | null>(null);
  const [video, setVideo] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [testDrive, setTestDrive] = useState(false);

  useEffect(() => {
    if (listing) markViewed(listing.id);
  }, [listing?.id]);

  // Derived before the early returns so hook order stays stable across renders.
  // Seller-declared features; previously this was a fixed nine-tag array
  // rendered identically for every car.
  const highlightTags = useMemo(() => listing?.highlights ?? [], [listing?.highlights]);

  // Same highlights, bucketed under their catalogue group for the Features tab.
  const featureGroups = useMemo(() => {
    const selected = new Set(listing?.highlights ?? []);
    return Object.entries(HIGHLIGHT_OPTIONS)
      .map(([group, options]) => [group, options.filter((o) => selected.has(o))] as const)
      .filter(([, items]) => items.length > 0);
  }, [listing?.highlights]);

  if (isLoading) return <DetailSkeleton />;
  if (missing || !listing) throw notFound();

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
  // Similar cars come from the store, which is fine here: an empty list simply
  // hides the section, unlike the page itself which must not 404.
  const similar = storeListings
    .filter((l) => l.id !== listing.id && l.bodyType === listing.bodyType)
    .slice(0, 3);
  const fav = wishlist.includes(listing.id);
  const inCompare = compare.includes(listing.id);

  // Note: there is no inspection programme wired up yet, so this page no longer
  // presents a score, a defect list, or a service log. It shows only what the
  // seller declared. The `defects` free-text field and the condition ratings are
  // the honest data we have; fabricated figures were removed.

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
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="specs">Specs</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="condition">Condition</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 pt-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {listing.description}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
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
                  {highlightTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {highlightTags.map((f) => (
                        <Badge key={f} variant="outline">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      The seller hasn't listed specific features for this car yet.
                    </p>
                  )}
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
                      ["Registration number", listing.registrationNumber],
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
                  {/* Every figure comes from the listing. Missing values render
                      as an em dash rather than a fabricated placeholder. */}
                  <SpecGrid
                    items={[
                      ["Fuel type", listing.fuelType],
                      ["Transmission", listing.transmission],
                      ["Kilometers driven", `${listing.kmDriven.toLocaleString("en-IN")} km`],
                      [
                        "Mileage (claimed)",
                        listing.mileageKmpl ? `${listing.mileageKmpl} kmpl` : undefined,
                      ],
                      ["Drivetrain", listing.driveTrain],
                      [
                        "Engine displacement",
                        listing.displacementCc === 0
                          ? "Electric motor"
                          : listing.displacementCc
                            ? `${listing.displacementCc.toLocaleString("en-IN")} cc`
                            : undefined,
                      ],
                      ["Max power", formatPower(listing.maxPowerBhp, listing.maxPowerRpm)],
                      ["Max torque", formatTorque(listing.maxTorqueNm, listing.maxTorqueRpm)],
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
                <Section title="Safety">
                  <SpecGrid items={[["Airbags", listing.airbags]]} />
                </Section>
                <Section title="Dimensions & capacity">
                  <SpecGrid
                    items={[
                      ["Seating", listing.seating ? `${listing.seating} adults` : undefined],
                      ["Boot space", listing.bootSpaceL ? `${listing.bootSpaceL} L` : undefined],
                      ["Fuel tank", listing.fuelTankL ? `${listing.fuelTankL} L` : undefined],
                      [
                        "Ground clearance",
                        listing.groundClearanceMm ? `${listing.groundClearanceMm} mm` : undefined,
                      ],
                      [
                        "Length × Width × Height",
                        formatDimensions(listing.lengthMm, listing.widthMm, listing.heightMm),
                      ],
                      [
                        "Wheelbase",
                        listing.wheelbaseMm
                          ? `${listing.wheelbaseMm.toLocaleString("en-IN")} mm`
                          : undefined,
                      ],
                    ]}
                  />
                </Section>
              </TabsContent>

              <TabsContent value="features" className="pt-4 space-y-6">
                {/* Grouped from the seller's declared highlights — previously a
                    static list identical on every listing. */}
                {featureGroups.length > 0 ? (
                  featureGroups.map(([group, items]) => (
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
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No features have been declared for this car yet. Ask the seller via
                    chat, or check the inspection report once it's published.
                  </p>
                )}
                {listing.airbags != null && (
                  <Section title="Safety">
                    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 flex-none text-success" />
                      {listing.airbags} airbags
                    </div>
                  </Section>
                )}
              </TabsContent>

              {/* Condition: only seller-declared ratings and defects. The
                  previous Inspection/Defects/Service tabs rendered a fabricated
                  score (derived from the listing id), a fixed defect list and a
                  fixed service log identical for every car. */}
              <TabsContent value="condition" className="pt-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Exterior body", listing.exteriorCondition],
                    ["Interior & upholstery", listing.interiorCondition],
                    ["Engine & transmission", listing.engineCondition],
                    ["Tires & wheels", listing.tireCondition],
                    ["Battery & electricals", listing.batteryCondition],
                    ["Accident history", listing.accidentHistory],
                    ["Service history", listing.serviceHistory],
                    ["Modifications", listing.modifications],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-card p-4 text-sm"
                    >
                      <span className="font-medium">{label}</span>
                      <Badge variant="outline" className="text-xs">
                        {value || "Not stated"}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold">
                    Known defects declared by the seller
                  </h3>
                  {listing.defects?.trim() ? (
                    <p className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm">
                      {listing.defects}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      The seller has not declared any defects.
                    </p>
                  )}
                </div>

                <p className="rounded-xl border border-border/60 bg-secondary/30 p-4 text-xs text-muted-foreground">
                  These details are provided by the seller. An independent
                  pre-delivery inspection (PDI) can be arranged before you buy —
                  ask us via chat and we'll organise it.
                </p>
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
                Independent PDI available on request
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

/**
 * Renders label/value pairs, skipping nothing but showing an em dash where the
 * listing has no value — so a missing figure reads as "unknown" rather than
 * silently displaying someone else's number.
 */
function SpecGrid({ items }: { items: Array<[string, string | number | undefined | null]> }) {
  return (
    <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
      {items.map(([k, v]) => {
        const empty = v === undefined || v === null || v === "";
        return (
          <div key={k} className="flex justify-between border-b border-border/60 py-2 text-sm">
            <span className="text-muted-foreground">{k}</span>
            <span
              className={
                empty ? "text-right text-muted-foreground" : "text-right font-medium"
              }
            >
              {empty ? "—" : String(v)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** "158 bhp @ 5,500 rpm", or just "158 bhp" when no peak rpm is quoted. */
function formatPower(bhp?: number, rpm?: number): string | undefined {
  if (!bhp) return undefined;
  return rpm ? `${bhp} bhp @ ${rpm.toLocaleString("en-IN")} rpm` : `${bhp} bhp`;
}

/** "250 Nm @ 1,500 rpm", or just "250 Nm" for electric motors. */
function formatTorque(nm?: number, rpm?: number): string | undefined {
  if (!nm) return undefined;
  return rpm ? `${nm} Nm @ ${rpm.toLocaleString("en-IN")} rpm` : `${nm} Nm`;
}

function formatDimensions(l?: number, w?: number, h?: number): string | undefined {
  if (!l || !w || !h) return undefined;
  const f = (n: number) => n.toLocaleString("en-IN");
  return `${f(l)} × ${f(w)} × ${f(h)} mm`;
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

