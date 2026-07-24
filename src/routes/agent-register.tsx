import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/store";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { registerSchema, type RegisterValues } from "@/lib/validations";
import { AuthShell } from "./login";
import { Seo } from "@/components/site/Seo";

export const Route = createFileRoute("/agent-register")({
  component: AgentRegister,
});

function AgentRegister() {
  const { register } = useApp();
  const nav = useNavigate();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function submit(values: RegisterValues) {
    try {
      await register(values.name, values.email, values.password, "agent");
      toast.success("Agent account created!");
      nav({ to: "/agent" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <AuthShell>
      <Seo
        title="Agent registration — DriveHub"
        description="Create an agent account for DriveHub operations."
        canonical="/agent-register"
      />
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
        <Briefcase className="h-6 w-6 text-primary" />
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Create agent account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Register as a DriveHub agent to manage listings, tickets, and offers.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="mt-6 grid gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="At least 6 characters" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            <Briefcase className="mr-2 h-4 w-4" />
            {form.formState.isSubmitting ? "Creating account..." : "Create agent account"}
          </Button>
        </form>
      </Form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already an agent?{" "}
        <Link to="/agent-login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
