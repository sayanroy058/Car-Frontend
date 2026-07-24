import { Link } from "@tanstack/react-router";
import { ArrowRight, Fuel, GaugeCircle, Heart, MapPin, Settings2, Scale, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { LazyImage } from "@/components/site/LazyImage";
import type { Listing } from "@/lib/types";

export function formatPrice(p: number) {
  return "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(p));
}

export function formatPriceShort(p: number) {
  const n = Math.round(p);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return "₹" + new Intl.NumberFormat("en-IN").format(n);
}

export function StatusBadge({ status }: { status: Listing["status"] }) {
  const map: Record<Listing["status"], { label: string; cls: string }> = {
    pending_review: {
      label: "Pending Review",
      cls: "bg-warning/15 text-warning border-warning/30",
    },
    under_inspection: {
      label: "Under Inspection",
      cls: "bg-accent/15 text-accent border-accent/30",
    },
    approved: { label: "Approved", cls: "bg-success/15 text-success border-success/30" },
    rejected: {
      label: "Rejected",
      cls: "bg-destructive/15 text-destructive border-destructive/30",
    },
    listed: { label: "Listed", cls: "bg-primary/10 text-primary border-primary/30" },
    sold: { label: "Sold", cls: "bg-muted text-muted-foreground border-border" },
  };
  const m = map[status];
  return (
    <Badge variant="outline" className={`border ${m.cls}`}>
      {m.label}
    </Badge>
  );
}

export function CarCard({ listing }: { listing: Listing }) {
  const { wishlist, toggleWishlist, compare, toggleCompare, reviews } = useApp();
  const fav = wishlist.includes(listing.id);
  const cmp = compare.includes(listing.id);
  const price = listing.pricing?.finalPrice ?? listing.expectedPrice;
  const listingReviews = reviews.filter((r) => r.listingId === listing.id);

  return (
    <div className="group overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/40">
      <Link
        to="/buy/$id"
        params={{ id: listing.id }}
        className="relative block aspect-[16/10] overflow-hidden bg-muted"
      >
        <LazyImage
          src={listing.images[0]}
          alt={`${listing.brand} ${listing.model}`}
          className="h-full w-full"
          imgClassName="transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80 transition-opacity group-hover:opacity-60" />
        {listing.featured && (
          <Badge className="absolute left-3 top-3 border-0 bg-accent text-accent-foreground shadow-lg">
            Featured
          </Badge>
        )}
        <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(listing.id);
            }}
            className="grid h-9 w-9 place-items-center rounded-full bg-background/90 backdrop-blur transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={fav ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={fav}
          >
            <Heart className={`h-4 w-4 ${fav ? "fill-destructive text-destructive" : ""}`} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleCompare(listing.id);
            }}
            className={`grid h-9 w-9 place-items-center rounded-full backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${cmp ? "bg-primary text-primary-foreground" : "bg-background/90 hover:bg-background"}`}
            aria-label={cmp ? "Remove from compare" : "Add to compare"}
            aria-pressed={cmp}
          >
            <Scale className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
            {listing.registrationCity}
          </div>
          {listingReviews.length > 0 && (
            <div className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              <Star className="mr-0.5 inline h-3 w-3 fill-warning text-warning" />
              {(listingReviews.reduce((s, r) => s + r.rating, 0) / listingReviews.length).toFixed(
                1,
              )}
            </div>
          )}
        </div>
      </Link>
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-medium text-muted-foreground">
              {listing.variant} · {listing.year}
            </div>
            <h3 className="mt-1 truncate text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
              {listing.brand} {listing.model}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">{formatPrice(price)}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Final price
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-secondary/50 px-3 py-2 transition-colors group-hover:border-primary/20">
            <GaugeCircle className="h-3.5 w-3.5" />
            {listing.kmDriven.toLocaleString()} km
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-secondary/50 px-3 py-2 transition-colors group-hover:border-primary/20">
            <Fuel className="h-3.5 w-3.5" />
            {listing.fuelType}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-secondary/50 px-3 py-2 transition-colors group-hover:border-primary/20">
            <Settings2 className="h-3.5 w-3.5" />
            {listing.transmission}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-secondary/50 px-3 py-2 transition-colors group-hover:border-primary/20">
            <MapPin className="h-3.5 w-3.5" />
            {listing.registrationCity}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <span className="text-xs font-medium text-muted-foreground">{listing.ownership}</span>
          <Button asChild size="sm" variant="secondary" className="gap-1">
            <Link to="/buy/$id" params={{ id: listing.id }}>
              View details <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
