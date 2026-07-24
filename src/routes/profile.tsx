import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, History, LogOut, Settings, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/lib/store";
import { CarCard } from "@/components/site/CarCard";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

const ROLE_LABEL: Record<string, string> = {
  user: "Buyer / Seller",
  admin: "Administrator",
  agent: "Agent",
};

function Profile() {
  const { user, updateProfile, logout, listings, recentlyViewed } = useApp();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: "",
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Please sign in</h1>
        <Button asChild className="mt-4">
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  const recent = listings.filter((l) => recentlyViewed.includes(l.id)).slice(0, 3);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep your details current — they’re used across listings and bookings.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/settings">
            <Settings className="mr-1 h-4 w-4" /> Settings
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-semibold">{user.name}</div>
                <Badge variant="outline" className="capitalize">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  {ROLE_LABEL[user.role] ?? user.role}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
          <form
            className="mt-8 grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.name.trim()) {
                toast.error("Name cannot be empty");
                return;
              }
              updateProfile({ name: form.name, email: form.email, phone: form.phone });
              toast.success("Profile saved");
            }}
          >
            <div>
              <Label>Full name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Input value={ROLE_LABEL[user.role] ?? user.role} disabled />
            </div>
            <div className="md:col-span-2">
              <Label>Address</Label>
              <Textarea
                rows={3}
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Flat / House no, street, city, PIN"
              />
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-2">
              <Button type="submit">Save changes</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  logout();
                  toast.success("Signed out");
                }}
              >
                <LogOut className="mr-1 h-4 w-4" /> Sign out
              </Button>
            </div>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Recent activity</h3>
            </div>
            <Separator className="my-3" />
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No cars viewed yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recent.map((l) => (
                  <li key={l.id} className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <Link
                      to="/buy/$id"
                      params={{ id: l.id }}
                      className="truncate text-muted-foreground hover:text-foreground"
                    >
                      {l.year} {l.brand} {l.model}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="ghost" size="sm" className="mt-3 w-full">
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </aside>
      </div>

      {recent.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-5 text-xl font-semibold">Recently viewed</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((l) => (
              <CarCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
