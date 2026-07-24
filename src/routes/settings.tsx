import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Bell, LogOut, Monitor, Moon, Palette, Sun, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, theme, setTheme, logout, resetData } = useApp();
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [priceDrops, setPriceDrops] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [marketing, setMarketing] = useState(false);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage appearance, notifications, and your account.
      </p>

      {/* Appearance */}
      <Section icon={Palette} title="Appearance">
        <p className="mb-3 text-sm text-muted-foreground">
          Light mode is the default. Switch to dark any time — your choice is saved on this device.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <ThemeOption
            active={theme === "light"}
            onClick={() => setTheme("light")}
            icon={Sun}
            label="Light"
          />
          <ThemeOption
            active={theme === "dark"}
            onClick={() => setTheme("dark")}
            icon={Moon}
            label="Dark"
          />
          <ThemeOption
            active={false}
            onClick={() => {
              const prefersDark =
                typeof window !== "undefined" &&
                window.matchMedia("(prefers-color-scheme: dark)").matches;
              setTheme(prefersDark ? "dark" : "light");
              toast.success(`Matched system: ${prefersDark ? "dark" : "light"}`);
            }}
            icon={Monitor}
            label="System"
          />
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications">
        <ToggleRow
          label="Email updates"
          desc="Listing status, offer replies, booking confirmations"
          checked={emailUpdates}
          onChange={setEmailUpdates}
        />
        <Separator className="my-1" />
        <ToggleRow
          label="Price drop alerts"
          desc="Notify me when a wishlisted car drops in price"
          checked={priceDrops}
          onChange={setPriceDrops}
        />
        <Separator className="my-1" />
        <ToggleRow
          label="SMS alerts"
          desc="Critical booking updates via SMS"
          checked={smsAlerts}
          onChange={setSmsAlerts}
        />
        <Separator className="my-1" />
        <ToggleRow
          label="Marketing"
          desc="New arrivals, offers, and promotions"
          checked={marketing}
          onChange={setMarketing}
        />
      </Section>

      {/* Account */}
      <Section icon={AlertTriangle} title="Account">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/40 p-3 text-sm">
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-muted-foreground">{user.email}</div>
              </div>
              <Badge variant="outline" className="capitalize">
                {user.role}
              </Badge>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                toast.success("Signed out");
              }}
            >
              <LogOut className="mr-1 h-4 w-4" /> Sign out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">Not signed in.</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        )}
      </Section>

      {/* Danger zone */}
      <Section icon={Trash2} title="Data" danger>
        <p className="text-sm text-muted-foreground">
          This is a demo app — all data is stored locally in your browser. Resetting clears your
          account, listings, offers, wishlist, and settings, then reloads the sample inventory.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mt-3">
              <Trash2 className="mr-1 h-4 w-4" /> Reset demo data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset all demo data?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone. Your account, saved cars, listings, and offers will be erased
                and replaced with the original sample data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  resetData();
                  toast.success("Demo data reset");
                }}
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Section>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={`mt-6 rounded-2xl border bg-card p-6 shadow-sm ${danger ? "border-destructive/30" : "border-border/60"}`}
    >
      <div className="mb-4 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${danger ? "text-destructive" : "text-primary"}`} />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ThemeOption({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${active ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"}`}
    >
      <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="pr-4">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
