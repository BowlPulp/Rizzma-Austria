# Rizzma Austria

A full-stack restaurant ordering application for Rizzma Austria. Customers can browse a
bilingual (English / German) menu, add items to a cart, and check out securely with Stripe;
staff manage the menu and fulfil orders through an admin dashboard.

The repository is a monorepo with two independent applications:

| Directory  | Stack | Description |
|------------|-------|-------------|
| `client/`  | Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 | Customer-facing storefront and admin dashboard |
| `backend/` | Express · TypeScript · MongoDB · Supabase · Stripe | REST API, authentication, payments, and webhooks |

## Features

- Bilingual storefront (English and German) powered by `next-intl`, with light/dark theming.
- Menu browsing by category, search, and a restaurant gallery.
- Cart with geolocation-based delivery prompt and Stripe-hosted checkout.
- Customer accounts backed by Supabase authentication, with order history.
- Admin dashboard for managing menu items, categories, orders, and viewing sales stats.
- Stripe webhooks that confirm payments and advance order status.

## Tech stack

**Frontend (`client/`)**
- Next.js 16 (App Router) and React 19
- TypeScript, Tailwind CSS v4, `next-themes`, `lucide-react`
- `next-intl` for internationalized routing (`/en`, `/de`)
- Supabase JS client for auth

**Backend (`backend/`)**
- Node.js + Express 4 with TypeScript
- MongoDB via Mongoose (menu, categories, orders, users)
- Supabase for authentication; JWTs verified with `jose`
- Stripe for checkout sessions and webhook-driven payment confirmation
- `helmet`, `cors`, and `morgan` for security and logging

## Prerequisites

- Node.js 18+ and npm
- A MongoDB database (connection URI)
- A Supabase project (URL, service role key, JWT secret / anon key)
- A Stripe account (secret key, publishable key, webhook secret)

## Getting started

Clone the repository, then set up each application. The two run as separate processes —
the client on port `3000` and the backend on port `5000` by default.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in the values described below
npm run seed           # optional: seed categories and menu items
npm run dev            # starts the API on http://localhost:5000
```

Backend environment variables (`backend/.env`):

```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGODB_URI=<your MongoDB connection string>
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_JWT_SECRET=<your Supabase JWT secret>
SUPABASE_SERVICE_ROLE_KEY=<your Supabase service role key>
STRIPE_SECRET_KEY=<your Stripe secret key>
STRIPE_WEBHOOK_SECRET=<your Stripe webhook signing secret>
```

Backend scripts:

- `npm run dev` — start in watch mode (`nodemon` + `tsx`)
- `npm run build` — compile TypeScript to `dist/`
- `npm run start` — run the compiled server
- `npm run seed` — populate the database with initial data

### 2. Client

```bash
cd client
npm install
cp .env.example .env.local   # then fill in the values described below
npm run dev                  # starts the app on http://localhost:3000
```

Client environment variables (`client/.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your Supabase anon key>
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your Stripe publishable key>
```

Client scripts:

- `npm run dev` — start the Next.js dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint

## Project structure

```
Rizzma Austria/
├── backend/
│   └── src/
│       ├── app.ts            # Express app setup (webhooks mounted before JSON parsing)
│       ├── server.ts         # Server entry point
│       ├── config/           # database, supabase, and stripe clients
│       ├── middleware/        # auth, admin, and error handling
│       ├── models/           # Mongoose models: Category, MenuItem, Order, User
│       ├── routes/           # auth, menu, categories, checkout, orders, admin, webhooks
│       └── utils/            # order-number generation, database seeding
└── client/
    ├── app/
    │   ├── [locale]/         # localized pages: home, menu, checkout, orders, admin, auth…
    │   ├── components/       # UI components grouped by feature
    │   └── providers/        # Auth, Cart, MenuCatalog, and Theme context providers
    ├── i18n/                 # next-intl routing (locales: en, de)
    ├── lib/                  # API client, Supabase, formatting, and data helpers
    └── messages/             # en.json, de.json translation files
```

## API overview

All routes are prefixed with `/api`. A health check is available at `GET /api/health`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST   | `/auth/sync` | user | Sync the authenticated Supabase user into the database |
| GET    | `/auth/profile` | user | Get the current user's profile |
| PATCH  | `/auth/profile` | user | Update the current user's profile |
| GET    | `/menu` | public | List menu items |
| GET    | `/menu/:slug` | public | Get a single menu item by slug |
| GET    | `/categories` | public | List categories |
| POST   | `/checkout` | user | Create a Stripe checkout session |
| GET    | `/orders` | user | List the current user's orders |
| GET    | `/orders/:id` | user | Get a single order |
| PATCH  | `/orders/:id/cancel` | user | Cancel an order |
| GET    | `/admin/orders` | admin | List all orders |
| PATCH  | `/admin/orders/:id/status` | admin | Update an order's status |
| GET    | `/admin/stats` | admin | Sales and order statistics |
| POST · PATCH · DELETE | `/admin/menu`, `/admin/menu/:id` | admin | Manage menu items |
| POST · DELETE | `/admin/categories`, `/admin/categories/:id` | admin | Manage categories |
| POST   | `/webhooks` | Stripe | Stripe webhook receiver (raw body, verified by signature) |

> **Note:** The Stripe webhook route is mounted before the JSON body parser so Stripe's
> raw request body can be verified against the webhook signature.

## Notes for contributors

- The client targets **Next.js 16**, which introduces breaking changes versus earlier
  versions. See `client/AGENTS.md` — consult the guides under
  `node_modules/next/dist/docs/` before changing framework-level code.
- Keep secrets out of version control: `.env` files are git-ignored; only the
  `.env.example` templates are committed.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
