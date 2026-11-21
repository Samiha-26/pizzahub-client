# PizzaHub

**PizzaHub** is an artisanal pizza ordering and delivery platform connecting food lovers with authentic wood-fired pizzerias across the United States. Built as a full-featured, multi-tenant marketplace, the platform allows customers to discover local pizza houses, customize cold-fermented sourdough pies, track dispatches through an interactive 4-stage hearth timeline, and place multi-item orders via a slide-over cart. Independent pizzerias manage culinary catalogs, monitor kitchen quotas, and progress ticket dispatches, while platform administrators govern accounts, moderate recipes, and monitor Stripe financial transactions.

Live site: https://pizzahub-client.vercel.app

Client repository: https://github.com/Samiha-26/pizzahub-client

Server repository: https://github.com/Samiha-26/pizzahub-server

### Demo accounts

| Role | Email | Password | Access scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@pizzahub.com` | `AdminPassword123!` | Full admin console, user moderation, recipe approvals, financial ledger |
| **Vendor (Premium)** | `ahnaf@gmail.com` | `VendorPassword123!` | Kitchen portal, unlimited recipe slots, featured placement, live orders |
| **Vendor (Free)** | `adiba@gmail.com` | `VendorPassword123!` | Standard kitchen portal (capped at 3 active recipes until upgrade) |
| **Customer** | `sam@gmail.com` | `CustomerPassword123!` | Full ordering, persistent cart, hearth scheduling, ticket tracking |

---

## Features

- **Artisan Catalog & Advanced Filtering**: Browse approved wood-fired pizzas with full-text keyword search across names, ingredients, and descriptions. Filter by culinary category (Wood-Fired, Classic Italian, White Base, Spicy & Fiery, Vegetarian & Plant) and crust fermentation style (Neapolitan 48h, Roman Thin Crust, Detroit Pan, Gluten-Free Cauliflower, Sourdough Stuffed).
- **Sorting by Price & Quality**: Sort pizzas dynamically by price ascending (Low to High), price descending (High to Low), customer rating, or newest additions.
- **Interactive Slide-Over Cart Drawer**: Global persistent shopping cart with real-time navbar counter badge, increment/decrement steppers, item removal, sales tax calculation, free delivery threshold (orders over $35), and multi-item order placement.
- **Hearth Dispatch Scheduling**: Order modal with ASAP or future time-slot delivery scheduling, delivery destination auto-fill, and customer baker notes.
- **Live 4-Stage Dispatch Timeline**: Real-time order progress tracking through four stages: *Order Placed*, *Hearth Wood-Firing*, *Thermal Transit*, and *Delivered Hot*, with color-coded stage indicators.
- **Order Cancellation**: Customers can cancel pending orders directly from their dashboard. Orders already being fired or in transit are securely locked against cancellation.
- **Itemized Invoice & Printable Receipts**: View itemized order receipts detailing pizza selections, crust type, quantities, unit prices, tax, delivery fees, and print or download receipts directly.
- **Verified Buyer Reviews & Ratings**: Submit 1–5 star ratings and reviews on pizza detail pages, with dynamic average score updates and star rating distribution breakdown.
- **Dedicated Role-Based Dashboard Layout**: Distinct sidebar navigation on desktop (`w-64`) with user profile cards, role badges, and active state highlights, transitioning to a responsive collapsible drawer on mobile.
- **Vendor Kitchen Portal**: Manage restaurant profile, track hearth revenue, view active recipe limits, upload photos via ImgBB CDN, edit pizza specifications, toggle availability, and process incoming tickets.
- **Stripe Subscription Upgrades**: Free-tier vendors are capped at 3 recipes. Upgrading to Premium ($29/month) via Stripe Checkout activates unlimited slots and gold crown badge only after a verified webhook event.
- **Platform Administration & User Governance**: Admin dashboard displaying gross platform volume, total orders, users, and recipes. Manage user roles, approve/reject recipes, and block or unblock accounts with server-side enforcement.
- **Secure Authentication with Better Auth**: Email/password registration and Google OAuth. Password rules enforce minimum 6 characters, uppercase, and lowercase letters. Public sign-up is strictly limited to Customer and Vendor accounts.

---

## Tech stack

- **Next.js 16 (App Router)** with TypeScript
- **Tailwind CSS** with Tailwind Merge and CLSX
- **Radix UI & ShadCN UI** component primitives
- **Better Auth** (`@better-auth/react`) with MongoDB adapter and JWT support
- **Framer Motion / Motion** for animations
- **Stripe Client SDK** (`@stripe/stripe-js`) for checkout redirection
- **Lucide React** for icons
- **React Hot Toast** for alerts and confirmations
- **Canvas Confetti** for celebration feedback

---

## Challenge implementations

### 1. Advanced Search & Sorting
- **Implementation**: The catalog page (`/menu`) connects to the Express backend endpoint `GET /api/menu`.
- **Query parameters**:
  - `search`: Keyword string matching pizza names, descriptions, or ingredients.
  - `category`: Matches specific categories (`Wood-Fired`, `Classic Italian`, etc.).
  - `crust`: Matches crust fermentation types (`Neapolitan 48h`, `Roman Thin Crust`, etc.).
  - `sort`: Dynamic sort parameter supporting `price-asc` (Low to High), `price-desc` (High to Low), `rating-desc` (Top Rated), and `newest` (Newest).
- **Client flow**: Synchronizes URL parameters using Next.js `useSearchParams` and `useRouter`, debounces text inputs, shows active filter badges, and provides an instant reset button.

### 2. JWT Verification Middleware Flow
- **Implementation**: Located at `middlewares/auth.js` on the server (`verifyToken`, `optionalToken`, `requireRole`).
- **Middleware flow**:
  1. Inspects the incoming `Authorization` header for `Bearer <token>`.
  2. Cryptographically verifies the token using `jose` against the Better Auth JWKS endpoint (`/api/auth/jwks`) with a fallback to the symmetric secret (`BETTER_AUTH_SECRET`).
  3. Rejects invalid or expired tokens with `401 Unauthorized` and an informative error message.
  4. On successful verification, decodes the payload onto `req.user`.
  5. `requireRole(allowedRoles)` confirms the user's role matches required permissions and verifies account status is not `blocked`, rejecting violations with `403 Forbidden`.

### 3. Professional UI/UX & Responsive Layout
- **Visual styling**: Warm wood-fired palette (`#8E1616` crimson, `#FAF7F2` dough cream, `#190F0E` charred crust) paired with *Plus Jakarta Sans* geometric typography.
- **Responsive dashboard**: Left sidebar on desktop screens and a mobile-friendly slide-down drawer on mobile viewports.
- **Zero code comments**: All source files maintain clean code without unnecessary technical comments or parenthetical notes.

---

## Project structure

```text
pizzahub-client/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── menu/
│   │   │   ├── transactions/
│   │   │   └── users/
│   │   ├── api/
│   │   │   ├── auth/[...all]/
│   │   │   └── checkout_sessions/
│   │   ├── dashboard/
│   │   ├── menu/
│   │   │   ├── [id]/
│   │   │   └── page.tsx
│   │   ├── orders/
│   │   ├── payment/
│   │   │   ├── cancel/
│   │   │   └── success/
│   │   ├── profile/
│   │   ├── signin/
│   │   ├── signup/
│   │   ├── vendor/
│   │   │   ├── add-pizza/
│   │   │   ├── dashboard/
│   │   │   ├── menu/
│   │   │   ├── orders/
│   │   │   └── upgrade/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── DashboardLayout.tsx
│   │   ├── home/
│   │   │   ├── ArtisanChefSpecials.tsx
│   │   │   ├── CrustShowcase.tsx
│   │   │   ├── CustomerReviews.tsx
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   └── WhyChoosePizzaHub.tsx
│   │   ├── menu/
│   │   │   ├── CrustGuideModal.tsx
│   │   │   └── PizzaReviews.tsx
│   │   ├── orders/
│   │   │   └── OrderInvoiceModal.tsx
│   │   ├── shared/
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── PizzaCard.tsx
│   │   │   └── ToastProvider.tsx
│   │   └── ui/
│   ├── context/
│   │   └── CartContext.tsx
│   └── lib/
│       ├── api.ts
│       ├── auth.ts
│       └── auth-client.ts
├── public/
├── package.json
└── README.md
```

---

## Environment variables

Create a `.env` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_better_auth_secret_here
MONGODB_URL=your_mongodb_connection_string
DB_NAME=pizzahub
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
```

---

## Run it locally

1. **Clone this repository**:
   ```bash
   git clone https://github.com/Samiha-26/pizzahub-client.git
   cd pizzahub-client
   ```

2. **Install packages**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file using the variable names listed above.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.
