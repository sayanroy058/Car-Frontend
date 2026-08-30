import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BadgeCheck,
  Briefcase,
  Camera,
  Car,
  CheckCircle2,
  Gauge,
  IndianRupee,
  Inbox,
  LifeBuoy,
  Loader2,
  Package,
  Plus,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/lib/store";
import { calculateFinalPrice } from "@/lib/constants";
import { BRANDS, BODY_TYPES, FUEL_TYPES, OWNERSHIP, STATES, TRANSMISSIONS } from "@/lib/constants";
import { POPULAR_BRANDS, modelNamesFor, resolveSpecs, variantNamesFor } from "@/lib/catalogue";
import { citiesFor, stateFromRegistrationNumber } from "@/lib/regions";
import { formatPrice, StatusBadge } from "@/components/site/CarCard";
import { PlainNumberInput } from "@/components/site/FormFields";
import { TableSkeleton } from "@/components/site/Skeletons";
import { Seo } from "@/components/site/Seo";
import { getListings, getTickets, uploadImages, createListing, patchListing, assetUrl } from "@/lib/api";
import { qk } from "@/lib/queries";
import type { Listing, TicketStatus } from "@/lib/types";

export const Route = createFileRoute("/admin")({
  component: Admin,
  pendingComponent: () => (
    <div className="container mx-auto px-4 py-8">
      <TableSkeleton rows={6} />
    </div>
  ),
  loader: async ({ context }) => {
    // Tickets are user-scoped and loaded by the store; only listings are public.
    await context.queryClient.ensureQueryData({
      queryKey: qk.listings,
      queryFn: () => getListings(),
    });
  },
});

function Admin() {
  const { user, listings, tickets, offers, bookings, updateTicket } = useApp();

  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Admin access required</h1>
        <p className="mt-2 text-muted-foreground">
          Sign in with an admin account or use the demo admin from the login page.
        </p>
        <Button asChild className="mt-4">
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  const totalRevenue = listings
    .filter((l) => l.pricing)
    .reduce((s, l) => s + l.pricing!.finalPrice * 0.13, 0);
  const stats = [
    { i: Car, label: "Total submissions", value: listings.length, trend: "+12%" },
    {
      i: Inbox,
      label: "Pending approvals",
      value: listings.filter(
        (l) => l.status === "pending_review" || l.status === "under_inspection",
      ).length,
      trend: "-3",
    },
    {
      i: Package,
      label: "Active listings",
      value: listings.filter((l) => l.status === "listed").length,
      trend: "+8%",
    },
    {
      i: CheckCircle2,
      label: "Sold",
      value: listings.filter((l) => l.status === "sold").length,
      trend: "+22%",
    },
    { i: IndianRupee, label: "Total revenue", value: formatPrice(totalRevenue), trend: "+18%" },
    {
      i: LifeBuoy,
      label: "Open tickets",
      value: tickets.filter((t) => t.status !== "resolved").length,
      trend: "",
    },
  ];

  const monthly = [
    { m: "Jan", sales: 8, revenue: 280 },
    { m: "Feb", sales: 12, revenue: 410 },
    { m: "Mar", sales: 15, revenue: 520 },
    { m: "Apr", sales: 18, revenue: 640 },
    { m: "May", sales: 22, revenue: 790 },
    { m: "Jun", sales: 28, revenue: 960 },
  ];
  const statusData = (
    ["pending_review", "under_inspection", "approved", "listed", "sold", "rejected"] as const
  ).map((s) => ({
    name: s.replace("_", " "),
    value: listings.filter((l) => l.status === s).length,
  }));
  const COLORS = [
    "oklch(0.78 0.16 75)",
    "oklch(0.78 0.16 195)",
    "oklch(0.65 0.16 160)",
    "oklch(0.6 0.13 185)",
    "oklch(0.55 0.04 260)",
    "oklch(0.65 0.22 25)",
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Seo
        title="Admin console — DriveHub"
        description="Operations dashboard for listings, approvals, and tickets."
        canonical="/admin"
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin console
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold">Operations dashboard</h1>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search anything..." className="pl-9" />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {s.label}
              </span>
              <s.i className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="mt-2 font-display text-xl font-bold">{s.value}</div>
            {s.trend && (
              <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-success">
                <TrendingUp className="h-2.5 w-2.5" />
                {s.trend}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5 card-elevated lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold">Sales & revenue</h3>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.6 0.13 185)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="oklch(0.6 0.13 185)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.16 195)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.78 0.16 195)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="m" stroke="oklch(0.7 0.02 250)" fontSize={12} />
              <YAxis stroke="oklch(0.7 0.02 250)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.18 0.03 260)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  borderRadius: 8,
                }}
              />
              <Area type="monotone" dataKey="sales" stroke="oklch(0.6 0.13 185)" fill="url(#gp)" />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="oklch(0.78 0.16 195)"
                fill="url(#gr)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 card-elevated">
          <h3 className="mb-3 font-display text-sm font-semibold">Inventory by status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5 card-elevated">
          <h3 className="mb-3 font-display text-sm font-semibold">Conversion funnel</h3>
          <ConversionFunnel listings={listings} offers={offers} bookings={bookings} />
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 card-elevated">
          <h3 className="mb-3 font-display text-sm font-semibold">Revenue summary</h3>
          <RevenueSummary listings={listings} bookings={bookings} />
        </div>
      </div>

      <Tabs defaultValue="approvals" className="mt-8">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="approvals">Approval queue</TabsTrigger>
          <TabsTrigger value="offers">Offers ({offers.length})</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="add-car">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Car
          </TabsTrigger>
          <TabsTrigger value="tickets">Support tickets</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="mt-6">
          <ApprovalQueue />
        </TabsContent>

        <TabsContent value="offers" className="mt-6">
          <OffersTable offers={offers} listings={listings} />
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <BookingsTable bookings={bookings} listings={listings} />
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">Car</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Asking</th>
                  <th className="p-3">Final</th>
                  <th className="p-3">Views</th>
                  <th className="p-3">Listed</th>
                  <th className="p-3">Assured</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l.id} className="border-b border-border/40 last:border-0">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={l.images[0]} className="h-10 w-14 rounded object-cover" alt="" />
                        <div>
                          <div className="font-medium">
                            {l.brand} {l.model}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {l.year} · {l.variant}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="p-3">{formatPrice(l.expectedPrice)}</td>
                    <td className="p-3 font-medium">
                      {l.pricing ? formatPrice(l.pricing.finalPrice) : "—"}
                    </td>
                    <td className="p-3 text-muted-foreground">{l.views ?? 0}</td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <AssuredCell listing={l} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="add-car" className="mt-6">
          <AddCarForm />
        </TabsContent>

        <TabsContent value="tickets" className="mt-6">
          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4 card-elevated"
              >
                <div className="min-w-[200px] flex-1">
                  <div className="font-display font-semibold">{t.subject}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.name} · {t.email} · {t.category}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{t.message}</p>
                </div>
                <Select
                  value={t.status}
                  onValueChange={(v) => {
                    updateTicket(t.id, { status: v as TicketStatus });
                    toast.success("Ticket updated");
                  }}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="waiting_customer">Waiting customer</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="rounded-2xl border border-border/60 bg-card p-5 card-elevated">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold">Seller activity</h3>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={[
                  { m: "Jan", sellers: 12, buyers: 34 },
                  { m: "Feb", sellers: 18, buyers: 42 },
                  { m: "Mar", sellers: 22, buyers: 56 },
                  { m: "Apr", sellers: 30, buyers: 71 },
                  { m: "May", sellers: 36, buyers: 88 },
                  { m: "Jun", sellers: 41, buyers: 102 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
                <XAxis dataKey="m" stroke="oklch(0.7 0.02 250)" fontSize={12} />
                <YAxis stroke="oklch(0.7 0.02 250)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.18 0.03 260)",
                    border: "1px solid oklch(1 0 0 / 0.1)",
                    borderRadius: 8,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="sellers" fill="oklch(0.6 0.13 185)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="buyers" fill="oklch(0.78 0.16 195)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Deterministic inspection score per listing (0-10)
function inspectionScore(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return +((h % 30) / 10 + 7).toFixed(1); // 7.0 - 9.9
}
function scoreTone(s: number) {
  if (s >= 9) return "bg-success/15 text-success border-success/30";
  if (s >= 8) return "bg-primary/15 text-primary border-primary/30";
  return "bg-warning/15 text-warning border-warning/30";
}

type SourceFilter = "all" | "agent" | "direct";
type StatusFilter = "queue" | "pending_review" | "under_inspection" | "approved";

function ApprovalQueue() {
  const { listings, updateListing } = useApp();
  const [source, setSource] = useState<SourceFilter>("all");
  const [statusF, setStatusF] = useState<StatusFilter>("queue");

  const queue = listings.filter(
    (l) =>
      l.status === "pending_review" || l.status === "under_inspection" || l.status === "approved",
  );
  const filtered = queue.filter((l) => {
    if (source === "agent" && !l.sellerId.startsWith("agent-")) return false;
    if (source === "direct" && l.sellerId.startsWith("agent-")) return false;
    if (statusF !== "queue" && l.status !== statusF) return false;
    return true;
  });

  const counts = {
    all: queue.length,
    agent: queue.filter((l) => l.sellerId.startsWith("agent-")).length,
    direct: queue.filter((l) => !l.sellerId.startsWith("agent-")).length,
  };

  async function bulkApprove() {
    let success = 0;
    for (const l of filtered) {
      const p = {
        basePrice: l.expectedPrice,
        refurbishment: Math.round(l.expectedPrice * 0.04),
        repair: Math.round(l.expectedPrice * 0.02),
        transportation: 35000,
        inspection: 18000,
        documentation: 12000,
        commission: Math.round(l.expectedPrice * 0.05),
        margin: Math.round(l.expectedPrice * 0.08),
      };
      const finalPrice = calculateFinalPrice(p);
      try {
        await patchListing(l.id, { status: "listed", pricing: { ...p, finalPrice } });
        updateListing(l.id, { status: "listed", pricing: { ...p, finalPrice } });
        success++;
      } catch { /* skip failed */ }
    }
    if (success > 0) toast.success(`${success} listing(s) approved & published`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-3 card-elevated">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", `All (${counts.all})`],
              ["agent", `Agent onboarded (${counts.agent})`],
              ["direct", `Direct sellers (${counts.direct})`],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setSource(k)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${source === k ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
          <span className="mx-1 h-6 w-px bg-border/60" />
          {(["queue", "pending_review", "under_inspection", "approved"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setStatusF(k)}
              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition ${statusF === k ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground"}`}
            >
              {k === "queue" ? "All statuses" : k.replace("_", " ")}
            </button>
          ))}
        </div>
        {filtered.length > 0 && (
          <Button size="sm" variant="outline" onClick={bulkApprove}>
            <CheckCircle2 className="mr-1 h-4 w-4" />
            Approve all ({filtered.length})
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card p-10 text-center text-sm text-muted-foreground">
          Nothing in the queue matches these filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((l) => (
            <ApprovalRow key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApprovalRow({ listing }: { listing: Listing }) {
  const { updateListing } = useApp();
  const [open, setOpen] = useState(false);
  const [p, setP] = useState({
    basePrice: listing.expectedPrice,
    refurbishment: listing.pricing?.refurbishment ?? Math.round(listing.expectedPrice * 0.04),
    repair: listing.pricing?.repair ?? Math.round(listing.expectedPrice * 0.02),
    transportation: listing.pricing?.transportation ?? 35000,
    inspection: listing.pricing?.inspection ?? 18000,
    documentation: listing.pricing?.documentation ?? 12000,
    commission: listing.pricing?.commission ?? Math.round(listing.expectedPrice * 0.05),
    margin: listing.pricing?.margin ?? Math.round(listing.expectedPrice * 0.08),
  });
  const final = useMemo(() => calculateFinalPrice(p), [p]);

  async function approve() {
    try {
      await patchListing(listing.id, { status: "listed", pricing: { ...p, finalPrice: final } });
      updateListing(listing.id, { status: "listed", pricing: { ...p, finalPrice: final } });
      toast.success("Listing approved & published");
    } catch {
      toast.error("Failed to approve listing");
    }
    setOpen(false);
  }
  async function reject() {
    try {
      await patchListing(listing.id, { status: "rejected" });
      updateListing(listing.id, { status: "rejected" });
      toast.success("Listing rejected");
    } catch {
      toast.error("Failed to reject listing");
    }
  }

  const score = inspectionScore(listing.id);
  const isAgent = listing.sellerId.startsWith("agent-");

  async function quickApprove() {
    try {
      await patchListing(listing.id, { status: "listed", pricing: { ...p, finalPrice: final } });
      updateListing(listing.id, { status: "listed", pricing: { ...p, finalPrice: final } });
      toast.success("Listing approved & published");
    } catch {
      toast.error("Failed to approve listing");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 card-elevated">
      <img src={listing.images[0]} alt="" className="h-20 w-28 flex-none rounded-lg object-cover" />
      <div className="min-w-[220px] flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="font-display font-semibold">
            {listing.year} {listing.brand} {listing.model}
          </div>
          {isAgent && (
            <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
              <Briefcase className="h-3 w-3" />
              Agent
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {listing.sellerName} · {listing.registrationCity} · {listing.kmDriven.toLocaleString()} km
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={listing.status} />
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${scoreTone(score)}`}
          >
            <Gauge className="h-3 w-3" />
            Inspection {score}/10
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-muted-foreground">Asking</div>
        <div className="font-display text-lg font-bold">{formatPrice(listing.expectedPrice)}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          Est. final <b className="text-foreground">{formatPrice(final)}</b>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={quickApprove}>
          <CheckCircle2 className="mr-1 h-4 w-4" />
          Approve
        </Button>
        <Button size="sm" variant="ghost" onClick={reject}>
          <XCircle className="mr-1 h-4 w-4" />
          Reject
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Review & price</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-2">
                {listing.year} {listing.brand} {listing.model} {listing.variant}
                {isAgent && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                    <Briefcase className="h-3 w-3" />
                    Agent
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${scoreTone(score)}`}
                >
                  <Gauge className="h-3 w-3" />
                  Inspection {score}/10
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <img
                  src={listing.images[0]}
                  className="aspect-video w-full rounded-lg object-cover"
                  alt=""
                />
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {listing.images.slice(1, 5).map((s, i) => (
                    <img key={i} src={s} className="aspect-square rounded object-cover" alt="" />
                  ))}
                </div>
                <div className="mt-3 rounded-xl border border-border/60 bg-secondary/40 p-3 text-xs">
                  <div>
                    <b>Seller:</b> {listing.sellerName} · {listing.sellerPhone}
                  </div>
                  <div className="mt-1">
                    <b>VIN:</b> {listing.vin || "—"}
                  </div>
                  <div className="mt-1">
                    <b>Defects:</b> {listing.defects || "—"}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold">Cost breakdown</h4>
                <div className="mt-3 space-y-2">
                  {(
                    [
                      ["basePrice", "Base price"],
                      ["refurbishment", "Refurbishment"],
                      ["repair", "Repair"],
                      ["transportation", "Transportation"],
                      ["inspection", "Inspection"],
                      ["documentation", "Documentation"],
                      ["commission", "Platform commission"],
                      ["margin", "Margin"],
                    ] as const
                  ).map(([k, label]) => (
                    <div key={k} className="grid grid-cols-2 items-center gap-3">
                      <Label className="text-xs">{label}</Label>
                      <Input
                        type="number"
                        value={p[k]}
                        onChange={(e) => setP({ ...p, [k]: +e.target.value })}
                        className="h-8"
                      />
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/15 to-accent/15 p-3">
                  <span className="font-display text-sm font-semibold">Final selling price</span>
                  <span className="font-display text-2xl font-bold gradient-text">
                    {formatPrice(final)}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={approve} className="flex-1">
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Approve & publish
                  </Button>
                  <Button onClick={reject} variant="outline">
                    <XCircle className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function ConversionFunnel({
  listings,
  offers,
  bookings,
}: {
  listings: Listing[];
  offers: import("@/lib/types").Offer[];
  bookings: import("@/lib/types").Booking[];
}) {
  const totalViews = listings.reduce((s, l) => s + (l.views ?? 0), 0);
  const totalWishlist = Math.round(totalViews * 0.15);
  const totalOffers = offers.length;
  const totalBookings = bookings.length;
  const data = [
    { stage: "Views", value: totalViews },
    { stage: "Wishlist", value: totalWishlist },
    { stage: "Offers", value: totalOffers },
    { stage: "Bookings", value: totalBookings },
  ];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
        <XAxis type="number" stroke="oklch(0.7 0.02 250)" fontSize={11} />
        <YAxis
          dataKey="stage"
          type="category"
          stroke="oklch(0.7 0.02 250)"
          fontSize={11}
          width={70}
        />
        <Tooltip
          contentStyle={{
            background: "oklch(0.18 0.03 260)",
            border: "1px solid oklch(1 0 0 / 0.1)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="value" fill="oklch(0.6 0.13 185)" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function RevenueSummary({
  listings,
  bookings,
}: {
  listings: Listing[];
  bookings: import("@/lib/types").Booking[];
}) {
  const soldRevenue = listings
    .filter((l) => l.pricing)
    .reduce((s, l) => s + l.pricing!.finalPrice * 0.13, 0);
  const bookingRevenue = bookings
    .filter((b) => b.type === "purchase")
    .reduce((s, b) => s + (b.downPayment ?? 0), 0);
  const reserveRevenue = bookings
    .filter((b) => b.type === "reserve")
    .reduce((s, b) => s + (b.reserveFee ?? 0), 0);
  const rows = [
    ["Commission from sales", formatPrice(soldRevenue)],
    ["Purchase down payments", formatPrice(bookingRevenue)],
    ["Reservation fees", formatPrice(reserveRevenue)],
  ];
  return (
    <div className="space-y-3">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex items-center justify-between border-b border-border/60 pb-2 text-sm last:border-0"
        >
          <span className="text-muted-foreground">{label}</span>
          <span className="font-display font-bold">{value}</span>
        </div>
      ))}
      <Separator />
      <div className="flex items-center justify-between pt-1">
        <span className="font-display text-sm font-semibold">Total revenue</span>
        <span className="font-display text-2xl font-bold gradient-text">
          {formatPrice(soldRevenue + bookingRevenue + reserveRevenue)}
        </span>
      </div>
    </div>
  );
}

function OffersTable({
  offers,
  listings,
}: {
  offers: import("@/lib/types").Offer[];
  listings: Listing[];
}) {
  if (offers.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-10 text-center text-sm text-muted-foreground">
        No offers to review.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="p-3">Car</th>
            <th className="p-3">Buyer</th>
            <th className="p-3">Offer</th>
            <th className="p-3">Asking</th>
            <th className="p-3">State</th>
            <th className="p-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((o) => {
            const l = listings.find((l) => l.id === o.listingId);
            const asking = l ? (l.pricing?.finalPrice ?? l.expectedPrice) : 0;
            return (
              <tr key={o.id} className="border-b border-border/40 last:border-0">
                <td className="p-3">
                  {l ? `${l.brand} ${l.model}` : "—"}
                  <div className="text-xs text-muted-foreground">{l?.variant}</div>
                </td>
                <td className="p-3">{o.buyerName}</td>
                <td className="p-3 font-medium">{formatPrice(o.amount)}</td>
                <td className="p-3 text-muted-foreground">{formatPrice(asking)}</td>
                <td className="p-3">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize">
                    {o.state ?? "pending"}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BookingsTable({
  bookings,
  listings,
}: {
  bookings: import("@/lib/types").Booking[];
  listings: Listing[];
}) {
  const { updateBooking } = useApp();

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-10 text-center text-sm text-muted-foreground">
        No bookings yet.
      </div>
    );
  }

  const typeLabel: Record<string, string> = {
    reserve: "Reservation",
    purchase: "Purchase",
    test_drive: "Test drive",
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="p-3">Buyer</th>
            <th className="p-3">Car</th>
            <th className="p-3">Type</th>
            <th className="p-3">Scheduled</th>
            <th className="p-3">City</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => {
            const l = listings.find((l) => l.id === b.listingId);
            return (
              <tr key={b.id} className="border-b border-border/40 last:border-0">
                <td className="p-3">
                  {b.buyerName}
                  <div className="text-xs text-muted-foreground">{b.buyerPhone}</div>
                </td>
                <td className="p-3">
                  {l ? `${l.year} ${l.brand} ${l.model}` : "—"}
                </td>
                <td className="p-3">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize">
                    {typeLabel[b.type] ?? b.type}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">
                  {b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString() : "—"}
                </td>
                <td className="p-3 text-muted-foreground">{b.city ?? "—"}</td>
                <td className="p-3">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize">
                    {b.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={b.status === "confirmed"}
                      onClick={() => updateBooking(b.id, { status: "confirmed" })}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={b.status === "cancelled"}
                      onClick={() => updateBooking(b.id, { status: "cancelled" })}
                    >
                      Cancel
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Add Car form for admins ──

/**
 * Paid "Assured" promotion. Plans set an expiry; a listing is promoted while
 * that expiry is in the future, and the card labels it as promoted so it is not
 * passed off as an organic result.
 *
 * Payment capture is not wired up yet — an admin grants the placement after
 * payment is confirmed out of band, and records the reference. Until a payment
 * gateway is integrated this is deliberately admin-only, which is also why the
 * API rejects assured* fields from non-admin callers.
 */
const ASSURED_PLANS: { id: string; label: string; days: number }[] = [
  { id: "assured-7", label: "7 days", days: 7 },
  { id: "assured-15", label: "15 days", days: 15 },
  { id: "assured-30", label: "30 days", days: 30 },
];

function AssuredCell({ listing }: { listing: Listing }) {
  const { updateListing } = useApp();
  const [busy, setBusy] = useState(false);
  const active = (listing.assuredUntil ?? 0) > Date.now();

  async function grant(planId: string) {
    const plan = ASSURED_PLANS.find((p) => p.id === planId);
    if (!plan) return;
    const paymentId = window.prompt(
      `Payment reference for ${plan.label} Assured placement (leave blank if collected offline):`,
    );
    if (paymentId === null) return; // cancelled

    const patch = {
      assuredPlan: plan.id,
      assuredUntil: Date.now() + plan.days * 86400000,
      assuredPaymentId: paymentId || undefined,
    };
    setBusy(true);
    try {
      await patchListing(listing.id, patch);
      updateListing(listing.id, patch);
      toast.success(`Promoted for ${plan.label}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't promote listing");
    } finally {
      setBusy(false);
    }
  }

  async function revoke() {
    const patch = { assuredPlan: undefined, assuredUntil: 0, assuredPaymentId: undefined };
    setBusy(true);
    try {
      await patchListing(listing.id, { assuredUntil: 0 });
      updateListing(listing.id, patch);
      toast.success("Promotion removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't remove promotion");
    } finally {
      setBusy(false);
    }
  }

  if (active) {
    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
          <BadgeCheck className="h-3 w-3" />
          Until {new Date(listing.assuredUntil!).toLocaleDateString()}
        </span>
        <button
          onClick={revoke}
          disabled={busy}
          className="w-fit text-[11px] text-muted-foreground underline hover:text-destructive"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <Select onValueChange={grant} disabled={busy}>
      <SelectTrigger className="h-8 w-28 text-xs">
        <SelectValue placeholder="Promote" />
      </SelectTrigger>
      <SelectContent>
        {ASSURED_PLANS.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Blank starting state. Numeric fields are undefined rather than pre-filled so
 * an admin cannot accidentally publish a placeholder year, odometer or price.
 */
const EMPTY_CAR_FORM = {
  brand: "",
  model: "",
  variant: "",
  bodyType: "",
  year: undefined as number | undefined,
  registrationYear: undefined as number | undefined,
  fuelType: "",
  transmission: "",
  kmDriven: undefined as number | undefined,
  ownership: "1st Owner",
  registrationNumber: "",
  registrationState: "",
  registrationCity: "",
  vin: "",
  insuranceStatus: "Active",
  roadTaxStatus: "Paid",
  serviceHistory: "Complete dealer history",
  accidentHistory: "No accidents",
  keys: 2,
  exteriorCondition: "Excellent",
  interiorCondition: "Excellent",
  engineCondition: "Excellent",
  tireCondition: "Good (70%+)",
  batteryCondition: "Good",
  defects: "",
  modifications: "None",
  description: "",
  highlights: [] as string[],
  expectedPrice: undefined as number | undefined,
  address: "",
  preferredContactTime: "Afternoon (12-5)",
  status: "listed" as Listing["status"],
};

function AddCarForm() {
  const { user, addListing } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(EMPTY_CAR_FORM);

  // Catalogue-driven options, mirroring the seller and agent forms.
  const models = modelNamesFor(form.brand);
  const variants = variantNamesFor(form.brand, form.model);
  const cities = citiesFor(form.registrationState);
  const specs = resolveSpecs(form.brand, form.model, form.variant);

  // Selecting a variant fills body type, fuel and gearbox; changing a parent
  // clears its dependents so a mismatched combination cannot be submitted.
  useEffect(() => {
    setForm((prev) => {
      const validModels = modelNamesFor(prev.brand);
      if (prev.model && !validModels.includes(prev.model)) {
        return { ...prev, model: "", variant: "" };
      }
      const validVariants = variantNamesFor(prev.brand, prev.model);
      if (prev.variant && !validVariants.includes(prev.variant)) {
        return { ...prev, variant: "" };
      }
      return prev;
    });
  }, [form.brand, form.model]);

  useEffect(() => {
    if (!specs) return;
    setForm((prev) => ({
      ...prev,
      bodyType: specs.bodyType,
      fuelType: specs.fuelType,
      transmission: specs.transmission,
    }));
  }, [form.brand, form.model, form.variant]);

  useEffect(() => {
    const derived = stateFromRegistrationNumber(form.registrationNumber);
    if (derived && derived !== form.registrationState) {
      setForm((prev) => ({ ...prev, registrationState: derived, registrationCity: "" }));
    }
  }, [form.registrationNumber]);

  useEffect(() => {
    if (form.registrationCity && !citiesFor(form.registrationState).includes(form.registrationCity)) {
      setForm((prev) => ({ ...prev, registrationCity: "" }));
    }
  }, [form.registrationState]);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;
    setFiles((prev) => [...prev, ...selected]);
    const newPreviews = selected.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeFile(idx: number) {
    URL.revokeObjectURL(previews[idx]);
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  function setField(f: string, v: unknown) {
    setForm((prev) => ({ ...prev, [f]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const missing: string[] = [];
    if (!form.brand) missing.push("brand");
    if (!form.model) missing.push("model");
    if (!form.variant) missing.push("variant");
    if (form.year === undefined) missing.push("year");
    if (form.kmDriven === undefined) missing.push("kilometers");
    if (form.expectedPrice === undefined) missing.push("price");
    if (missing.length) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return;
    }
    if (!user) {
      toast.error("You must be logged in as admin");
      return;
    }

    setUploading(true);
    try {
      let imageUrls: string[] = [];
      if (files.length > 0) {
        imageUrls = await uploadImages(files);
      } else {
        imageUrls = [assetUrl("/uploads/fallback-0.jpg"), assetUrl("/uploads/fallback-1.jpg"), assetUrl("/uploads/fallback-2.jpg")];
      }

      const resolved = resolveSpecs(form.brand, form.model, form.variant);

      const listingData: Omit<Listing, "id" | "createdAt"> = {
        sellerId: user.id,
        sellerName: user.name,
        sellerEmail: user.email,
        sellerPhone: user.phone ?? "",
        brand: form.brand,
        model: form.model,
        variant: form.variant,
        year: form.year!,
        registrationYear: form.registrationYear ?? form.year!,
        fuelType: form.fuelType,
        transmission: form.transmission,
        kmDriven: form.kmDriven!,
        ownership: form.ownership,
        registrationState: form.registrationState,
        registrationCity: form.registrationCity,
        vin: form.vin,
        registrationNumber: form.registrationNumber || undefined,
        insuranceStatus: form.insuranceStatus,
        roadTaxStatus: form.roadTaxStatus,
        serviceHistory: form.serviceHistory,
        accidentHistory: form.accidentHistory,
        keys: form.keys,
        exteriorCondition: form.exteriorCondition,
        interiorCondition: form.interiorCondition,
        engineCondition: form.engineCondition,
        tireCondition: form.tireCondition,
        batteryCondition: form.batteryCondition,
        defects: form.defects,
        modifications: form.modifications,
        description: form.description,
        highlights: form.highlights,
        expectedPrice: form.expectedPrice!,
        address: form.address,
        preferredContactTime: form.preferredContactTime,
        bodyType: form.bodyType,
        images: imageUrls,
        status: form.status,
        // Specs from the catalogue rather than typed values.
        ...(resolved ?? {}),
      };

      const created = await createListing(listingData);
      // Admins may publish directly; the API forces pending_review on create, so
      // apply the chosen status as a follow-up admin-only patch.
      const final =
        form.status !== "pending_review"
          ? await patchListing(created.id, { status: form.status })
          : created;
      addListing(final);
      toast.success(`${form.brand} ${form.model} added to inventory!`);

      setFiles([]);
      setPreviews([]);
      setForm(EMPTY_CAR_FORM);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border/60 bg-card p-6">
      <h3 className="mb-6 font-display text-lg font-semibold">Add a new car to inventory</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label className="mb-1.5 block text-xs">Brand *</Label>
          <Select value={form.brand || undefined} onValueChange={(v) => setField("brand", v)}>
            <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {/* Popular brands first, then the rest alphabetically. */}
              {POPULAR_BRANDS.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
              <SelectSeparator />
              {BRANDS.filter((b) => !POPULAR_BRANDS.includes(b as (typeof POPULAR_BRANDS)[number]))
                .map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Model *</Label>
          <Select
            value={form.model || undefined}
            onValueChange={(v) => setField("model", v)}
            disabled={!form.brand}
          >
            <SelectTrigger>
              <SelectValue placeholder={form.brand ? "Select model" : "Select a brand first"} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {models.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Variant *</Label>
          <Select
            value={form.variant || undefined}
            onValueChange={(v) => setField("variant", v)}
            disabled={!form.model}
          >
            <SelectTrigger>
              <SelectValue placeholder={form.model ? "Select variant" : "Select a model first"} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {variants.map((vr) => (<SelectItem key={vr} value={vr}>{vr}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Body type</Label>
          <Select value={form.bodyType || undefined} onValueChange={(v) => setField("bodyType", v)}>
            <SelectTrigger><SelectValue placeholder="Select body type" /></SelectTrigger>
            <SelectContent>{BODY_TYPES.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Year *</Label>
          <PlainNumberInput
            value={form.year}
            onChange={(v) => setField("year", v)}
            placeholder="e.g. 2022"
            grouped={false}
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Registration year</Label>
          <PlainNumberInput
            value={form.registrationYear}
            onChange={(v) => setField("registrationYear", v)}
            placeholder="e.g. 2022"
            grouped={false}
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Fuel type</Label>
          <Select value={form.fuelType || undefined} onValueChange={(v) => setField("fuelType", v)}>
            <SelectTrigger><SelectValue placeholder="Select fuel" /></SelectTrigger>
            <SelectContent>{FUEL_TYPES.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Transmission</Label>
          <Select value={form.transmission || undefined} onValueChange={(v) => setField("transmission", v)}>
            <SelectTrigger><SelectValue placeholder="Select transmission" /></SelectTrigger>
            <SelectContent>{TRANSMISSIONS.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">KM driven *</Label>
          <PlainNumberInput
            value={form.kmDriven}
            onChange={(v) => setField("kmDriven", v)}
            placeholder="e.g. 35,000"
            suffix="km"
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Ownership</Label>
          <Select value={form.ownership} onValueChange={(v) => setField("ownership", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{OWNERSHIP.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Registration number</Label>
          <Input
            value={form.registrationNumber}
            onChange={(e) => setField("registrationNumber", e.target.value)}
            placeholder="e.g. MH12AB1234"
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">State</Label>
          <Select value={form.registrationState || undefined} onValueChange={(v) => setField("registrationState", v)}>
            <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
            <SelectContent className="max-h-72">{STATES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">City</Label>
          <Select
            value={form.registrationCity || undefined}
            onValueChange={(v) => setField("registrationCity", v)}
            disabled={!form.registrationState}
          >
            <SelectTrigger>
              <SelectValue placeholder={form.registrationState ? "Select city" : "Select a state first"} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {cities.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Expected price *</Label>
          <PlainNumberInput
            value={form.expectedPrice}
            onChange={(v) => setField("expectedPrice", v)}
            placeholder="e.g. 8,50,000"
            suffix="₹"
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Initial status</Label>
          <Select value={form.status} onValueChange={(v) => setField("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="listed">Listed (published)</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending_review">Pending review</SelectItem>
              <SelectItem value="under_inspection">Under inspection</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3">
          <Label className="mb-1.5 block text-xs">Description</Label>
          <Textarea rows={2} value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="Describe the car..." />
        </div>
        <div className="md:col-span-3">
          <Label className="mb-1.5 block text-xs">Car images</Label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="hidden"
              id="admin-car-images"
            />
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Camera className="mr-1.5 h-4 w-4" />
              Choose images
            </Button>
            <span className="text-xs text-muted-foreground">
              {files.length > 0 ? `${files.length} selected` : "No files chosen (fallback images will be used)"}
            </span>
          </div>
          {previews.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {previews.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} className="h-20 w-28 rounded-lg object-cover" alt={`Preview ${i + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-destructive text-destructive-foreground shadow"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-6">
        <Button type="submit" disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add to inventory
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
