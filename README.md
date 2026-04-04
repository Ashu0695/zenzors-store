# Zenzors Store 🛍️

Premium SaaS eCommerce storefront built with Next.js 14, Supabase & Razorpay.

## Tech Stack
| Layer       | Tech                          |
|-------------|-------------------------------|
| Framework   | Next.js 14 (App Router)       |
| Styling     | Tailwind CSS                  |
| Animations  | Framer Motion                 |
| Database    | Supabase (PostgreSQL)         |
| Auth        | Supabase Auth                 |
| Storage     | Supabase Storage              |
| Payments    | Razorpay                      |
| State       | Zustand                       |
| Deployment  | Hostinger VPS / Vercel        |

## Setup

### 1. Clone & Install
```bash
cd zensors-store
npm install
```

### 2. Supabase Setup
1. Go to [supabase.com](https://supabase.com) → New Project
2. SQL Editor → paste `lib/schema.sql` → Run
3. Storage → New bucket → `product-images` (public)
4. Copy your Project URL and anon key

### 3. Razorpay Setup
1. Go to [razorpay.com](https://razorpay.com) → Sign up
2. Settings → API Keys → Generate Test Keys
3. Copy Key ID and Key Secret

### 4. Environment Variables
```bash
cp .env.local.example .env.local
```
Fill in all values in `.env.local`

### 5. Run
```bash
npm run dev        # http://localhost:3000
npm run build      # Production build
npm start          # Production server
```

## Pages
| Route                  | Description              |
|------------------------|--------------------------|
| `/`                    | Homepage with hero       |
| `/products`            | Product listing + filter |
| `/products/[slug]`     | Product detail + reviews |
| `/cart`                | Cart sidebar (global)    |
| `/checkout`            | Checkout + Razorpay      |
| `/account`             | Orders + Profile         |
| `/wishlist`            | Saved products           |
| `/search`              | Search results           |
| `/auth`                | Login / Register         |

## Features
- ✅ Hero with parallax scroll animation
- ✅ Category grid with hover effects
- ✅ Product cards with add-to-cart
- ✅ Cart sidebar with Framer Motion
- ✅ Full checkout with Razorpay
- ✅ Coupon code system
- ✅ User auth (login/register)
- ✅ Order history
- ✅ Wishlist (persisted)
- ✅ Product search + filters
- ✅ Product reviews
- ✅ Responsive mobile design
- ✅ SEO meta tags

## Deploy on Hostinger
1. Build: `npm run build`
2. Upload `.next/`, `public/`, `package.json`, `next.config.js` to Hostinger
3. Set environment variables in Hostinger dashboard
4. Start: `npm start`
