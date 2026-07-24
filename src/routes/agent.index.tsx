import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Briefcase,
  Car,
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/lib/store";
import { formatPrice, StatusBadge } from "@/components/site/CarCard";
import { EmptyState } from "@/components/site/States";
import { TableSkeleton } from "@/components/site/Skeletons";
import { Seo } from "@/components/site/Seo";
import { getListings } from "@/lib/api";
import { qk } from "@/lib/queries";

export const Route = createFileRoute("/agent/")({
  component: AgentDashboard,
  pendingComponent: () => (
    <div className="container mx-auto px-4 py-8">
      <TableSkeleton rows={6} />
    </div>
  ),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: qk.listings,
      queryFn: () => getListings(),
    });
  },
});

function AgentDashboard() {
  const { user, listings } = useApp();

  if (!user || user.role !== "agent") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Agent access required</h1>
        <p className="mt-2 text-muted-foreground">
          Sign in as an agent or click "Demo Agent" in the navbar.
        </p>
        <Button asChild className="mt-4">
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  const mine = listings.filter((l) => l.sellerId === user.id);
  const listed = mine.filter((l) => l.status === "listed");
  const sold = mine.filter((l) => l.status === "sold");
  const pending = mine.filter(
    (l) => l.status === "pending_review" || l.status === "under_inspection",
  );
  const commission = mine.reduce((s, l) => s + (l.pricing ? l.pricing.commission : 0), 0);

  const stats = [
    { i: Car, label: "Cars onboarded", value: mine.length, trend: "+5 this week" },
    { i: ClipboardList, label: "Awaiting review", value: pending.length, trend: "" },
    { i: CheckCircle2, label: "Live listings", value: listed.length, trend: "" },
    { i: IndianRupee, label: "Commission earned", value: formatPrice(commission), trend: "+12%" },
  ];

  const perf = [
    { m: "Jan", cars: 4 },
    { m: "Feb", cars: 7 },
    { m: "Mar", cars: 6 },
    { m: "Apr", cars: 9 },
    { m: "May", cars: 12 },
    { m: "Jun", cars: 15 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Seo
        title="Agent console — DriveHub"
        description="Onboard cars and track your agent pipeline."
        canonical="/agent"
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Briefcase className="h-3.5 w-3.5" />
            Agent console
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold">Hi {user.name}</h1>
          <p className="text-sm text-muted-foreground">
            Onboard cars on behalf of walk-in sellers and track your pipeline.
          </p>
        </div>
        <Button asChild>
          <Link to="/agent/sell">
            <Plus className="mr-1 h-4 w-4" />
            Onboard a car
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {s.label}
              </span>
              <s.i className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 font-display text-2xl font-bold">{s.value}</div>
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
          <h3 className="mb-3 font-display text-sm font-semibold">Onboarding trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={perf}>
              <defs>
                <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.6 0.13 185)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="oklch(0.6 0.13 185)" stopOpacity={0} />
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
              <Area type="monotone" dataKey="cars" stroke="oklch(0.6 0.13 185)" fill="url(#ga)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 card-elevated">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold">This month</h3>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span className="text-muted-foreground">Sold</span>
              <b>{sold.length}</b>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Live</span>
              <b>{listed.length}</b>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Pending</span>
              <b>{pending.length}</b>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Avg. commission</span>
              <b>{formatPrice(mine.length ? commission / Math.max(mine.length, 1) : 0)}</b>
            </li>
          </ul>
        </div>
      </div>

      <Tabs defaultValue="all" className="mt-8">
        <TabsList>
          <TabsTrigger value="all">All ({mine.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="listed">Listed ({listed.length})</TabsTrigger>
          <TabsTrigger value="sold">Sold ({sold.length})</TabsTrigger>
        </TabsList>
        {(
          [
            ["all", mine],
            ["pending", pending],
            ["listed", listed],
            ["sold", sold],
          ] as const
        ).map(([k, arr]) => (
          <TabsContent key={k} value={k} className="mt-6">
            {arr.length === 0 ? (
              <EmptyState
                title="Nothing here yet"
                description="Onboard your first car to start earning commission."
                icon={<Car className="h-6 w-6" />}
                action={
                  <Button asChild>
                    <Link to="/agent/sell">Onboard a car</Link>
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3">Car</th>
                      <th className="p-3">Seller</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Asking</th>
                      <th className="p-3">Final</th>
                      <th className="p-3">Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arr.map((l) => (
                      <tr key={l.id} className="border-b border-border/40 last:border-0">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={l.images[0]}
                              className="h-10 w-14 rounded object-cover"
                              alt=""
                            />
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
                        <td className="p-3 text-muted-foreground">{l.sellerName}</td>
                        <td className="p-3">
                          <StatusBadge status={l.status} />
                        </td>
                        <td className="p-3">{formatPrice(l.expectedPrice)}</td>
                        <td className="p-3 font-medium">
                          {l.pricing ? formatPrice(l.pricing.finalPrice) : "—"}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(l.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
