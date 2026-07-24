import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { contactSchema, type ContactValues } from "@/lib/validations";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

const OFFICES = [
  { city: "Mumbai", addr: "Plot 12, Andheri East, Mumbai 400069", phone: "+91 22 4000 1234" },
  { city: "Bengaluru", addr: "Tower B, Whitefield, Bengaluru 560066", phone: "+91 80 4000 5678" },
  { city: "Delhi NCR", addr: "Cyber Hub, Gurugram 122002", phone: "+91 124 4000 9012" },
];

function ContactPage() {
  const { user } = useApp();
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      subject: "",
      message: "",
    },
  });

  function submit(_values: ContactValues) {
    toast.success("Message sent! We'll reply within 24 hours.");
    form.reset({
      name: form.getValues("name"),
      email: form.getValues("email"),
      subject: "",
      message: "",
    });
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Seo
        title="Contact DriveHub"
        description="Questions about a car, financing, or selling? Reach out to our team any time."
        canonical="/contact"
      />
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight">Get in touch</h1>
        <p className="mt-3 text-muted-foreground">
          Questions about a car, financing, or selling? We’re here to help — reach out any time.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
        {[
          { i: Phone, t: "Call", d: "+91 800 DRIVE-HUB", a: "9am–9pm, every day" },
          { i: Mail, t: "Email", d: "hello@drivehub.io", a: "Replies within 24h" },
          { i: MessageCircle, t: "Live chat", d: "In-app chat", a: "Mon–Fri, 9–6" },
        ].map((c) => (
          <div
            key={c.t}
            className="rounded-2xl border border-border/60 bg-card p-5 text-center shadow-sm"
          >
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <c.i className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-display text-base font-semibold">{c.t}</h3>
            <p className="text-sm">{c.d}</p>
            <p className="text-xs text-muted-foreground">{c.a}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold">Send a message</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)} className="mt-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
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
              </div>
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="How can we help?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="Tell us more..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg">
                <Send className="mr-1 h-4 w-4" /> Send message
              </Button>
            </form>
          </Form>
        </div>

        {/* Offices + map placeholder */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="grid aspect-video place-items-center bg-muted text-muted-foreground">
              <div className="text-center">
                <MapPin className="mx-auto h-8 w-8" />
                <p className="mt-1 text-xs">Map preview</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <h3 className="font-display text-base font-semibold">Our offices</h3>
            <ul className="mt-3 space-y-3 text-sm">
              {OFFICES.map((o) => (
                <li key={o.city} className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 flex-none text-primary" />
                  <div>
                    <div className="font-medium">{o.city}</div>
                    <div className="text-muted-foreground">{o.addr}</div>
                    <div className="text-muted-foreground">{o.phone}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Showrooms open 10am–8pm, all days
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-5xl text-center">
        <p className="text-sm text-muted-foreground">
          Need dedicated support?{" "}
          <Link to="/support" className="text-primary hover:underline">
            Open a support ticket
          </Link>
        </p>
      </div>
    </div>
  );
}
