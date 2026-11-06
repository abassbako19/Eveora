# Eveora

A fresh Next.js application foundation for Eveora.

## Stack

- Next.js App Router + TypeScript (Node.js runtime)
- Tailwind CSS
- Supabase Auth and PostgreSQL
- Render deployment

There is no legacy HTML application and no custom SMTP integration in this project.
Payments are deliberately disabled.

## 1. Requirements

- Node.js 20+
- npm
- A Supabase project

## 2. Configure Supabase

1. Open your existing Supabase project.
2. Copy the Project URL and the public publishable/anon key.
3. Copy `.env.example` to `.env.local`.
4. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
5. In Supabase Authentication URL Configuration, set the local Site URL to `http://localhost:3000` during local development.
6. Add `http://localhost:3000/auth/callback` to the allowed redirect URLs.
7. Do not run a new schema migration for profiles. The existing project already has the `profiles` table, owner-scoped RLS policies, and the signup trigger. See `supabase/README.md`.

Do not put a service-role key in a `NEXT_PUBLIC_` variable. Never commit secrets.

## 3. Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

For a production build:

```bash
npm run build
npm start
```

## 4. Deploy on Render

Create a new **Web Service** from the Eveora Git repository.

- Instance plan: Free (may spin down after inactivity)
- Runtime: Node
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check path: `/api/health`
- Node version: 20 or newer

Add these Render environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

After deployment, update Supabase Authentication URL Configuration:

- Site URL: your Render URL
- Redirect URL: `https://YOUR-RENDER-SERVICE.onrender.com/auth/callback`

## Important notes

- Supabase's built-in email sender has restrictive limits. This project intentionally does not configure custom SMTP. Email confirmation delivery may therefore be limited until a mail provider is configured later.
- This starter does not implement payment processing, donations checkout, withdrawals, admin powers, or impact-point/credits rules.
- Do not disable email confirmation just to make signup appear to work.
- Do not run schema changes against a production database without reviewing them and taking a backup.
- Keep Row Level Security enabled and add policies for every new user-facing table.
\n\n## Current release scope\n\nThis is a foundation release. Profile management, support-request workflows, donations, credits, Impact Points, moderation/admin tools, and payment processing still require separate implementation and testing. Do not advertise those as active features yet.\n