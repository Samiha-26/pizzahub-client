# PizzaHub — Artisanal Pizza Ordering & Delivery Platform (Client)

Frontend web application for **PizzaHub** — a production-grade artisanal pizza ordering and delivery platform featuring sourdough crust styles, wood-fired hearth dispatch tracking, multi-vendor kitchens, and Stripe payment processing.

---

## 🔗 Repository & Live Deployment Links

- **Live Website**: [Insert Live Production URL]
- **Client Repository**: [Insert Client GitHub URL]
- **Server Repository**: [Insert Server GitHub URL]

---

## 🛠️ Technology Stack & Dependencies

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Component Primitives**: Radix UI / ShadCN UI
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Authentication**: Better Auth (`@better-auth/react`)
- **Payments**: Stripe Client SDK (`@stripe/stripe-js`)

---

## ✨ Key Features by Role

### 🍕 Customer Features
- **Artisan Catalog & Filtering**: Search by keyword, filter by crust fermentation, category, and sort by price (low to high, high to low).
- **Hearth Dispatch Scheduling**: Order modal with ASAP or future time-slot delivery scheduling and US delivery hub auto-fill.
- **Customer Dashboard**: Overview metrics (Total, Pending, Accepted, Cancelled), order history, live 4-stage tracking timeline, itemized invoices, and cancellation of pending tickets.
- **Verified Buyer Reviews**: Community ratings and feedback system with 1–5 star distribution and direct submission.

### 👨‍🍳 Vendor Features
- **Kitchen Dashboard**: Revenue metrics, total dispatches, and quota tracking.
- **Add Menu Item**: ImgBB image upload, crust customization, and automated tier limit verification (free: 3 items, premium: unlimited).
- **Manage Menu Catalog**: View, update ingredients, modify prices, and delete pizzas.
- **Customer Orders**: Live kitchen ticket queue with status progression (Accept/Preparing, On the Way, Delivered, Decline/Cancel).
- **Stripe Subscription**: Upgrade to Premium Master Baker tier with live crown badge and featured placement.

### 🛡️ Admin Features
- **Admin Dashboard**: Platform-wide metrics (GMV, active users, orders, and recipes).
- **User Governance**: Search users, filter by role, promote/demote roles (`customer`, `vendor`, `admin`), and block/unblock accounts.
- **Menu Moderation**: Review submitted recipes, approve, reject, toggle visibility, and delete.
- **Financial Audit Ledger**: Real-time Stripe transaction logs with session IDs and payment statuses.

---

## 🏆 Challenge Implementations

### 1. Advanced Search & Sorting
- **API Query Parameters**:
  - `search`: Keyword query searching pizza names, descriptions, and ingredients (`/api/menu?search=margherita`).
  - `category`: Category filtering (`/api/menu?category=Wood-Fired`).
  - `crust`: Crust fermentation filtering (`/api/menu?crust=Neapolitan%2048h`).
  - `sort`: Dynamic sort parameter supporting `price-asc` (Price: Low to High), `price-desc` (Price: High to Low), `rating-desc` (Top Rated), and `newest` (Newest Creations).
- **Client Implementation**: Real-time URL synchronization, debounce timer, active filter count badge, and zero-state reset action.

### 2. JWT Verification Middleware Flow
- **Middleware Flow (`middlewares/auth.js`)**:
  - Validates `Authorization: Bearer <token>` on protected routes.
  - Verifies token cryptographically using `jose` against Better Auth JWKS and symmetric secret fallback.
  - Automatically rejects invalid, tampered, or expired tokens with `401 Unauthorized`.
  - Verifies account status is not `blocked` and role matches allowed permission tier with `403 Forbidden`.

### 3. Professional Visuals & Design System
- **Artisan Color System**: `#8E1616` (wood-fire crimson), `#FAF7F2` (warm dough cream), `#190F0E` (charred crust dark).
- **Typography**: Modern geometric typography using *Plus Jakarta Sans*.
- **Interactive Feedback**: Framer Motion animations, slide-over cart drawer with quantity steppers, receipt modals, and toast alerts.

---

## 🌟 Optional Requirements Implemented

1. **Reviews and Ratings for Menu Items**:
   - Interactive star rating selection (1–5 stars) on each pizza detail page.
   - Live breakdown of average score, star distribution percentages, and verified buyer reviews.
2. **Order Status Timeline on Order Details**:
   - 4-stage tracking timeline on `/orders` ("Order Placed", "Hearth Wood-Firing", "Thermal Transit", "Delivered Hot").
   - Color-coded progress indicators, active step highlighting, and cancel actions for pending orders.
3. **Interactive Cart System & Slide-Over Drawer**:
   - Persistent `localStorage` cart with live badge count, stepper controls, sales tax, and automated free delivery threshold over $35.

---

## 📦 Environment Variables Configuration

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_better_auth_secret_here
MONGODB_URL=mongodb+srv://...
DB_NAME=pizzahub
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key_here
```

---

## 🚀 Local Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open application**:
   Navigate to [http://localhost:3000](http://localhost:3000)
