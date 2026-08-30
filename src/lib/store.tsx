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
  getOffers,
  getTickets,
  getReviewsForListings,
  getWishlist,
  toggleWishlist as apiToggleWishlist,
  getSavedSearches,
  createSavedSearch,
  removeSavedSearch as apiRemoveSavedSearch,
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
  /** "system" follows the OS setting and keeps following it as it changes. */
  theme: ThemePreference;
}

/** What the user chose. "system" is resolved against the OS at render time. */
export type ThemePreference = "light" | "dark" | "system";

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
  /** The user's choice, which may be "system". */
  theme: ThemePreference;
  /** The theme actually applied right now, after resolving "system". */
  resolvedTheme: "light" | "dark";
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
  setTheme: (t: ThemePreference) => void;
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
  const [theme, setThemeState] = useState<ThemePreference>("light");
  const [systemDark, setSystemDark] = useState(false);
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
      .then((data) => {
        setListings(data);
        // Reviews were previously never fetched, so seeded and other users'
        // reviews never appeared anywhere. Load them for the visible inventory
        // so ratings can surface on cards and the homepage.
        const visible = data
          .filter((l) => l.status === "listed" || l.status === "approved")
          .map((l) => l.id);
        if (visible.length) {
          getReviewsForListings(visible)
            .then(setReviews)
            .catch((err) => console.error("Failed to load reviews:", err));
        }
      })
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

  // Track the OS colour scheme so the "System" option keeps following it rather
  // than resolving once at the moment it was clicked.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme: "light" | "dark" =
    theme === "system" ? (systemDark ? "dark" : "light") : theme;

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  // Load everything scoped to the signed-in user. Offers, tickets, the wishlist
  // and saved searches were previously never fetched — offers and tickets came
  // only from local optimistic writes, and the wishlist lived solely in
  // localStorage, so nothing survived a reload or followed the user to another
  // device.
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setBookings([]);
      setOffers([]);
      setTickets([]);
      setSavedSearches([]);
      return;
    }

    const report = (what: string) => (err: unknown) =>
      console.error(`Failed to load ${what}:`, err);

    getConversations().then(setConversations).catch(report("conversations"));
    getBookings().then(setBookings).catch(report("bookings"));
    getOffers().then(setOffers).catch(report("offers"));
    getTickets().then(setTickets).catch(report("tickets"));
    getSavedSearches().then(setSavedSearches).catch(report("saved searches"));
    getWishlist()
      .then((ids) => {
        // Merge anything wishlisted before signing in, then push the union up.
        setWishlist((local) => {
          const merged = [...new Set([...ids, ...local])];
          for (const id of merged.filter((x) => !ids.includes(x))) {
            apiToggleWishlist(id).catch(report("wishlist sync"));
          }
          return merged;
        });
      })
      .catch(report("wishlist"));
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
        sendMessage(id, m).catch((err) =>
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
        apiMarkConversationRead(id).catch((err) =>
          console.error("Failed to mark conversation read:", err),
        );
      },
      addSavedSearch: (s) => {
        const tempId = "ss-" + Date.now();
        const ns: SavedSearch = { ...s, id: tempId, createdAt: Date.now() };
        setSavedSearches((prev) => [ns, ...prev]);
        // Persist server-side so saved searches survive a reload and follow the
        // user across devices.
        createSavedSearch({ name: s.name, filters: s.filters })
          .then((saved) =>
            setSavedSearches((prev) =>
              prev.map((x) => (x.id === tempId ? saved : x)),
            ),
          )
          .catch((err) => {
            console.error("Failed to save search:", err);
            setSavedSearches((prev) => prev.filter((x) => x.id !== tempId));
          });
      },
      removeSavedSearch: (id) => {
        setSavedSearches((prev) => prev.filter((s) => s.id !== id));
        apiRemoveSavedSearch(id).catch((err) =>
          console.error("Failed to remove saved search:", err),
        );
      },
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
    resolvedTheme,
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
      apiUpdateProfile({
        name: patch.name,
        phone: patch.phone,
        avatarUrl: patch.avatarUrl,
        firmName: patch.firmName,
        firmLogoUrl: patch.firmLogoUrl,
      })
        .then((serverUser) => setUser(serverUser))
        .catch((err) => console.error("Failed to update profile:", err));
    },
    toggleWishlist(id) {
      const wasSaved = wishlist.includes(id);
      setWishlist((w) => (wasSaved ? w.filter((x) => x !== id) : [...w, id]));
      // Persist for signed-in users so the wishlist follows them across devices.
      if (user) {
        apiToggleWishlist(id).catch((err) => {
          console.error("Failed to update wishlist:", err);
          // Roll back so the UI matches the server.
          setWishlist((w) => (wasSaved ? [...w, id] : w.filter((x) => x !== id)));
        });
      }
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
