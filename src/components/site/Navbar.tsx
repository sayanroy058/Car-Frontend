import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Briefcase,
  Car,
  Heart,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Scale,
  Settings,
  ShieldCheck,
  Sun,
  User2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/store";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/buy", label: "Buy Cars" },
  { to: "/sell", label: "Sell Your Car" },
  { to: "/about", label: "About" },
  { to: "/support", label: "Support" },
] as const;

export function Navbar() {
  const { user, logout, theme, setTheme, wishlist, conversations } =
    useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const unreadChat = user
    ? conversations
        .filter((c) => user.role === "admin" || c.buyerId === user.id)
        .reduce((sum, c) => {
          const lastRead = c.lastReadAt?.[user.id] ?? 0;
          return sum + c.messages.filter((m) => m.senderId !== user.id && m.createdAt > lastRead).length;
        }, 0)
    : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Car className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold tracking-tight">
                Drive<span className="text-primary">Hub</span>
              </span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map((n) => {
                const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    aria-current={active ? "page" : undefined}
                    className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      active
                        ? "text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {active && (
                      <span className="absolute inset-x-1 -bottom-1 h-0.5 rounded-full bg-primary" />
                    )}
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="h-9 w-9"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Compare"
              className="hidden h-9 w-9 sm:inline-flex"
            >
              <Link to="/compare">
                <Scale className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Wishlist"
              className="relative h-9 w-9"
            >
              <Link to="/wishlist">
                <Heart className="h-4 w-4" />
                {wishlist.length > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full border-2 border-background bg-primary px-1 text-[10px] text-primary-foreground">
                    {wishlist.length}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="hidden h-9 w-9 sm:inline-flex"
            >
              <Link to="/notifications">
                <Bell className="h-4 w-4" />
              </Link>
            </Button>
            {user && (
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Messages"
                className="relative h-9 w-9"
              >
                <Link to="/chat">
                  <MessageCircle className="h-4 w-4" />
                  {unreadChat > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full border-2 border-background bg-primary px-1 text-[10px] text-primary-foreground">
                      {unreadChat}
                    </Badge>
                  )}
                </Link>
              </Button>
            )}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 gap-2 px-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {user.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="hidden text-sm font-medium sm:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User2 className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  ) : user.role === "agent" ? (
                    <DropdownMenuItem asChild>
                      <Link to="/agent">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Agent console
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">
                        <User2 className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/notifications">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">Register</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="hidden lg:inline-flex">
                  <Link to="/agent-login">
                    <Briefcase className="mr-1.5 h-3.5 w-3.5" />
                    Agent
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="hidden lg:inline-flex">
                  <Link to="/admin-login">
                    <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                    Admin
                  </Link>
                </Button>
              </div>
            )}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 overflow-y-auto p-6">
                <div className="mt-6">
                  <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                      <Car className="h-5 w-5" />
                    </span>
                    <span className="text-lg font-bold tracking-tight">
                      Drive<span className="text-primary">Hub</span>
                    </span>
                  </Link>
                  <div className="mt-6 flex flex-col gap-1">
                    {NAV.map((n) => (
                      <Link
                        key={n.to}
                        to={n.to}
                        onClick={() => setOpen(false)}
                        className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to)) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"}`}
                      >
                        {n.label}
                      </Link>
                    ))}
                    <div className="my-2 h-px bg-border" />
                    <Link
                      to="/wishlist"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Heart className="h-4 w-4" /> Wishlist
                      </span>
                      {wishlist.length > 0 && (
                        <Badge className="h-5 min-w-5 rounded-full border-0 bg-primary px-1.5 text-[10px] text-primary-foreground">
                          {wishlist.length}
                        </Badge>
                      )}
                    </Link>
                    <Link
                      to="/compare"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                    >
                      <Scale className="mr-2 inline h-4 w-4" /> Compare
                    </Link>
                    <Link
                      to="/finance"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                    >
                      Finance & EMI
                    </Link>
                    <Link
                      to="/contact"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                    >
                      Contact
                    </Link>
                    <button
                      onClick={() => {
                        setTheme(theme === "dark" ? "light" : "dark");
                      }}
                      className="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                    >
                      <span className="inline-flex items-center gap-2">
                        {theme === "dark" ? (
                          <Sun className="h-4 w-4" />
                        ) : (
                          <Moon className="h-4 w-4" />
                        )}
                        {theme === "dark" ? "Light mode" : "Dark mode"}
                      </span>
                    </button>
                    {user ? (
                      <>
                        <div className="my-2 h-px bg-border" />
                        <div className="px-4 py-1 text-xs text-muted-foreground">
                          Signed in as {user.email}
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setOpen(false)}
                          className="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                        >
                          <User2 className="mr-2 inline h-4 w-4" /> Profile
                        </Link>
                        <Link
                          to="/notifications"
                          onClick={() => setOpen(false)}
                          className="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                        >
                          <Bell className="mr-2 inline h-4 w-4" /> Notifications
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setOpen(false)}
                          className="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                        >
                          <Settings className="mr-2 inline h-4 w-4" /> Settings
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setOpen(false);
                          }}
                          className="rounded-lg px-4 py-2.5 text-left text-sm font-medium hover:bg-secondary"
                        >
                          <LogOut className="mr-2 inline h-4 w-4" /> Sign out
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="my-2 h-px bg-border" />
                        <Link
                          to="/login"
                          onClick={() => setOpen(false)}
                          className="rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setOpen(false)}
                          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                        >
                          Register
                        </Link>
                        <Link
                          to="/agent-login"
                          onClick={() => setOpen(false)}
                          className="rounded-lg px-4 py-2.5 text-left text-sm font-medium hover:bg-secondary"
                        >
                          <Briefcase className="mr-2 inline h-4 w-4" /> Agent Login
                        </Link>
                        <Link
                          to="/admin-login"
                          onClick={() => setOpen(false)}
                          className="rounded-lg px-4 py-2.5 text-left text-sm font-medium hover:bg-secondary"
                        >
                          <ShieldCheck className="mr-2 inline h-4 w-4" /> Admin Login
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer
      className="relative mt-24 overflow-hidden text-white"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full blur-3xl"
        style={{ background: "var(--gradient-glow)" }}
      />
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="container relative mx-auto px-4">
        {/* CTA band */}
        <div className="flex flex-col gap-6 border-b border-white/10 py-14 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white ring-1 ring-white/15 backdrop-blur">
                <Car className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold tracking-tight">
                Drive<span className="text-accent">Hub</span>
              </span>
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl">
              The calmest place to buy or sell your next car.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/70">
              Verified inspections, elegant financing, and a buying journey designed with the same
              care as the vehicles themselves.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/buy">
                Explore inventory <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="border border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/sell">Get a valuation</Link>
            </Button>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="text-sm font-semibold text-white">DriveHub</h4>
            <p className="mt-3 max-w-xs text-sm leading-6 text-white/60">
              Premium pre-owned cars, inspected and refurbished — delivered with total transparency.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Buy &amp; Sell</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li>
                <Link to="/buy" className="transition-colors hover:text-white">
                  Browse inventory
                </Link>
              </li>
              <li>
                <Link to="/sell" className="transition-colors hover:text-white">
                  Sell your car
                </Link>
              </li>
              <li>
                <Link to="/finance" className="transition-colors hover:text-white">
                  Finance &amp; EMI
                </Link>
              </li>
              <li>
                <Link to="/compare" className="transition-colors hover:text-white">
                  Compare cars
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li>
                <Link to="/about" className="transition-colors hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link to="/support" className="transition-colors hover:text-white">
                  Support
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Legal</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li>
                <Link to="/privacy" className="transition-colors hover:text-white">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="transition-colors hover:text-white">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <span>&copy; {new Date().getFullYear()} DriveHub. All rights reserved.</span>
          <span className="text-xs">Mock marketplace for demonstration purposes</span>
        </div>
      </div>
    </footer>
  );
}
