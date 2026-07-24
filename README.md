# DriveHub — Premium Used Car Marketplace

A full-stack marketplace for buying and selling certified pre-owned cars. **React 19 + Vite** frontend with a **Node.js + Express 5** backend, **SQLite3** database, JWT auth, and local image storage.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS v4, TanStack Router, TanStack Query |
| Backend | Node.js, Express 5, TypeScript |
| Database | SQLite3 (`better-sqlite3`) with WAL mode + migration system |
| Auth | JWT (`jsonwebtoken`) + bcryptjs password hashing |
| Uploads | Multer — images stored locally in `server/uploads/` |
| UI | Radix UI (shadcn/ui), Lucide Icons, Recharts, Sonner toasts |
| Forms | React Hook Form + Zod validation |
| Testing | E2E test script covering all API endpoints |

---

## Quick Start

### Prerequisites
- **Node.js** >= 18
- **npm** >= 9

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Download car images (optional but recommended)
npx tsx scripts/download-images.ts

# 3. Start both servers (backend + frontend)
npm run dev:all
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

### Default Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| Admin | `admin@drivehub.io` | `admin` | `/admin-login` → `/admin` |
| Agent | `agent@drivehub.io` | `agent` | Login page → Agent Demo → `/agent` |
| User | Register via `/register` | — | `/dashboard` |

---

## Available Scripts

```bash
# Development
npm run dev           # Vite frontend only
npm run dev:server    # Express backend (hot-reload via tsx watch)
npm run dev:all       # Both concurrently

# Build
npm run build         # Production build
npm run preview       # Preview production build

# Database
npm run migrate       # Run pending migrations
npm run seed          # Seed database with sample data

# Images
npx tsx scripts/download-images.ts   # Download car images from Unsplash

# Testing
npx tsx scripts/test-e2e.ts          # Run end-to-end API tests (29 tests)
npm run typecheck                    # TypeScript type checking

# Code quality
npm run lint          # ESLint
npm run format        # Prettier
```

---

## Project Structure

```
ride-redefined-io/
├── server/                       # Express 5 backend
│   ├── server.ts                 # Entry point — middleware, routes, static files
│   ├── db.ts                     # SQLite connection + WAL mode
│   ├── migrate.ts                # Lightweight migration runner (_migrations table)
│   ├── seed.ts                   # Seeds 14 cars, admin/agent users, offers, reviews, tickets
│   ├── middleware/
│   │   └── auth.ts               # JWT middleware (requireAuth, optionalAuth)
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── routes/
│   │   ├── auth.ts               # POST login, POST register, GET me, PATCH profile
│   │   ├── listings.ts           # GET all, GET search, GET by ID, GET similar, POST, PATCH
│   │   ├── upload.ts             # POST (multer — image upload to /uploads)
│   │   ├── offers.ts             # GET, POST, PATCH
│   │   ├── bookings.ts           # GET, POST, PATCH
│   │   ├── tickets.ts            # GET, POST, PATCH
│   │   ├── reviews.ts            # GET (public), POST (auth-protected)
│   │   ├── conversations.ts      # Chat messages
│   │   ├── saved-searches.ts     # CRUD
│   │   └── wishlist.ts           # Toggle + list
│   └── uploads/                  # Car images (135+ .jpg files)
├── src/                          # React frontend (32 route pages)
│   ├── main.tsx                  # App entry
│   ├── router.tsx                # TanStack Router setup
│   ├── routeTree.gen.ts          # Auto-generated route tree
│   ├── lib/
│   │   ├── api.ts                # All API calls (JWT Bearer in headers)
│   │   ├── store.tsx             # React Context — auth + all entity state
│   │   ├── types.ts              # TypeScript types (Listing, User, Offer, etc.)
│   │   ├── constants.ts          # BRANDS, BODY_TYPES, FUEL_TYPES, helpers
│   │   ├── validations.ts        # Zod schemas for forms
│   │   └── queries.ts            # React Query key factory
│   ├── components/
│   │   ├── site/                 # Feature components (CarCard, Navbar, etc.)
│   │   └── ui/                   # shadcn/ui primitives
│   └── routes/                   # File-based routes (32 pages)
│       ├── __root.tsx             # Root layout + Navbar/Footer
│       ├── index.tsx              # Homepage
│       ├── login.tsx              # User login + Agent Demo quick-access
│       ├── admin-login.tsx        # Dedicated admin login page
│       ├── register.tsx           # User registration
│       ├── dashboard.tsx          # User dashboard (listings, offers, bookings)
│       ├── admin.tsx              # Admin console (approval queue, inventory, Add Car, tickets)
│       ├── agent.index.tsx        # Agent dashboard (pipeline, commission)
│       ├── agent.sell.tsx         # Agent car onboarding (multi-step)
│       ├── sell.tsx               # User car selling (multi-step + image upload)
│       ├── buy.index.tsx          # Browse/search inventory
│       ├── buy.$id.tsx            # Car detail page
│       ├── buy.$id.inspection.tsx
│       ├── buy.$id.defects.tsx
│       ├── buy.$id.report.tsx
│       ├── checkout.$id.tsx       # Booking/checkout
│       ├── wishlist.tsx
│       ├── compare.tsx
│       ├── finance.tsx            # EMI calculator
│       ├── chat.index.tsx         # Chat list
│       ├── chat.$id.tsx           # Chat conversation
│       ├── profile.tsx
│       ├── settings.tsx
│       ├── notifications.tsx
│       ├── support.tsx
│       ├── saved-searches.tsx
│       ├── about.tsx
│       ├── contact.tsx
│       ├── privacy.tsx
│       ├── terms.tsx
│       ├── forgot-password.tsx
│       └── verify-otp.tsx
├── scripts/
│   ├── download-images.ts        # Download car images from Unsplash
│   └── test-e2e.ts               # End-to-end API test suite (29 tests)
├── public/                       # Static assets
├── vite.config.ts                # Vite config (API proxy to :3001)
├── vercel.json
├── tsconfig.json
├── eslint.config.js
├── .prettierrc
└── package.json
```

---

## API Endpoints

### Public (no auth required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/login` | Login → `{ user, token }` |
| `POST` | `/api/auth/register` | Register → `{ user, token }` |
| `GET` | `/api/listings` | All listings |
| `GET` | `/api/listings/search?brand=Tesla&yearMin=2020` | Search/filter (only listed/approved) |
| `GET` | `/api/listings/:id` | Single listing |
| `GET` | `/api/listings/:id/similar` | Similar cars by body type |
| `GET` | `/api/reviews?listingId=:id` | Reviews for a listing |
| `GET` | `/uploads/*` | Static image files |

### Protected (Bearer token required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/me` | Current user profile |
| `PATCH` | `/api/auth/profile` | Update name/phone |
| `POST` | `/api/listings` | Create listing |
| `PATCH` | `/api/listings/:id` | Update listing (status, pricing, etc.) |
| `POST` | `/api/upload` | Upload images (multipart, 20 files max, 10MB each) |
| `GET` | `/api/offers?listingId=:id` | Get offers |
| `POST` | `/api/offers` | Create offer |
| `PATCH` | `/api/offers/:id` | Update offer (state, counterAmount) |
| `GET` | `/api/bookings?userId=:id` | Get bookings |
| `POST` | `/api/bookings` | Create booking |
| `PATCH` | `/api/bookings/:id` | Update booking status |
| `GET` | `/api/tickets` | Get tickets |
| `POST` | `/api/tickets` | Create ticket |
| `PATCH` | `/api/tickets/:id` | Update ticket status |
| `POST` | `/api/reviews` | Add review |
| `GET` | `/api/conversations?userId=:id` | Get conversations |
| `POST` | `/api/conversations` | Start conversation |
| `POST` | `/api/conversations/:id/messages` | Send message |
| `POST` | `/api/conversations/:id/read` | Mark as read |
| `GET` | `/api/saved-searches` | Get saved searches |
| `POST` | `/api/saved-searches` | Create saved search |
| `DELETE` | `/api/saved-searches/:id` | Delete saved search |
| `GET` | `/api/wishlist?userId=:id` | Get wishlist |
| `POST` | `/api/wishlist/:listingId` | Toggle wishlist |

---

## Key Features

### Authentication
- **JWT-based** — tokens stored in localStorage, sent via `Authorization: Bearer` header
- **Three roles**: `user`, `agent`, `admin`
- **Separate admin login page** at `/admin-login`
- **Agent demo login** on the login page and navbar

### Listings & Inventory
- **Multi-step sell form** with image upload (exterior, interior, docs)
- **Agent onboarding flow** for walk-in sellers
- **Admin "Add Car"** tab to directly publish inventory
- **Approval pipeline**: pending_review → under_inspection → approved → listed → sold/rejected
- **Pricing breakdown**: base + refurbishment + repair + transport + inspection + docs + commission + margin
- **Search & filter**: by brand, body type, fuel, transmission, ownership, state, price, year, KM

### Image Storage
- **All images stored locally** in `server/uploads/` (135+ car images)
- **Multer** handles multipart uploads with file validation (JPG, PNG, WebP, max 10MB)
- **Served via Express static** at `/uploads/*`
- **Unsplash download script** fetches real car photos for seed data

### Offers & Bookings
- Buyers make offers on listings
- Sellers accept, counter, or decline
- Reservation, purchase, and test drive bookings
- All mutations persist to backend via API

### Admin Console
- **Approval queue** with inspection scores, bulk approve
- **Cost breakdown** editor for pricing before publishing
- **Inventory table** with status, views, pricing
- **Add Car form** with image upload
- **Support ticket management** with status updates
- **Analytics**: sales charts, revenue, conversion funnel, inventory by status

### Agent Console
- **Dashboard** with onboarding trend, commission tracking
- **Car onboarding** multi-step form for walk-in sellers
- **Pipeline view**: all, pending, listed, sold

### User Dashboard
- Track submitted listings, offers, bookings
- Wishlist and comparison tools
- EMI calculator
- Support ticket management

### State Management
- **React Context** for auth + entity state
- **TanStack Query** for server data fetching on route load
- **Optimistic updates** — UI updates instantly, API persists in background
- **Automatic revert** on API failure for creates (offers, bookings, tickets, reviews, conversations)
- **All mutations wired to backend** — nothing is local-only anymore

---

## Database

SQLite3 with WAL mode and foreign keys enabled. Migrations run automatically on server start.

### `_migrations` table
Tracks applied migrations so they never run twice. Run manually with `npm run migrate`.

### Seed data
On first start, seeds:
- **14 cars** (Tesla, BMW, Porsche, Mercedes, Audi, Toyota, Honda, Polestar, Volvo, Lexus, Hyundai, Kia, Mazda, VW)
- **2 users** (admin, agent) with bcrypt-hashed passwords
- **4 support tickets**
- **2 offers** on seed-1
- **8+ reviews**

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Backend server port |
| `JWT_SECRET` | `drivehub-dev-secret-change-in-production` | JWT signing secret |

---

## E2E Testing

```bash
npx tsx scripts/test-e2e.ts
```

Runs **29 tests** covering:
- Health check
- Seller registration + login + profile
- Image upload (2 images)
- Listing creation with uploaded images
- Listing retrieval by ID
- Search (brand filter)
- Image accessibility via HTTP
- Admin login + listing creation
- Database state verification

---

## Architecture Notes

### Data Flow
```
Browser → Vite (:5173) → /api proxy → Express (:3001) → SQLite
```

### Request Lifecycle
1. Frontend calls API via `src/lib/api.ts` (attaches JWT from `getToken()`)
2. Vite dev server proxies `/api/*` to `http://localhost:3001`
3. Express middleware checks auth (`requireAuth` / `optionalAuth`)
4. Route handler queries SQLite via `better-sqlite3`
5. Response flows back to React component

### Store Mutator Pattern
All store mutators follow the same optimistic-update pattern:
1. Generate temp ID locally
2. Update React state immediately (optimistic)
3. Fire API call in background
4. On success: replace temp ID with server response
5. On failure: revert state + log error
