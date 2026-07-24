import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";
import { Filter, Scale, Search, SlidersHorizontal, X } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { CarCard, formatPrice } from "@/components/site/CarCard";
import { EmptyState } from "@/components/site/States";
import { ListingGridSkeleton } from "@/components/site/Skeletons";
import { Seo } from "@/components/site/Seo";
import { BODY_TYPES, BRANDS, FUEL_TYPES, OWNERSHIP, STATES, TRANSMISSIONS } from "@/lib/constants";
import { useApp } from "@/lib/store";
import { getListings } from "@/lib/api";
import { qk } from "@/lib/queries";

const PAGE_SIZE = 9;

const arr = z.preprocess((v) => {
  if (v == null || v === "") return [];
  if (Array.isArray(v)) return v;
  return [String(v)];
}, z.array(z.string()));

const buySearchSchema = {
  brand: arr.optional(),
  body: arr.optional(),
  budget: z.string().optional(),
  fuel: arr.optional(),
  trans: arr.optional(),
  own: arr.optional(),
  state: arr.optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  yearMin: z.coerce.number().optional(),
  yearMax: z.coerce.number().optional(),
  kmMin: z.coerce.number().optional(),
  kmMax: z.coerce.number().optional(),
  q: z.string().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().optional(),
};

export const Route = createFileRoute("/buy/")({
  component: BuyPage,
  pendingComponent: () => (
    <div className="container mx-auto px-4 py-10">
      <ListingGridSkeleton />
    </div>
  ),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: qk.listings,
      queryFn: () => getListings(),
    });
  },
  validateSearch: (search) => z.object(buySearchSchema).parse(search),
});

type Sort = "newest" | "price_low" | "price_high" | "km_low";

function BuyPage() {
  const { listings, compare, recentlyViewed, clearCompare, addSavedSearch } = useApp();
  const search = useSearch({ from: "/buy/" });
  const nav = useNavigate({ from: "/buy/" });

  const brand = search.brand ?? [];
  const body = search.body ?? [];
  const fuel = search.fuel ?? [];
  const trans = search.trans ?? [];
  const own = search.own ?? [];
  const state = search.state ?? [];
  const budget = search.budget ?? "";
  const q = search.q ?? "";
  const sort = (search.sort as Sort) ?? "newest";
  const page = search.page ?? 1;

  const price: [number, number] = useMemo(() => {
    if (search.priceMin != null || search.priceMax != null)
      return [search.priceMin ?? 0, search.priceMax ?? 10000000];
    if (budget === "0-1000000") return [0, 1000000];
    if (budget === "1000000-2500000") return [1000000, 2500000];
    if (budget === "2500000-5000000") return [2500000, 5000000];
    if (budget === "5000000+") return [5000000, 100000000];
    return [0, 10000000];
  }, [search.priceMin, search.priceMax, budget]);
  const year: [number, number] = [search.yearMin ?? 2015, search.yearMax ?? 2024];
  const km: [number, number] = [search.kmMin ?? 0, search.kmMax ?? 150000];

  function patch(partial: Record<string, unknown>) {
    const next: Record<string, unknown> = { ...search, ...partial };
    Object.keys(next).forEach((k) => {
      const v = next[k];
      if (Array.isArray(v) && v.length === 0) delete next[k];
      if (v === "" || v == null) delete next[k];
    });
    nav({ search: next, resetScroll: false });
  }

  const toggleArr = (key: string, val: string, arr2: string[]) => {
    const set = new Set(arr2);
    if (set.has(val)) set.delete(val);
    else set.add(val);
    patch({ [key]: [...set], page: undefined });
  };

  const inventory = listings.filter((l) => l.status === "listed" || l.status === "approved");

  const filtered = useMemo(() => {
    let r = inventory.filter((l) => {
      const p = l.pricing?.finalPrice ?? l.expectedPrice;
      if (q && !`${l.brand} ${l.model} ${l.variant}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      if (brand.length && !brand.includes(l.brand)) return false;
      if (body.length && !body.includes(l.bodyType)) return false;
      if (fuel.length && !fuel.includes(l.fuelType)) return false;
      if (trans.length && !trans.includes(l.transmission)) return false;
      if (own.length && !own.includes(l.ownership)) return false;
      if (state.length && !state.includes(l.registrationState)) return false;
      if (p < price[0] || p > price[1]) return false;
      if (l.year < year[0] || l.year > year[1]) return false;
      if (l.kmDriven < km[0] || l.kmDriven > km[1]) return false;
      return true;
    });
    r = [...r].sort((a, b) => {
      const pa = a.pricing?.finalPrice ?? a.expectedPrice;
      const pb = b.pricing?.finalPrice ?? b.expectedPrice;
      if (sort === "price_low") return pa - pb;
      if (sort === "price_high") return pb - pa;
      if (sort === "km_low") return a.kmDriven - b.kmDriven;
      return b.createdAt - a.createdAt;
    });
    return r;
  }, [inventory, q, brand, body, fuel, trans, own, state, price, year, km, sort]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(Math.max(page, 1), Math.max(pageCount, 1));
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const recentList = listings.filter((l) => recentlyViewed.includes(l.id)).slice(0, 4);

  const activeCount =
    brand.length +
    body.length +
    fuel.length +
    trans.length +
    own.length +
    state.length +
    (q ? 1 : 0) +
    (budget ? 1 : 0) +
    (price[0] !== 0 || price[1] !== 10000000 ? 1 : 0) +
    (year[0] !== 2015 || year[1] !== 2024 ? 1 : 0) +
    (km[0] !== 0 || km[1] !== 150000 ? 1 : 0);

  const filters = (
    <div className="space-y-6">
      <FilterGroup
        title="Brand"
        options={BRANDS}
        values={brand}
        onChange={(v) => patch({ brand: v, page: undefined })}
      />
      <FilterGroup
        title="Body type"
        options={BODY_TYPES}
        values={body}
        onChange={(v) => patch({ body: v, page: undefined })}
      />
      <FilterGroup
        title="Fuel"
        options={FUEL_TYPES}
        values={fuel}
        onChange={(v) => patch({ fuel: v, page: undefined })}
      />
      <FilterGroup
        title="Transmission"
        options={TRANSMISSIONS}
        values={trans}
        onChange={(v) => patch({ trans: v, page: undefined })}
      />
      <FilterGroup
        title="Ownership"
        options={OWNERSHIP}
        values={own}
        onChange={(v) => patch({ own: v, page: undefined })}
      />
      <FilterGroup
        title="Location"
        options={STATES}
        values={state}
        onChange={(v) => patch({ state: v, page: undefined })}
      />

      <div>
        <div className="mb-2 flex justify-between text-sm font-medium">
          <span>Price</span>
          <span className="text-muted-foreground">
            {formatPrice(price[0])} – {formatPrice(price[1])}
          </span>
        </div>
        <Slider
          min={0}
          max={10000000}
          step={50000}
          value={price}
          onValueChange={(v) =>
            patch({ priceMin: v[0], priceMax: v[1], budget: undefined, page: undefined })
          }
        />
      </div>
      <div>
        <div className="mb-2 flex justify-between text-sm font-medium">
          <span>Year</span>
          <span className="text-muted-foreground">
            {year[0]} – {year[1]}
          </span>
        </div>
        <Slider
          min={2015}
          max={2024}
          step={1}
          value={year}
          onValueChange={(v) => patch({ yearMin: v[0], yearMax: v[1], page: undefined })}
        />
      </div>
      <div>
        <div className="mb-2 flex justify-between text-sm font-medium">
          <span>Kilometers</span>
          <span className="text-muted-foreground">
            {km[0].toLocaleString()} – {km[1].toLocaleString()}
          </span>
        </div>
        <Slider
          min={0}
          max={150000}
          step={5000}
          value={km}
          onValueChange={(v) => patch({ kmMin: v[0], kmMax: v[1], page: undefined })}
        />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10">
      <Seo
        title="Buy a car — DriveHub"
        description="Browse inspected, refurbished pre-owned cars. Filter by brand, body, fuel, price, year and kilometers."
        canonical="/buy"
      />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buy a car</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} inspected, refurbished cars ready to drive
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search Tesla, BMW, M340i..."
              className="pl-9"
              value={q}
              onChange={(e) => patch({ q: e.target.value || undefined, page: undefined })}
            />
          </div>
          <Select value={sort} onValueChange={(v) => patch({ sort: v, page: undefined })}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="km_low">Lowest km</SelectItem>
            </SelectContent>
          </Select>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto p-6">
              <SheetTitle>Filters</SheetTitle>
              <div className="mt-6">{filters}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {activeCount > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {activeCount} active {activeCount === 1 ? "filter" : "filters"}:
          </span>
          {brand.map((b) => (
            <Chip key={`b-${b}`} label={b} onClear={() => toggleArr("brand", b, brand)} />
          ))}
          {body.map((b) => (
            <Chip key={`bd-${b}`} label={b} onClear={() => toggleArr("body", b, body)} />
          ))}
          {fuel.map((b) => (
            <Chip key={`f-${b}`} label={b} onClear={() => toggleArr("fuel", b, fuel)} />
          ))}
          {trans.map((b) => (
            <Chip key={`t-${b}`} label={b} onClear={() => toggleArr("trans", b, trans)} />
          ))}
          {own.map((b) => (
            <Chip key={`o-${b}`} label={b} onClear={() => toggleArr("own", b, own)} />
          ))}
          {state.map((b) => (
            <Chip key={`s-${b}`} label={b} onClear={() => toggleArr("state", b, state)} />
          ))}
          {q && <Chip label={`"${q}"`} onClear={() => patch({ q: undefined })} />}
          {budget && <Chip label={budget} onClear={() => patch({ budget: undefined })} />}
          {(price[0] !== 0 || price[1] !== 10000000) && (
            <Chip
              label={`${formatPrice(price[0])}–${formatPrice(price[1])}`}
              onClear={() => patch({ priceMin: undefined, priceMax: undefined, budget: undefined })}
            />
          )}
          {(year[0] !== 2015 || year[1] !== 2024) && (
            <Chip
              label={`${year[0]}–${year[1]}`}
              onClear={() => patch({ yearMin: undefined, yearMax: undefined })}
            />
          )}
          {(km[0] !== 0 || km[1] !== 150000) && (
            <Chip
              label={`${km[0].toLocaleString()}–${km[1].toLocaleString()} km`}
              onClear={() => patch({ kmMin: undefined, kmMax: undefined })}
            />
          )}
          <Button size="sm" variant="ghost" onClick={() => nav({ search: {}, resetScroll: false })}>
            <X className="mr-1 h-3 w-3" /> Clear all
          </Button>
        </div>
      )}

      <div className="mb-4 flex items-center justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const filters = { ...search };
            delete filters.page;
            addSavedSearch({ name: `${brand[0] ?? "All"} cars`, filters });
            toast.success("Search saved! Manage it from your notifications.");
          }}
        >
          Save this search
        </Button>
      </div>

      {compare.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Scale className="h-4 w-4 text-primary" />
            Comparing {compare.length} {compare.length === 1 ? "car" : "cars"} (max 3)
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" disabled={compare.length < 2}>
              <Link to="/compare">Open compare</Link>
            </Button>
            <Button size="sm" variant="ghost" onClick={clearCompare}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Filter className="h-4 w-4" />
                Filters
              </h3>
            </div>
            {filters}
          </div>
        </aside>

        <div>
          {paged.length === 0 ? (
            <EmptyState
              title="No cars match your filters"
              description="Try widening the price or year range."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {paged.map((l) => (
                <CarCard key={l.id} listing={l} />
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-xs text-muted-foreground">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={safePage <= 1}
                  onClick={() => patch({ page: safePage - 1 })}
                >
                  Prev
                </Button>
                {Array.from({ length: pageCount }).map((_, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={i + 1 === safePage ? "default" : "outline"}
                    onClick={() => patch({ page: i + 1 })}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={safePage >= pageCount}
                  onClick={() => patch({ page: safePage + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {recentList.length > 0 && (
            <div className="mt-14">
              <h2 className="mb-5 font-display text-xl font-semibold">Recently viewed</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {recentList.map((l) => (
                  <CarCard key={l.id} listing={l} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-secondary/60 px-2.5 py-1 text-xs font-medium">
      {label}
      <button
        onClick={onClear}
        aria-label={`Remove ${label}`}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function FilterGroup({
  title,
  options,
  values,
  onChange,
}: {
  title: string;
  options: string[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (o: string) =>
    onChange(values.includes(o) ? values.filter((x) => x !== o) : [...values, o]);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold">{title}</h4>
        {values.length > 0 && (
          <button
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onChange([])}
          >
            <X className="inline h-3 w-3" /> clear
          </button>
        )}
      </div>
      <div className="max-h-44 space-y-1.5 overflow-y-auto pr-1">
        {options.map((o) => (
          <label
            key={o}
            className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Checkbox checked={values.includes(o)} onCheckedChange={() => toggle(o)} />
            <span>{o}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
