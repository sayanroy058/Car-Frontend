import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarCheck, Car, Heart, MessageSquare, Plus, ShoppingBag, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/lib/store";
import { CarCard, formatPrice, StatusBadge } from "@/components/site/CarCard";
import { EmptyState } from "@/components/site/States";
import { TableSkeleton } from "@/components/site/Skeletons";
import { Seo } from "@/components/site/Seo";
import { ListingAnalytics } from "@/components/site/ListingAnalytics";
import { getBookings, getOffers, getTickets, getListings, counterOffer, updateOffer } from "@/lib/api";
import { qk } from "@/lib/queries";
import type { OfferState } from "@/lib/types";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  pendingComponent: () => (
    <div className="container mx-auto px-4 py-10">
      <TableSkeleton rows={4} />
    </div>
  ),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: qk.listings,
        queryFn: () => getListings(),
      }),
      context.queryClient.ensureQueryData({
        queryKey: qk.offers(),
        queryFn: () => getOffers(),
      }),
      context.queryClient.ensureQueryData({
        queryKey: qk.bookings(),
        queryFn: () => getBookings(),
      }),
      context.queryClient.ensureQueryData({
        queryKey: qk.tickets(),
        queryFn: () => getTickets(),
      }),
    ]);
  },
});

function Dashboard() {
  const { user, listings, wishlist, offers, tickets, bookings, updateOffer } = useApp();
  if (!user) return <SignedOut />;

  const mine = listings.filter((l) => l.sellerId === user.id);
  const wished = listings.filter((l) => wishlist.includes(l.id));
  const myTickets = tickets.filter((t) => t.email === user.email || t.userId === user.id);
  const myBookings = bookings.filter((b) => b.userId === user.id);
  const myListingIds = new Set(mine.map((l) => l.id));
  const incomingOffers = offers.filter((o) => myListingIds.has(o.listingId));
  const myOffers = offers.filter((o) => o.buyerId === user.id);

  const stats = [
    { i: Car, label: "Submitted", value: mine.length },
    { i: ShoppingBag, label: "Listed", value: mine.filter((m) => m.status === "listed").length },
    { i: Heart, label: "Wishlist", value: wishlist.length },
    { i: CalendarCheck, label: "Bookings", value: myBookings.length },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <Seo
        title="Dashboard — DriveHub"
        description="Track your listings, offers, and bookings."
        canonical="/dashboard"
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hi {user.name} 👋</h1>
          <p className="text-sm text-muted-foreground">
            Track your listings, offers, and support tickets.
          </p>
        </div>
        <Button asChild>
          <Link to="/sell">
            <Plus className="mr-1 h-4 w-4" />
            List a new car
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
              <s.i className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-3xl font-bold tracking-tight">{s.value}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="listings" className="mt-8">
        <TabsList>
          <TabsTrigger value="listings">My listings</TabsTrigger>
          <TabsTrigger value="offers">
            Offers ({incomingOffers.length + myOffers.length})
          </TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({myBookings.length})</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="tickets">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          {mine.length === 0 ? (
            <EmptyState
              title="No listings yet"
              description="Submit your first car for a free inspection."
              icon={<Car className="h-6 w-6" />}
              action={
                <Button asChild>
                  <Link to="/sell">Sell a car</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {mine.map((l) => (
                <ListingRow key={l.id} listing={l} offers={offers} bookings={bookings} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="offers" className="mt-6">
          <div className="space-y-6">
            {incomingOffers.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Incoming offers on your listings
                </h3>
                <div className="space-y-3">
                  {incomingOffers.map((o) => (
                    <OfferRow key={o.id} offer={o} updateOffer={updateOffer} listings={listings} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Offers you've made
              </h3>
              {myOffers.length === 0 ? (
                <EmptyState
                  title="No offers made yet"
                  description="Make an offer on a car to start negotiating."
                  icon={<Wallet className="h-6 w-6" />}
                  action={
                    <Button asChild>
                      <Link to="/buy">Browse cars</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {myOffers.map((o) => (
                    <BuyerOfferRow
                      key={o.id}
                      offer={o}
                      updateOffer={updateOffer}
                      listings={listings}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          {myBookings.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              description="Reservations and purchases you make appear here."
              icon={<CalendarCheck className="h-6 w-6" />}
              action={
                <Button asChild>
                  <Link to="/buy">Browse cars</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {myBookings.map((b) => {
                const l = listings.find((l) => l.id === b.listingId);
                return (
                  <div
                    key={b.id}
                    className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
                  >
                    {l && (
                      <img
                        src={l.images[0]}
                        alt=""
                        className="h-20 w-28 flex-none rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-[180px]">
                      <div className="font-semibold">
                        {l ? `${l.year} ${l.brand} ${l.model}` : "Listing"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {b.type === "reserve"
                          ? "Reservation"
                          : b.type === "test_drive"
                            ? "Test drive"
                            : "Purchase"}
                        {b.type === "test_drive" && b.scheduledDate
                          ? ` · ${new Date(b.scheduledDate).toLocaleDateString()}`
                          : ` · ${new Date(b.createdAt).toLocaleDateString()}`}
                      </div>
                      <Badge variant="outline" className="mt-2 capitalize">
                        {b.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {b.type === "reserve"
                          ? "Reserve fee"
                          : b.type === "test_drive"
                            ? "Test drive"
                            : "Down payment"}
                      </div>
                      <div className="text-lg font-bold">
                        {b.type === "test_drive"
                          ? "Free"
                          : formatPrice(
                              b.type === "reserve" ? (b.reserveFee ?? 0) : (b.downPayment ?? 0),
                            )}
                      </div>
                    </div>
                    {l && (
                      <Button asChild size="sm" variant="outline">
                        <Link to="/buy/$id" params={{ id: l.id }}>
                          View car
                        </Link>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="wishlist" className="mt-6">
          {wished.length === 0 ? (
            <EmptyState
              title="No saved cars"
              description="Tap the heart on any car to save it here."
              icon={<Heart className="h-6 w-6" />}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {wished.map((l) => (
                <CarCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tickets" className="mt-6">
          {myTickets.length === 0 ? (
            <EmptyState
              title="No tickets"
              description="Need help? Open one from our Support page."
              icon={<MessageSquare className="h-6 w-6" />}
              action={
                <Button asChild>
                  <Link to="/support">Get help</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {myTickets.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
                >
                  <div>
                    <div className="font-semibold">{t.subject}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.category} · {new Date(t.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize">
                    {t.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SignedOut() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Sign in to access your dashboard</h1>
      <p className="mt-2 text-muted-foreground">Track your listings, offers and support tickets.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Button asChild>
          <Link to="/login">Sign in</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/register">Create account</Link>
        </Button>
      </div>
    </div>
  );
}

function ListingRow({
  listing,
  offers,
  bookings,
}: {
  listing: import("@/lib/types").Listing;
  offers: import("@/lib/types").Offer[];
  bookings: import("@/lib/types").Booking[];
}) {
  const [showAnalytics, setShowAnalytics] = useState(false);
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <img
          src={listing.images[0]}
          alt=""
          className="h-20 w-28 flex-none rounded-lg object-cover"
        />
        <div className="flex-1 min-w-[180px]">
          <div className="font-semibold">
            {listing.year} {listing.brand} {listing.model}
          </div>
          <div className="text-xs text-muted-foreground">
            {listing.variant} · {listing.kmDriven.toLocaleString()} km
          </div>
          <div className="mt-2">
            <StatusBadge status={listing.status} />
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Asking</div>
          <div className="text-lg font-bold">{formatPrice(listing.expectedPrice)}</div>
        </div>
        <div className="flex flex-col gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/buy/$id" params={{ id: listing.id }}>
              View
            </Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowAnalytics((s) => !s)}>
            {showAnalytics ? "Hide" : "Analytics"}
          </Button>
        </div>
      </div>
      {showAnalytics && <ListingAnalytics listing={listing} offers={offers} bookings={bookings} />}
    </div>
  );
}

const OFFER_STATE_META: Record<OfferState, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-warning/15 text-warning border-warning/40" },
  accepted: { label: "Accepted", cls: "bg-success/15 text-success border-success/40" },
  declined: { label: "Declined", cls: "bg-destructive/15 text-destructive border-destructive/40" },
  countered: { label: "Countered", cls: "bg-primary/15 text-primary border-primary/40" },
};

function OfferRow({
  offer,
  updateOffer,
  listings,
}: {
  offer: import("@/lib/types").Offer;
  updateOffer: (id: string, patch: Partial<import("@/lib/types").Offer>) => void;
  listings: import("@/lib/types").Listing[];
}) {
  const l = listings.find((l) => l.id === offer.listingId);
  const asking = l ? (l.pricing?.finalPrice ?? l.expectedPrice) : 0;
  const [countering, setCountering] = useState(false);
  const [counter, setCounter] = useState<number>(Math.round(offer.amount * 1.01));
  const state = offer.state ?? "pending";
  const meta = OFFER_STATE_META[state];

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-semibold">{l ? `${l.brand} ${l.model}` : "Listing"}</div>
          <div className="text-xs text-muted-foreground">
            {offer.buyerName} · {new Date(offer.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-xs text-muted-foreground">Offer</div>
            <div className="text-xl font-bold">{formatPrice(offer.amount)}</div>
          </div>
          {asking > 0 && (
            <div>
              <div className="text-xs text-muted-foreground">Asking</div>
              <div className="font-medium">{formatPrice(asking)}</div>
            </div>
          )}
          <Badge variant="outline" className={`border ${meta.cls}`}>
            {meta.label}
          </Badge>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">“{offer.message}”</p>
      {offer.counterAmount != null && (
        <p className="mt-2 text-sm">
          <span className="text-muted-foreground">Your counter:</span>{" "}
          <b className="text-primary">{formatPrice(offer.counterAmount)}</b>
        </p>
      )}
      {countering && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Input
            type="number"
            value={counter}
            onChange={(e) => setCounter(+e.target.value)}
            className="w-40"
          />
          <Button
            size="sm"
            onClick={() => {
              updateOffer(offer.id, { state: "countered", counterAmount: counter });
              toast.success(`Counter sent: ${formatPrice(counter)}`);
              setCountering(false);
            }}
          >
            Send counter
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setCountering(false)}>
            Cancel
          </Button>
        </div>
      )}
      {!countering && state !== "accepted" && state !== "declined" && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => {
              updateOffer(offer.id, { state: "accepted" });
              toast.success("Offer accepted — buyer notified");
            }}
          >
            Accept
          </Button>
          <Button size="sm" variant="outline" onClick={() => setCountering(true)}>
            Counter
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              updateOffer(offer.id, { state: "declined" });
              toast.success("Offer declined");
            }}
          >
            Decline
          </Button>
        </div>
      )}
    </div>
  );
}

function BuyerOfferRow({
  offer,
  updateOffer,
  listings,
}: {
  offer: import("@/lib/types").Offer;
  updateOffer: (id: string, patch: Partial<import("@/lib/types").Offer>) => void;
  listings: import("@/lib/types").Listing[];
}) {
  const l = listings.find((l) => l.id === offer.listingId);
  const state = offer.state ?? "pending";
  const meta = OFFER_STATE_META[state];
  const [recountering, setRecountering] = useState(false);
  const [recounter, setRecounter] = useState<number>(
    Math.round((offer.counterAmount ?? offer.amount) * 0.98),
  );

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-semibold">{l ? `${l.brand} ${l.model}` : "Listing"}</div>
          <div className="text-xs text-muted-foreground">
            Your offer · {new Date(offer.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-xs text-muted-foreground">Your offer</div>
            <div className="text-xl font-bold">{formatPrice(offer.amount)}</div>
          </div>
          {offer.counterAmount != null && (
            <div>
              <div className="text-xs text-muted-foreground">Seller counter</div>
              <div className="font-bold text-primary">{formatPrice(offer.counterAmount)}</div>
            </div>
          )}
          <Badge variant="outline" className={`border ${meta.cls}`}>
            {meta.label}
          </Badge>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">"{offer.message}"</p>

      {state === "countered" && !recountering && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => {
              updateOffer(offer.id, { state: "accepted" });
              toast.success("Counter accepted — seller notified");
            }}
          >
            Accept counter
          </Button>
          <Button size="sm" variant="outline" onClick={() => setRecountering(true)}>
            Re-counter
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              updateOffer(offer.id, { state: "declined" });
              toast.success("Offer withdrawn");
            }}
          >
            Withdraw
          </Button>
        </div>
      )}

      {recountering && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Input
            type="number"
            value={recounter}
            onChange={(e) => setRecounter(+e.target.value)}
            className="w-40"
          />
          <Button
            size="sm"
            onClick={() => {
              updateOffer(offer.id, {
                state: "pending",
                amount: recounter,
                counterAmount: undefined,
              });
              toast.success(`Re-counter sent: ${formatPrice(recounter)}`);
              setRecountering(false);
            }}
          >
            Send re-counter
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setRecountering(false)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
