# Cafe Paix User App

Customer-facing web app for Cafe Paix, built with Next.js and Supabase.  
Users can browse the menu, customize items, place orders, and track live order status.

## Features

- Browse categorized menu with images and pricing
- Product customization (options and addons)
- Cart management with Zustand
- Checkout flow and order placement
- Live order tracking via Supabase Realtime
- Order number format support: `CP-DDMMYY-###` (example: `CP-260520-005`)

## Tech Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Framer Motion
- Zustand
- TanStack Query
- Supabase (Postgres + Realtime)

## Project Structure

```text
src/
  app/
    page.tsx              # Landing page
    menu/page.tsx         # Menu UI
    checkout/page.tsx     # Checkout + order placement
    status/page.tsx       # Live order tracking
    api/menu/route.ts     # Menu API route
  components/             # Reusable UI and feature components
  hooks/                  # Data/realtime hooks
  lib/                    # Supabase client, data access, types
  store/                  # Zustand cart store
supabase_setup.sql        # Full database schema + seed + triggers
```

## Prerequisites

- Node.js 18+ (recommended: latest LTS)
- npm
- Supabase project

## Environment Variables

Create a `.env` file in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure env variables in `.env`.
3. Open Supabase SQL Editor and run:
   - `supabase_setup.sql`
4. Start development server:
   ```bash
   npm run dev
   ```
5. Open:
   - `http://localhost:3000`

## Available Scripts

- `npm run dev` — Start local development server
- `npm run build` — Build for production
- `npm run start` — Run production build
- `npm run lint` — Run lint checks

## Order Number Format

The database trigger generates order numbers in this format:

`CP-DDMMYY-###`

Example: `CP-260520-005`

If your Supabase project was set up before this format change, re-run the `generate_order_number()` function from `supabase_setup.sql` so new orders follow `DDMMYY`.

## Notes

- Status page displays `order_number` first, with fallback to UUID if missing.
- Menu data is fetched from `/api/menu` and updated in real time using Supabase channels.
