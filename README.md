# ✈ SkyBook — Flight Management PWA

A production-grade flight management web app built with **Next.js 14**, **Supabase**, **Zustand**, and **Tailwind CSS**.

---

## 🚀 Features

- **Flight Search** — Origin, destination, date & passenger count
- **Interactive Seat Map** — Real-time availability via Supabase Realtime subscriptions
- **Booking Flow** — Passenger details, PNR generation, confirmation page
- **My Bookings** — View all bookings with status badges
- **Reschedule** — Pick alternative flight on same route, automatic fee calculation
- **Cancel** — Atomic cancellation with 2-hour departure rule enforced at DB level
- **PWA** — Installable, offline-capable with StaleWhileRevalidate caching

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend & API | Next.js 14 (App Router) |
| Database & Auth | Supabase (PostgreSQL + Auth + Realtime) |
| State | Zustand with persist middleware |
| Styling | Tailwind CSS |
| PWA | next-pwa |

---

## 📦 Local Setup

### 1. Clone & install
```bash
git clone https://github.com/your-username/flight-management-pwa
cd flight-management-pwa
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```
Fill in your Supabase project URL and anon key from the [Supabase Dashboard](https://app.supabase.com).

### 3. Run Supabase migrations
In your Supabase project's SQL editor, run each file in order:
```
supabase/migrations/001_create_tables.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_rpc_functions.sql
supabase/migrations/004_seed.sql
supabase/migrations/005_realtime.sql
```

### 4. Create test user
In Supabase Auth dashboard, create a user manually:
- **Email:** `test@skybook.dev`
- **Password:** `test1234`

Or use the sign-up form in the app.

### 5. Start dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🗄 Supabase Project Config

| Setting | Value |
|---|---|
| Auth email confirmations | Disabled (for dev) |
| RLS | Enabled on all tables |
| Realtime | Enabled on `seats` and `bookings` |

**Environment variables needed:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... (optional, for admin tasks)
```

---

## 🧠 Zustand Store Structure

### `useFlightStore` (persisted to localStorage, with partialize)
```ts
{
  searchQuery: SearchQuery          // Persisted
  selectedFlight: Flight | null     // Persisted
  selectedSeat: Seat | null         // Persisted
  bookingStep: BookingStep          // Persisted
  passengerForm: PassengerForm      // Partially persisted — passport_no EXCLUDED
  optimisticSeatId: string | null   // NOT persisted (runtime only)
}
```

**Key design decisions:**
- `partialize` excludes `passport_no` from localStorage — sensitive data never touches client storage
- `optimisticSeatId` marks a seat selected in the store before the Supabase RPC confirms — enabling instant UI feedback
- `reset()` is called on booking cancellation and logout to clear in-progress booking state

### `useUserStore` (persisted — session token only)
```ts
{
  user: User | null
  session: Session | null          // Only access_token + refresh_token persisted
  cachedBookings: Booking[]        // Cached for offline reading
}
```

---

## 🔒 Security Architecture

### RLS Policies
- **flights, seats** — Public read (no auth required for browsing)
- **bookings** — `user_id = auth.uid()` on all operations
- **passengers** — Access via booking ownership check
- **reschedules** — Access via booking ownership check

### Seat Locking (Anti-double-booking)
The `reserve_seat(p_seat_id)` RPC uses `FOR UPDATE` row locking:
```sql
SELECT is_available FROM seats WHERE id = p_seat_id FOR UPDATE;
```
This ensures concurrent requests block on the lock, preventing two users from booking the same seat simultaneously.

### 2-Hour Cancellation Rule
Enforced at **two levels**:
1. `cancel_booking()` RPC checks `departs_at - NOW() < INTERVAL '2 hours'` and raises an exception
2. A `BEFORE UPDATE` trigger on `bookings` re-checks the constraint, making it impossible to bypass even with direct SQL

---

## 🗺 Database Schema

```
flights        — flight details, route, timing, price
seats          — seat map per flight, class, availability, extra fee
bookings       — user bookings with PNR, status, total price
passengers     — passenger details linked to booking
reschedules    — reschedule history with fee tracking
```

---

## 📱 PWA Configuration

- **Cache strategy:** `StaleWhileRevalidate` for flight search API calls
- **Static assets:** `CacheFirst` with 30-day expiry
- **Offline fallback:** `/public/offline.html` shown when no connectivity
- **My Bookings:** Readable offline via Zustand persisted `cachedBookings`
- **Install prompt:** Banner shown to first-time mobile visitors via `beforeinstallprompt`

---

## 🚢 Deployment (Vercel)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy

---

## ⏱ Trade-offs & What I'd Do Differently

- **Seat locking timeout:** Currently seats are locked permanently on booking attempt failure. In production, I'd add a `locked_until` column and a scheduled job to release locks after 5 minutes.
- **Payment integration:** Would integrate Razorpay/Stripe for actual payment before confirming booking.
- **Email notifications:** Would send booking confirmation emails via Supabase Edge Functions + Resend.
- **Admin panel:** A separate `/admin` route with service role access for managing flights and overrides.
- **Testing:** Would add Vitest unit tests for Zustand store logic and Playwright E2E for the booking flow.
