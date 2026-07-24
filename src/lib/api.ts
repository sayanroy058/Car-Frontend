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

const BASE = "/api";

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
  patch: { name?: string; phone?: string },
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

export async function getListings(): Promise<Listing[]> {
  const { listings } = await request<{ listings: Listing[] }>("/listings");
  return listings;
}

export async function getListing(id: string): Promise<Listing> {
  const { listing } = await request<{ listing: Listing }>(`/listings/${id}`);
  return listing;
}

export async function getSimilar(id: string): Promise<Listing[]> {
  const { listings } = await request<{ listings: Listing[] }>(
    `/listings/${id}/similar`,
  );
  return listings;
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
  return listings;
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

export async function getOffers(listingId?: string): Promise<Offer[]> {
  const url = listingId
    ? `/offers?listingId=${listingId}`
    : "/offers";
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

export async function getBookings(userId?: string): Promise<Booking[]> {
  const url = userId
    ? `/bookings?userId=${userId}`
    : "/bookings";
  const { bookings } = await request<{ bookings: Booking[] }>(url);
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

export async function getTickets(userId?: string): Promise<Ticket[]> {
  const url = userId ? `/tickets?userId=${userId}` : "/tickets";
  const { tickets } = await request<{ tickets: Ticket[] }>(url);
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

export async function getConversations(
  userId?: string,
  opts?: { all?: boolean },
): Promise<Conversation[]> {
  const qs = opts?.all ? "all=true" : `userId=${userId}`;
  const { conversations } = await request<{ conversations: Conversation[] }>(
    `/conversations?${qs}`,
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
  buyerId: string;
  sellerId: string;
  sellerName: string;
  listingTitle: string;
}): Promise<Conversation> {
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
  _sellerId: string,
): Promise<void> {
  await request(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ ...m, mine: m.mine ? 1 : 0 }),
  });
}

export async function markConversationRead(
  id: string,
  userId: string,
): Promise<void> {
  await request(`/conversations/${id}/read`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
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

export async function toggleWishlist(
  userId: string,
  listingId: string,
): Promise<boolean> {
  const { added } = await request<{ added: boolean }>(
    `/wishlist/${listingId}`,
    {
      method: "POST",
      body: JSON.stringify({ userId }),
    },
  );
  return added;
}

export async function getWishlist(userId: string): Promise<string[]> {
  const { wishlist } = await request<{ wishlist: string[] }>(
    `/wishlist?userId=${userId}`,
  );
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
  return urls as string[];
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
  return listing;
}

export async function patchListing(
  id: string,
  patch: Partial<Listing> & { pricing?: Listing["pricing"]; featured?: boolean },
): Promise<Listing> {
  const { listing } = await request<{ listing: Listing }>(`/listings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return listing;
}
