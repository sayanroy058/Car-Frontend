export const qk = {
  listings: ["listings"] as const,
  listing: (id: string) => ["listings", id] as const,
  similar: (id: string) => ["listings", id, "similar"] as const,
  reviews: (id: string) => ["reviews", id] as const,
  offers: (listingId?: string) => ["offers", listingId ?? "all"] as const,
  bookings: (userId?: string) => ["bookings", userId ?? "all"] as const,
  tickets: (userId?: string) => ["tickets", userId ?? "all"] as const,
  search: (filters: Record<string, unknown>) => ["search", filters] as const,
};
