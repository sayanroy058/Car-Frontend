import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LifeBuoy, Mail, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useApp } from "@/lib/store";
import { Seo } from "@/components/site/Seo";
import { supportSchema, type SupportValues } from "@/lib/validations";

export const Route = createFileRoute("/support")({
  component: Support,
});

const CATEGORIES = ["General Inquiry", "Financing", "Inspection", "Purchase", "Complaint", "Other"];

function Support() {
  const { addTicket, user } = useApp();
  const form = useForm<SupportValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      subject: "",
      category: CATEGORIES[0],
      message: "",
    },
  });

  function submit(values: SupportValues) {
    addTicket({ ...values, userId: user?.id });
    toast.success("Ticket submitted! Our team will respond within 24 hours.");
    form.reset({ ...values, subject: "", message: "" });
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Seo
        title="Support — DriveHub"
        description="Get help with financing, inspections, purchases, and more. Our team responds within 24 hours."
        canonical="/support"
      />
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight">How can we help?</h1>
        <p className="mt-3 text-muted-foreground">
          From financing to inspections, our team responds within 24 hours.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
        {[
          { i: Phone, t: "Call us", d: "+1 (800) DRIVE-HUB", a: "9am–9pm, every day" },
          { i: Mail, t: "Email", d: "hello@drivehub.io", a: "Replies within 24h" },
          { i: MessageCircle, t: "Live chat", d: "Available in-app", a: "Mon–Fri, 9–6" },
        ].map((c) => (
          <div
            key={c.t}
            className="rounded-2xl border border-border/60 bg-card p-5 text-center shadow-sm"
          >
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <c.i className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-display text-base font-semibold">{c.t}</h3>
            <p className="mt-1 text-sm">{c.d}</p>
            <p className="text-xs text-muted-foreground">{c.a}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border/60 bg-card p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-center gap-2">
          <LifeBuoy className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-semibold">Open a support ticket</h2>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your name</FormLabel>
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief subject" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="Describe your issue..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                Submit ticket
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
