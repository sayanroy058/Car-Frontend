import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { CarCard } from "@/components/site/CarCard";
import { EmptyState } from "@/components/site/States";
import { ListingGridSkeleton } from "@/components/site/Skeletons";
import { Seo } from "@/components/site/Seo";
import { getListings } from "@/lib/api";
import { qk } from "@/lib/queries";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
  pendingComponent: () => (
    <div className="container mx-auto px-4 py-10">
      <ListingGridSkeleton count={3} />
    </div>
  ),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: qk.listings,
      queryFn: () => getListings(),
    });
  },
});

function WishlistPage() {
  const { listings, wishlist } = useApp();
  const wished = listings.filter((l) => wishlist.includes(l.id));

  return (
    <div className="container mx-auto px-4 py-10">
      <Seo title="Wishlist — DriveHub" description="Your saved cars." canonical="/wishlist" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Your wishlist</h1>
        <p className="text-sm text-muted-foreground">
          {wished.length} saved {wished.length === 1 ? "car" : "cars"}. Tap the heart again to
          remove.
        </p>
      </div>

      {wished.length === 0 ? (
        <EmptyState
          title="No saved cars"
          description="Tap the heart on any car to save it here for later."
          icon={<Heart className="h-6 w-6" />}
          action={
            <Button asChild>
              <Link to="/buy">Browse inventory</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {wished.map((l) => (
            <CarCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
