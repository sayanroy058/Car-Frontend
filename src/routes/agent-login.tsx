import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Briefcase, Car } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/store";
import { Seo } from "@/components/site/Seo";

export const Route = createFileRoute("/agent-login")({
  component: AgentLogin,
});

function AgentLogin() {
  const { login } = useApp();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return toast.error("Enter email and password");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== "agent") {
        toast.error("Access denied — agent credentials required");
        return;
      }
      toast.success("Welcome back");
      nav({ to: "/agent" });
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <Seo
        title="Agent login — DriveHub"
        description="Secure agent access portal for DriveHub operations."
        canonical="/agent-login"
      />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="absolute inset-0 -z-10 grid-bg opacity-30" />
      <div className="container mx-auto grid gap-12 px-4 py-16 lg:grid-cols-2 lg:items-center">
        <div className="hidden text-white lg:block">
          <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1 text-xs">
            <Briefcase className="h-3.5 w-3.5" />
            Agent Portal
          </div>
          <h2 className="mt-6 text-4xl font-bold tracking-tight leading-tight">
            Manage listings <span className="gradient-text">on the go</span>.
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            Secure access for DriveHub agents. Handle tickets, offers, and
            bookings from one console.
          </p>
        </div>
        <div className="mx-auto w-full max-w-md rounded-2xl border border-border/60 bg-card shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              Agent Login
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your agent credentials to continue.
            </p>
          </div>
          <form onSubmit={submit} className="mt-6 grid gap-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter agent password"
              />
            </div>
            <Button type="submit" size="lg" disabled={loading} className="w-full">
              <Briefcase className="mr-2 h-4 w-4" />
              {loading ? "Signing in..." : "Sign in as Agent"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New agent?{" "}
            <Link to="/agent-register" className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Not an agent?{" "}
            <Link to="/login" className="text-primary hover:underline">
              User login
            </Link>
            {" · "}
            <Link to="/" className="text-primary hover:underline">
              <Car className="mr-1 inline h-3 w-3" />
              Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
