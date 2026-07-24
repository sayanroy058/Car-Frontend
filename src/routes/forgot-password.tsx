import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "./login";

export const Route = createFileRoute("/forgot-password")({
  component: Forgot,
});
function Forgot() {
  const [sent, setSent] = useState(false);
  return (
    <AuthShell>
      <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
      <p className="mt-1 text-sm text-muted-foreground">We'll email you a reset link.</p>
      {sent ? (
        <div className="mt-6 rounded-xl border border-success/30 bg-success/5 p-4 text-sm">
          Check your inbox for a reset link.
        </div>
      ) : (
        <form
          className="mt-6 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
            toast.success("Reset link sent (demo)");
          }}
        >
          <div>
            <Label>Email</Label>
            <Input type="email" required />
          </div>
          <Button type="submit" size="lg">
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </AuthShell>
  );
}
