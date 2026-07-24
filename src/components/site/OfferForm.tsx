import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HandCoins, Send } from "lucide-react";
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
import { formatPrice } from "@/components/site/CarCard";
import { makeOfferSchema, type OfferValues } from "@/lib/validations";
import type { Listing } from "@/lib/types";

export function OfferForm({ listing }: { listing: Listing }) {
  const { user, addOffer } = useApp();
  const price = listing.pricing?.finalPrice ?? listing.expectedPrice;
  const form = useForm<OfferValues>({
    resolver: zodResolver(makeOfferSchema(price)),
    defaultValues: { amount: Math.round(price * 0.97), message: "" },
  });

  function submit(values: OfferValues) {
    if (!user) {
      toast.error("Sign in to make an offer");
      return;
    }
    addOffer({
      listingId: listing.id,
      buyerId: user.id,
      buyerName: user.name,
      amount: values.amount,
      message: values.message || "Interested buyer.",
    });
    toast.success("Offer submitted! The seller will respond shortly.");
    form.reset({ amount: Math.round(price * 0.97), message: "" });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <HandCoins className="h-4 w-4 text-primary" />
          Make an offer
        </div>
        <p className="text-xs text-muted-foreground">
          Listed at <b className="text-foreground">{formatPrice(price)}</b>. Make a fair offer and
          the seller will respond.
        </p>
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-1.5 inline-block">Your offer (₹)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value}
                  min={Math.round(price * 0.5)}
                  max={Math.round(price * 1.1)}
                  step={10000}
                  onChange={(e) => field.onChange(+e.target.value)}
                />
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
              <FormLabel className="mb-1.5 inline-block">Message (optional)</FormLabel>
              <FormControl>
                <Textarea
                  rows={2}
                  placeholder="I'm a serious buyer, can close this week..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={!user}>
          <Send className="mr-1 h-4 w-4" />
          {user ? "Submit offer" : "Sign in to offer"}
        </Button>
        {!user && (
          <p className="text-center text-xs text-muted-foreground">
            Offers are saved to your dashboard once signed in.
          </p>
        )}
      </form>
    </Form>
  );
}
