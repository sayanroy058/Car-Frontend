import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/site/States";
import { Seo } from "@/components/site/Seo";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/saved-searches")({
  component: SavedSearchesPage,
});

function SavedSearchesPage() {
  const { user, savedSearches, removeSavedSearch } = useApp();
  const nav = useNavigate();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Sign in to view saved searches</h1>
        <Button asChild className="mt-4">
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  function apply(filters: Record<string, unknown>) {
    const search: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(filters)) {
      if (Array.isArray(v) && v.length) search[k] = v;
      else if (typeof v === "string" && v) search[k] = v;
      else if (typeof v === "number") search[k] = v;
    }
    nav({ to: "/buy", search });
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <Seo
        title="Saved searches — DriveHub"
        description="Manage your saved search alerts."
        canonical="/saved-searches"
      />
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Saved searches</h1>
        <p className="text-sm text-muted-foreground">
          Re-run a saved search or remove alerts you no longer need.
        </p>
      </div>

      {savedSearches.length === 0 ? (
        <EmptyState
          title="No saved searches"
          description="Save a search from the Buy page to get alerts when matching cars are listed."
          icon={<Bookmark className="h-6 w-6" />}
          action={
            <Button asChild>
              <Link to="/buy">Browse cars</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {savedSearches.map((s) => {
            const filterEntries = Object.entries(s.filters);
            return (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{s.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {filterEntries.length === 0 ? (
                      <span className="text-xs text-muted-foreground">All cars</span>
                    ) : (
                      filterEntries.map(([k, v]) => (
                        <Badge key={k} variant="outline" className="text-[10px]">
                          {Array.isArray(v) ? `${k}: ${v.join(", ")}` : `${k}: ${v}`}
                        </Badge>
                      ))
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Saved {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => apply(s.filters)}>
                    Apply
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      removeSavedSearch(s.id);
                      toast.success("Saved search removed");
                    }}
                    aria-label="Remove saved search"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
