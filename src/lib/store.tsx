import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  Booking,
  Conversation,
  Listing,
  Offer,
  Review,
  SavedSearch,
  Ticket,
  User,
} from "./types";
import {
  apiLogin,
  apiRegister,
  apiGetMe,
  apiUpdateProfile,
  createOffer,
  updateOffer as apiUpdateOffer,
  createTicket,
  patchTicket,
  createBooking,
  patchBooking,
  addReview as apiAddReview,
  startConversation,
  sendMessage,
  markConversationRead as apiMarkConversationRead,
  getListings,
  getConversations,
  getBookings,
} from "./api";

// ---------------------------------------------------------------------------
// Only UI/local state is persisted — entity data comes from the server
// ---------------------------------------------------------------------------

interface Persisted {
  user: User | null;
  token: string | null;
  wishlist: string[];
  recentlyViewed: string[];
  compare: string[];
  theme: "light" | "dark";
}

export interface StoreSnapshot {
  user: User | null;
  listings: Listing[];
  tickets: Ticket[];
  offers: Offer[];
  bookings: Booking[];
  wishlist: string[];
  recentlyViewed: string[];
  compare: string[];
  reviews: Review[];
  conversations: Conversation[];
  savedSearches: SavedSearch[];
}

export interface StoreMutators {
  addListing: (l: Listing) => void;
  updateListing: (id: string, patch: Partial<Listing>) => void;
  addTicket: (t: Omit<Ticket, "id" | "createdAt" | "status">) => void;
  updateTicket: (id: string, patch: Partial<Ticket>) => void;
  addOffer: (o: Omit<Offer, "id" | "createdAt" | "state">) => void;
  updateOffer: (id: string, patch: Partial<Offer>) => void;
  addBooking: (b: Omit<Booking, "id" | "createdAt" | "status">) => Booking;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
  addReview: (r: Omit<Review, "id" | "createdAt">) => void;
  addConversation: (
    c: Omit<Conversation, "id" | "createdAt" | "messages"> & {
      messages?: Conversation["messages"];
    },
  ) => Conversation;
  appendMessage: (
    id: string,
    m: Omit<Conversation["messages"][number], "id" | "createdAt">,
  ) => void;
  markConversationRead: (id: string, userId: string) => void;
  addSavedSearch: (s: Omit<SavedSearch, "id" | "createdAt">) => void;
  removeSavedSearch: (id: string) => void;
}

let _snapshot: StoreSnapshot | null = null;
let _mutators: StoreMutators | null = null;

let _resolveReady: () => void;
export const storeReady = new Promise<void>((resolve) => {
  _resolveReady = resolve;
});

export function getStore(): StoreSnapshot {
  if (!_snapshot) throw new Error("store not ready");
  return _snapshot;
}

export function getMutators(): StoreMutators {
  if (!_mutators) throw new Error("store not ready");
  return _mutators;
}

export function getToken(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw).token ?? null;
  } catch { /* ignore */ }
  return null;
}

interface AppState extends StoreSnapshot, StoreMutators {
  ready: boolean;
  theme: "light" | "dark";
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  loginAsAdmin: () => Promise<void>;
  register: (name: string, email: string, password: string, role?: "agent") => Promise<User>;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
  toggleWishlist: (id: string) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  markViewed: (id: string) => void;
  setTheme: (t: "light" | "dark") => void;
  resetData: () => void;
}

const Ctx = createContext<AppState | null>(null);

const KEY = "ucm:v1";

function loadPersisted(): Partial<Persisted> | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}

function savePersisted(p: Persisted) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch { /* ignore */ }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    const p = loadPersisted();
    if (p) {
      setUser(p.user ?? null);
      setToken(p.token ?? null);
      setWishlist(p.wishlist ?? []);
      setRecentlyViewed(p.recentlyViewed ?? []);
      setCompare(p.compare ?? []);
      setThemeState(p.theme ?? "light");
    }
    // Validate stored token and refresh user data
    if (p?.token) {
      apiGetMe()
        .then((u) => setUser(u))
        .catch(() => {
          // Token expired or invalid — clear it
          setToken(null);
          setUser(null);
        });
    }
    setReady(true);
    _resolveReady();

    getListings()
      .then((data) => setListings(data))
      .catch((err) => console.error("Failed to load listings:", err));
  }, []);

  // Persist only UI state + auth token
  useEffect(() => {
    if (!ready) return;
    const data: Persisted = {
      user,
      token,
      wishlist,
      recentlyViewed,
      compare,
      theme,
    };
    savePersisted(data);
  }, [ready, user, token, wishlist, recentlyViewed, compare, theme]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }
    const isAdmin = user.role === "admin";
    getConversations(isAdmin ? undefined : user.id, { all: isAdmin })
      .then(setConversations)
      .catch((err) => console.error("Failed to load conversations:", err));
    getBookings(isAdmin ? undefined : user.id)
      .then(setBookings)
      .catch((err) => console.error("Failed to load bookings:", err));
  }, [user?.id, user?.role]);

  const mutators = useMemo<StoreMutators>(
    () => ({
      addListing: (l) => setListings((prev) => [l, ...prev]),
      updateListing: (id, patch) =>
        setListings((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l))),
      addTicket: (t) => {
        const tempId = "t-" + Date.now();
        const nt: Ticket = { ...t, id: tempId, status: "open", createdAt: Date.now() };
        setTickets((prev) => [nt, ...prev]);
        createTicket(t).then((serverTicket) => {
          setTickets((prev) => prev.map((x) => (x.id === tempId ? serverTicket : x)));
        }).catch((err) => {
          console.error("Failed to create ticket:", err);
          setTickets((prev) => prev.filter((x) => x.id !== tempId));
        });
      },
      updateTicket: (id, patch) => {
        setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
        patchTicket(id, patch).catch((err) => console.error("Failed to update ticket:", err));
      },
      addOffer: (o) => {
        const tempId = "o-" + Date.now();
        const no: Offer = { ...o, id: tempId, state: "pending", createdAt: Date.now() };
        setOffers((prev) => [no, ...prev]);
        createOffer(o).then((serverOffer) => {
          setOffers((prev) => prev.map((x) => (x.id === tempId ? serverOffer : x)));
        }).catch((err) => {
          console.error("Failed to create offer:", err);
          setOffers((prev) => prev.filter((x) => x.id !== tempId));
        });
      },
      updateOffer: (id, patch) => {
        setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
        apiUpdateOffer(id, patch).catch((err) => console.error("Failed to update offer:", err));
      },
      addBooking: (b) => {
        const tempId = "b-" + Date.now();
        const nb: Booking = { ...b, id: tempId, status: "confirmed", createdAt: Date.now() };
        setBookings((prev) => [nb, ...prev]);
        createBooking(b).then((serverBooking) => {
          setBookings((prev) => prev.map((x) => (x.id === tempId ? serverBooking : x)));
        }).catch((err) => {
          console.error("Failed to create booking:", err);
          setBookings((prev) => prev.filter((x) => x.id !== tempId));
        });
        return nb;
      },
      updateBooking: (id, patch) => {
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
        patchBooking(id, patch).catch((err) => console.error("Failed to update booking:", err));
      },
      addReview: (r) => {
        const tempId = "r-" + Date.now();
        const nr: Review = { ...r, id: tempId, createdAt: Date.now() };
        setReviews((prev) => [nr, ...prev]);
        apiAddReview(r).then((serverReview) => {
          setReviews((prev) => prev.map((x) => (x.id === tempId ? serverReview : x)));
        }).catch((err) => {
          console.error("Failed to add review:", err);
          setReviews((prev) => prev.filter((x) => x.id !== tempId));
        });
      },
      addConversation: (c) => {
        const tempId = "c-" + Date.now();
        const nc: Conversation = {
          id: tempId,
          createdAt: Date.now(),
          messages: c.messages ?? [],
          listingId: c.listingId,
          buyerId: c.buyerId,
          sellerId: c.sellerId,
          sellerName: c.sellerName,
          listingTitle: c.listingTitle,
        };
        setConversations((prev) => [nc, ...prev]);
        startConversation({
          listingId: c.listingId,
          buyerId: c.buyerId,
          sellerId: c.sellerId,
          sellerName: c.sellerName,
          listingTitle: c.listingTitle,
        }).then((serverConv) => {
          setConversations((prev) =>
            prev.map((x) =>
              x.id === tempId
                ? { ...serverConv, messages: x.messages, lastReadAt: x.lastReadAt }
                : x,
            ),
          );
        }).catch((err) => {
          console.error("Failed to start conversation:", err);
          setConversations((prev) => prev.filter((x) => x.id !== tempId));
        });
        return nc;
      },
      appendMessage: (id, m) => {
        const tempMsgId = "m-" + Date.now();
        setConversations((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    { ...m, id: tempMsgId, createdAt: Date.now() },
                  ],
                }
              : c,
          ),
        );
        sendMessage(id, m, "").catch((err) =>
          console.error("Failed to send message:", err),
        );
      },
      markConversationRead: (id, userId) => {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, lastReadAt: { ...(c.lastReadAt ?? {}), [userId]: Date.now() } }
              : c,
          ),
        );
        apiMarkConversationRead(id, userId).catch((err) =>
          console.error("Failed to mark conversation read:", err),
        );
      },
      addSavedSearch: (s) => {
        const ns: SavedSearch = { ...s, id: "ss-" + Date.now(), createdAt: Date.now() };
        setSavedSearches((prev) => [ns, ...prev]);
      },
      removeSavedSearch: (id) =>
        setSavedSearches((prev) => prev.filter((s) => s.id !== id)),
    }),
    [],
  );

  useEffect(() => {
    _mutators = mutators;
  }, [mutators]);

  useEffect(() => {
    _snapshot = {
      user,
      listings,
      tickets,
      offers,
      bookings,
      wishlist,
      recentlyViewed,
      compare,
      reviews,
      conversations,
      savedSearches,
    };
  }, [
    user,
    listings,
    tickets,
    offers,
    bookings,
    wishlist,
    recentlyViewed,
    compare,
    reviews,
    conversations,
    savedSearches,
  ]);

  const value: AppState = {
    ready,
    user,
    token,
    listings,
    tickets,
    offers,
    bookings,
    wishlist,
    theme,
    recentlyViewed,
    compare,
    reviews,
    conversations,
    savedSearches,
    ...mutators,
    async login(email, password) {
      const { user: u, token: t } = await apiLogin(email, password);
      setUser(u);
      setToken(t);
      return u;
    },
    async register(name, email, password, role) {
      const { user: u, token: t } = await apiRegister(name, email, password, role);
      setUser(u);
      setToken(t);
      return u;
    },
    async loginAsAdmin() {
      const { user: u, token: t } = await apiLogin("admin@drivehub.io", "admin");
      setUser(u);
      setToken(t);
    },
    logout() {
      setUser(null);
      setToken(null);
    },
    updateProfile(patch) {
      setUser((u) => (u ? { ...u, ...patch } : u));
      apiUpdateProfile({ name: patch.name, phone: patch.phone }).catch((err) =>
        console.error("Failed to update profile:", err),
      );
    },
    toggleWishlist(id) {
      setWishlist((w) =>
        w.includes(id) ? w.filter((x) => x !== id) : [...w, id],
      );
    },
    toggleCompare(id) {
      setCompare((c) =>
        c.includes(id)
          ? c.filter((x) => x !== id)
          : c.length >= 3
            ? c
            : [...c, id],
      );
    },
    clearCompare() {
      setCompare([]);
    },
    markViewed(id) {
      setRecentlyViewed((r) =>
        [id, ...r.filter((x) => x !== id)].slice(0, 8),
      );
    },
    setTheme(t) {
      setThemeState(t);
    },
    resetData() {
      setUser(null);
      setToken(null);
      setListings([]);
      setTickets([]);
      setOffers([]);
      setBookings([]);
      setWishlist([]);
      setRecentlyViewed([]);
      setCompare([]);
      setReviews([]);
      setConversations([]);
      setSavedSearches([]);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be inside AppProvider");
  return v;
}
