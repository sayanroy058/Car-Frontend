import type {
  Booking,
  Conversation,
  Listing,
  Message,
  Offer,
  Review,
  Ticket,
  User,
} from "./types";
import { getToken } from "./store";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

// Live backend API origin (hosted on Hostinger).
export const API_ORIGIN = "https://darkorange-chicken-877448.hostingersite.com";
const BASE = `${API_ORIGIN}/api`;

/**
 * Resolve an asset path (e.g. "/uploads/foo.jpg") to an absolute URL against
 * the live backend. Absolute URLs and data: URIs are returned unchanged.
 */
export function assetUrl(p?: string | null): string {
  if (!p) return "";
  if (/^(https?:)?\/\//i.test(p) || p.startsWith("data:")) return p;
  if (p.startsWith("/")) return `${API_ORIGIN}${p}`;
  return `${API_ORIGIN}/${p}`;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options?.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function apiLogin(
  email: string,
  password: string,
): Promise<{ user: User; token: string }> {
  return request<{ user: User; token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(
  name: string,
  email: string,
  password: string,
  role?: "agent",
): Promise<{ user: User; token: string }> {
  return request<{ user: User; token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  });
}

export async function apiGetMe(): Promise<User> {
  const { user } = await request<{ user: User }>("/auth/me");
  return user;
}

export async function apiUpdateProfile(
  patch: {
    name?: string;
    phone?: string;
    avatarUrl?: string;
    firmName?: string;
    firmLogoUrl?: string;
  },
): Promise<User> {
  const { user } = await request<{ user: User }>("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return user;
}

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

/** Resolve a listing's image paths to absolute URLs against the backend. */
function withAbsoluteImages<T extends Listing>(listing: T): T {
  if (listing?.images) {
    listing.images = listing.images.map((img) => assetUrl(img));
  }
  return listing;
}

export async function getListings(): Promise<Listing[]> {
  const { listings } = await request<{ listings: Listing[] }>("/listings");
  return listings.map(withAbsoluteImages);
}

export async function getListing(id: string): Promise<Listing> {
  const { listing } = await request<{ listing: Listing }>(`/listings/${id}`);
  return withAbsoluteImages(listing);
}

export async function getSimilar(id: string): Promise<Listing[]> {
  const { listings } = await request<{ listings: Listing[] }>(
    `/listings/${id}/similar`,
  );
  return listings.map(withAbsoluteImages);
}

export interface SearchFilters {
  q?: string;
  brand?: string[];
  body?: string[];
  fuel?: string[];
  trans?: string[];
  own?: string[];
  state?: string[];
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  kmMin?: number;
  kmMax?: number;
  sort?: string;
}

export async function searchListings(
  filters: SearchFilters,
): Promise<Listing[]> {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.brand?.length) params.set("brand", filters.brand.join(","));
  if (filters.body?.length) params.set("body", filters.body.join(","));
  if (filters.fuel?.length) params.set("fuel", filters.fuel.join(","));
  if (filters.trans?.length) params.set("trans", filters.trans.join(","));
  if (filters.own?.length) params.set("own", filters.own.join(","));
  if (filters.state?.length) params.set("state", filters.state.join(","));
  if (filters.priceMin !== undefined)
    params.set("priceMin", String(filters.priceMin));
  if (filters.priceMax !== undefined)
    params.set("priceMax", String(filters.priceMax));
  if (filters.yearMin !== undefined)
    params.set("yearMin", String(filters.yearMin));
  if (filters.yearMax !== undefined)
    params.set("yearMax", String(filters.yearMax));
  if (filters.kmMin !== undefined) params.set("kmMin", String(filters.kmMin));
  if (filters.kmMax !== undefined) params.set("kmMax", String(filters.kmMax));
  if (filters.sort) params.set("sort", filters.sort);

  const { listings } = await request<{ listings: Listing[] }>(
    `/listings/search?${params.toString()}`,
  );
  return listings.map(withAbsoluteImages);
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export async function getReviews(listingId: string): Promise<Review[]> {
  const { reviews } = await request<{ reviews: Review[] }>(
    `/reviews?listingId=${listingId}`,
  );
  return reviews;
}

/**
 * Reviews for several listings at once. The API is per-listing, so these are
 * fetched in parallel and flattened; a failure for one listing does not block
 * the rest. Used to populate the store so ratings show on cards and the
 * homepage, not only inside a detail tab.
 */
export async function getReviewsForListings(
  listingIds: string[],
): Promise<Review[]> {
  const results = await Promise.allSettled(listingIds.map((id) => getReviews(id)));
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

export async function addReview(
  r: Omit<Review, "id" | "createdAt">,
): Promise<Review> {
  const { review } = await request<{ review: Review }>("/reviews", {
    method: "POST",
    body: JSON.stringify(r),
  });
  return review;
}

// ---------------------------------------------------------------------------
// Offers
// ---------------------------------------------------------------------------

/**
 * Offers. Without a listingId this returns the caller's own offers plus offers
 * received on their listings; admins get everything. Scoped server-side.
 */
export async function getOffers(listingId?: string): Promise<Offer[]> {
  const url = listingId ? `/offers?listingId=${listingId}` : "/offers";
  const { offers } = await request<{ offers: Offer[] }>(url);
  return offers;
}

export async function createOffer(
  o: Omit<Offer, "id" | "createdAt" | "state">,
): Promise<Offer> {
  const { offer } = await request<{ offer: Offer }>("/offers", {
    method: "POST",
    body: JSON.stringify(o),
  });
  return offer;
}

export async function counterOffer(
  id: string,
  amount: number,
): Promise<void> {
  await request(`/offers/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ state: "countered", counterAmount: amount }),
  });
}

export async function updateOffer(
  id: string,
  patch: Partial<Offer>,
): Promise<void> {
  await request(`/offers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

/** Bookings for the caller; all bookings when the caller is an admin. */
export async function getBookings(): Promise<Booking[]> {
  const { bookings } = await request<{ bookings: Booking[] }>("/bookings");
  return bookings;
}

export async function createBooking(
  b: Omit<Booking, "id" | "createdAt" | "status">,
): Promise<Booking> {
  const { booking } = await request<{ booking: Booking }>("/bookings", {
    method: "POST",
    body: JSON.stringify(b),
  });
  return booking;
}

export async function patchBooking(
  id: string,
  patch: Partial<Booking>,
): Promise<Booking> {
  const { booking } = await request<{ booking: Booking }>(`/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return booking;
}

// ---------------------------------------------------------------------------
// Tickets
// ---------------------------------------------------------------------------

/** Tickets raised by the caller; all tickets when the caller is an admin. */
export async function getTickets(): Promise<Ticket[]> {
  const { tickets } = await request<{ tickets: Ticket[] }>("/tickets");
  return tickets;
}

export async function createTicket(
  t: Omit<Ticket, "id" | "createdAt" | "status">,
): Promise<Ticket> {
  const { ticket } = await request<{ ticket: Ticket }>("/tickets", {
    method: "POST",
    body: JSON.stringify(t),
  });
  return ticket;
}

export async function patchTicket(
  id: string,
  patch: Partial<Ticket>,
): Promise<Ticket> {
  const { ticket } = await request<{ ticket: Ticket }>(`/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return ticket;
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

/**
 * Conversations for the signed-in user (all of them when the caller is an
 * admin). Scope is derived server-side from the bearer token.
 */
export async function getConversations(): Promise<Conversation[]> {
  const { conversations } = await request<{ conversations: Conversation[] }>(
    "/conversations",
  );
  return conversations.map((c) => ({
    ...c,
    messages: (c.messages ?? []).map((m: unknown) => m as Message),
  }));
}

export async function getConversation(
  id: string,
): Promise<Conversation | null> {
  const { conversation } = await request<{ conversation: Conversation }>(
    `/conversations/${id}`,
  );
  return conversation
    ? {
        ...conversation,
        messages: (conversation.messages ?? []).map((m: unknown) => m as Message),
      }
    : null;
}

export async function startConversation(args: {
  listingId: string;
  sellerId: string;
  sellerName: string;
  listingTitle: string;
}): Promise<Conversation> {
  // The buyer is the authenticated caller; the server ignores any client-sent id.
  const { conversation } = await request<{ conversation: Conversation }>(
    "/conversations",
    {
      method: "POST",
      body: JSON.stringify(args),
    },
  );
  return conversation;
}

export async function sendMessage(
  conversationId: string,
  m: Omit<Message, "id" | "createdAt">,
): Promise<void> {
  await request(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ senderName: m.senderName, text: m.text }),
  });
}

export async function markConversationRead(id: string): Promise<void> {
  await request(`/conversations/${id}/read`, { method: "POST" });
}

// ---------------------------------------------------------------------------
// Saved searches & wishlist
// ---------------------------------------------------------------------------

export async function getSavedSearches(): Promise<
  { id: string; name: string; filters: Record<string, unknown>; createdAt: number }[]
> {
  const { searches } = await request<{
    searches: {
      id: string;
      name: string;
      filters: Record<string, unknown>;
      createdAt: number;
    }[];
  }>("/saved-searches");
  return searches;
}

export async function createSavedSearch(s: {
  name: string;
  filters: Record<string, unknown>;
}): Promise<{
  id: string;
  name: string;
  filters: Record<string, unknown>;
  createdAt: number;
}> {
  const { search } = await request<{
    search: {
      id: string;
      name: string;
      filters: Record<string, unknown>;
      createdAt: number;
    };
  }>("/saved-searches", {
    method: "POST",
    body: JSON.stringify(s),
  });
  return search;
}

export async function removeSavedSearch(id: string): Promise<void> {
  await request(`/saved-searches/${id}`, { method: "DELETE" });
}

export async function toggleWishlist(listingId: string): Promise<boolean> {
  const { added } = await request<{ added: boolean }>(`/wishlist/${listingId}`, {
    method: "POST",
  });
  return added;
}

export async function getWishlist(): Promise<string[]> {
  const { wishlist } = await request<{ wishlist: string[] }>("/wishlist");
  return wishlist;
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

export async function uploadImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("images", file);
  }

  const token = getToken();
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Upload failed: ${res.status}`);
  }

  const { urls } = await res.json();
  return (urls as string[]).map((u) => assetUrl(u));
}

// ---------------------------------------------------------------------------
// Create listing (server-side)
// ---------------------------------------------------------------------------

export async function createListing(
  data: Omit<Listing, "id" | "createdAt">,
): Promise<Listing> {
  const { listing } = await request<{ listing: Listing }>("/listings", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return withAbsoluteImages(listing);
}

export async function patchListing(
  id: string,
  patch: Partial<Listing> & { pricing?: Listing["pricing"]; featured?: boolean },
): Promise<Listing> {
  const { listing } = await request<{ listing: Listing }>(`/listings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return withAbsoluteImages(listing);
}
