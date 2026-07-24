import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/store";
import type { Listing, Review } from "@/lib/types";

function StarRating({
  value,
  onChange,
  size = "h-4 w-4",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: string;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            className={`${size} ${
              (hover || value) >= n ? "fill-warning text-warning" : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function Reviews({ listing }: { listing: Listing }) {
  const { reviews, user, bookings, addReview } = useApp();
  const listingReviews = useMemo(
    () => reviews.filter((r) => r.listingId === listing.id),
    [reviews, listing.id],
  );

  const avg = listingReviews.length
    ? listingReviews.reduce((s, r) => s + r.rating, 0) / listingReviews.length
    : 0;

  const eligible = useMemo(
    () =>
      bookings.some(
        (b) =>
          b.listingId === listing.id &&
          b.userId === user?.id &&
          b.type !== "test_drive" &&
          b.status === "completed",
      ),
    [bookings, listing.id, user?.id],
  );

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Sign in to leave a review");
      return;
    }
    if (!title.trim() || !body.trim()) {
      toast.error("Please add a title and review");
      return;
    }
    addReview({
      listingId: listing.id,
      userId: user.id,
      name: user.name,
      rating,
      title: title.trim(),
      body: body.trim(),
    });
    toast.success("Review submitted!");
    setOpen(false);
    setTitle("");
    setBody("");
    setRating(5);
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-warning/10">
            <Star className="h-6 w-6 fill-warning text-warning" />
          </div>
          <div>
            <div className="font-display text-2xl font-bold">
              {avg ? avg.toFixed(1) : "—"}
              <span className="text-sm font-normal text-muted-foreground"> / 5</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {listingReviews.length} {listingReviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
        {user && !open && (
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            Write a review
          </Button>
        )}
      </div>

      {open && (
        <form
          onSubmit={submit}
          className="mt-4 space-y-3 rounded-xl border border-border/60 bg-secondary/30 p-4"
        >
          <div>
            <Label className="mb-1.5 inline-block">Your rating</Label>
            <StarRating value={rating} onChange={setRating} size="h-6 w-6" />
          </div>
          <div>
            <Label className="mb-1.5 inline-block">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
            />
          </div>
          <div>
            <Label className="mb-1.5 inline-block">Review</Label>
            <Textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share details about the car and your buying experience..."
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              Submit review
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {eligible === false && user && !open && (
        <p className="mt-2 text-xs text-muted-foreground">
          Reviews can be left after completing a purchase.
        </p>
      )}

      <div className="mt-5 space-y-4">
        {listingReviews.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No reviews yet. Be the first to review this car.
          </p>
        ) : (
          listingReviews.map((r: Review) => (
            <div key={r.id} className="border-b border-border/60 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {r.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium">{r.name}</span>
                </div>
                <StarRating value={r.rating} />
              </div>
              <div className="mt-1.5 text-sm font-semibold">{r.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function RatingBadge({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return (
    <Badge variant="outline" className="gap-1 border-warning/30 bg-warning/10 text-warning">
      <Star className="h-3 w-3 fill-warning" />
      {avg.toFixed(1)}
    </Badge>
  );
}
