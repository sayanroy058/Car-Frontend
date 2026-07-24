import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Listing, Offer, Booking } from "@/lib/types";

export function ListingAnalytics({
  listing,
  offers,
  bookings,
}: {
  listing: Listing;
  offers: Offer[];
  bookings: Booking[];
}) {
  const viewsData = useMemo(() => {
    const totalViews = listing.views ?? 100;
    return Array.from({ length: 6 }).map((_, i) => ({
      m: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
      views: Math.round((totalViews / 6) * (0.7 + i * 0.07 + Math.random() * 0.1)),
    }));
  }, [listing.id, listing.views]);

  const listingOffers = offers.filter((o) => o.listingId === listing.id);
  const listingBookings = bookings.filter((b) => b.listingId === listing.id);
  const funnel = useMemo(
    () => [
      { stage: "Views", value: listing.views ?? 100 },
      { stage: "Wishlist", value: Math.round((listing.views ?? 100) * 0.18) },
      { stage: "Offers", value: listingOffers.length },
      { stage: "Bookings", value: listingBookings.length },
    ],
    [listing.views, listingOffers.length, listingBookings.length],
  );

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Views over time
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={viewsData}>
            <defs>
              <linearGradient id={`views-${listing.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.6 0.13 185)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="oklch(0.6 0.13 185)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
            <XAxis dataKey="m" stroke="oklch(0.7 0.02 250)" fontSize={10} />
            <YAxis stroke="oklch(0.7 0.02 250)" fontSize={10} />
            <Tooltip
              contentStyle={{
                background: "oklch(0.18 0.03 260)",
                border: "1px solid oklch(1 0 0 / 0.1)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="oklch(0.6 0.13 185)"
              fill={`url(#views-${listing.id})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Conversion funnel
        </div>
        <div className="space-y-2">
          {funnel.map((f, i) => {
            const max = funnel[0].value || 1;
            const pct = Math.round((f.value / max) * 100);
            return (
              <div key={f.stage}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{f.stage}</span>
                  <span className="font-medium">{f.value}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%`, opacity: 1 - i * 0.15 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
