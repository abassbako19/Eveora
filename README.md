# Eveora — v1.4 community platform build

Eveora is a Next.js 15 + TypeScript + Tailwind application using Supabase Auth/Postgres/Storage and Render hosting. This project preserves the existing Supabase `profiles` table, signup trigger, RLS configuration and existing Render services.

## Included in this build

- Responsive homepage with Donate, Request Assistance, campaigns and account entry points.
- Email/password authentication, email callback, password recovery and OAuth button wiring (Google, LinkedIn OIDC, X/Twitter; provider credentials must be configured in Supabase).
- Eveora Assistant server route (requires a server-only OpenAI key).
- Paystack NGN donation checkout, restricted to Paystack **test mode**, with server-side initialization, callback verification and signed webhook handling.
- Public campaign directory and campaign detail pages; admin campaign creation and draft/active/paused/completed lifecycle. Campaign-specific donations are recorded against the selected campaign. Public raised totals are not displayed until a privacy-safe aggregate is implemented.
- Assistance request submission and private supporting document uploads (up to 3 PDF/JPG/PNG files, maximum 5 MB each). Downloads use short-lived signed URLs after ownership/admin authorization.
- Dashboard with donation history, printable donor receipts, assistance request/document history and Impact Points.
- Admin centre for campaign management, assistance review, donation monitoring and disabled-draft Impact Points rule configuration.
- Animated responsive homepage with hero entrance, floating rewards motif, staggered feature cards, hover transitions and reduced-motion support.
- Eveora Credits wallet with an append-only ledger, idempotent 10-Credit verified donation rewards, UTC weekly login streaks and temporary Premium redemptions (100 Credits/7 days; 250 Credits/30 days).
- Dashboard statistics for verified donation count and total verified donated amount, plus Credits activity and streak status.

## What is deliberately not active

- Live Paystack collection, payouts/withdrawals and automated aid disbursement.
- Automated eligibility decisions, beneficiary verification or automatic matching.
- Credits have no cash value, cannot be transferred or withdrawn, and do not affect assistance decisions, verification or trust/fraud ratings. The configured rewards are 10 Credits for each Paystack-verified donation; weekly login streak rewards start at 5 Credits and add a streak bonus (10/15/20) from weeks 2/3/4 onward; Premium redemptions cost 100 Credits for 7 days or 250 Credits for 30 days. Weekly streaks use UTC calendar weeks.
- Automatic Impact Points awards. The non-cash ledger and balance display are in place. Administrators may draft proposed rules, but all drafts remain disabled; the exact positive actions, verification requirements, values, caps and reversals must be confirmed before an award workflow is activated. Points cannot be bought, transferred, cashed out, used to purchase identity verification or alter trust/fraud decisions.

## 1. Local setup

Requirements: Node.js 20+ and npm.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Keep your local `.env` / `.env.local` private and gitignored. Never commit secret keys or paste them into chat. Use Render Environment Variables for production secrets.

## 2. Existing Supabase project setup

Use the existing Eveora Supabase project. Do not create another project or modify the existing `profiles` table, signup trigger or its policies.

In Supabase SQL Editor, review and apply these additive migrations in this order, after taking a database backup:

1. `supabase/migrations/20261106_eveora_support_payments.sql`
2. `supabase/migrations/20261106_eveora_campaigns_documents_receipts_points.sql`
3. `supabase/migrations/20261106_eveora_credits_rewards.sql`

The first migration adds donations and assistance requests. The second adds campaigns, receipt fields, private assistance-document metadata/storage and the Impact Points ledger. The third adds the Credits ledger, weekly streak records, Premium entitlements and secure server-only reward functions. These migrations do not change the existing `profiles` table. Keep RLS enabled. The service-role key is used only in server routes and must never be exposed in a `NEXT_PUBLIC_` variable.

## 3. Render environment variables

Set these on the Eveora Render service (never commit actual values):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL=https://eveora.onrender.com`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `PAYSTACK_MODE=test`
- `PAYSTACK_SECRET_KEY` (Paystack **test** secret beginning `sk_test_`)
- `ADMIN_EMAILS` (comma-separated admin sign-in email addresses)
- `OPENAI_API_KEY` (server-only, if enabling the AI assistant)
- `OPENAI_MODEL` (optional)

Set the Paystack Test Mode webhook URL to:

`https://eveora.onrender.com/api/payments/webhook`

Do not use Paystack live keys. The server rejects payment initialization unless the configured key is a test key and `PAYSTACK_MODE=test`. Do not enable live collection until provider approval, legal/compliance review, refund/dispute processes and operational controls are complete.

## 4. Admin workflow

Only users whose sign-in email is listed in `ADMIN_EMAILS` can access `/admin` and its server-side admin APIs. Create campaigns as drafts, review their wording and target, then explicitly set them to Active. Pause or complete campaigns when appropriate. Review assistance applications and supporting files. Award Impact Points only for documented and reviewed activities.

## 5. Paystack test checklist

1. Apply all three Supabase migrations and configure the Render test environment variables.
2. Sign in and submit a test donation of at least ₦100.
3. Use Paystack's official test card details from its documentation; never use a real card for this test.
4. Confirm the callback verifies the transaction server-side and the donation changes to `paid` only after verification.
5. Open the donation receipt from the verification page or dashboard and use **Print / Save as PDF**.
6. Test a failed/cancelled transaction and confirm it is not marked paid.
7. Create a campaign as an admin, activate it, then make a campaign-linked test donation and confirm its verified total updates.
8. Submit an assistance request with supported documents. Confirm the owner and an allowlisted admin can download them, while another user cannot.
9. Confirm a normal user cannot access `/admin`, change campaign state or award points.

## 6. Build and deployment

```bash
npm install
npm run build
npm start
```

Render settings:

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check: `/api/health`
- Node: 20+

Do not deploy until dependencies install and `npm run build` succeeds. Applying migrations and configuring Render variables are separate setup steps; this ZIP does not make changes to your live Supabase or Render services.
