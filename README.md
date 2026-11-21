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

1. **Advanced Search & Sorting**:
   - Filter by search keyword (`?search=`), category (`?category=`), crust style (`?crust=`), and sort by price ascending (`?sort=price-asc`), price descending (`?sort=price-desc`), or rating (`?sort=rating-desc`).
2. **Role-Based Route Protection**:
   - Dedicated dashboard layouts with role verification on both client and server. Manual URL switching between Customer, Vendor, and Admin portals is strictly prevented.
3. **Verified Webhook Payment Flow**:
   - Vendor upgrades transition to Premium only upon verified Stripe webhook event confirmation, triggering gold crown status and unlimited slots.

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
