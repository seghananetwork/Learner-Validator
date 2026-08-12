# Learner Validator

Multi-hub, offline-first field tool. Coordinators upload each hub's learner
sheet once; enumerators sign in, pick their hub, and validate the 9
enrollment fields per learner — including with zero connectivity. Submitting
emails a validated Excel file to `merl@seghana.net` and writes the validated
values back into the shared database.

## What's new in this version
- **Real shared database** (Postgres) instead of a single bundled file, so
  every hub's data lives centrally and multiple enumerators can work the
  same hub over time without overwriting each other's uploads.
- **Hub picker** after login — all 18 hubs are built in (`lib/hubs.ts`).
- **Admin dashboard** (`/admin`) for coordinators to upload a filled-in
  spreadsheet per hub, and see validated/total counts per hub.
- **"Add a learner not on this list"** — enumerators can add a replacement
  learner in the field (e.g. swapping out an over-age learner), which syncs
  to the database and is included in their next submission.
- **SE Ghana logo** — drop `logo.png` into `public/` and it appears
  automatically (falls back to a text mark if missing).
- Bigger, higher-contrast buttons throughout.

## One-time setup

1. **Install dependencies**: `npm install`

2. **Create a Postgres database**
   - In your Vercel project: Storage tab → Create Database → Postgres →
     follow the prompts, then click "Connect" to link it to this project.
     Vercel automatically injects `POSTGRES_URL` etc. as environment
     variables — you don't need to copy them by hand for the deployed app.
   - **Run the schema once**: open the database's Query tab in Vercel and
     paste the contents of `sql/schema.sql`, then run it. This creates the
     `learners` table.
   - For local development, copy the `POSTGRES_URL` shown in Vercel's
     "Quickstart" / `.env.local` snippet into your own `.env.local`.

3. **Google OAuth, SMTP, allow-list** — same as before, see `.env.example`.
   New: **`ADMIN_EMAILS`** — comma-separated Gmail addresses that can reach
   `/admin` to upload learner sheets. Admins can always sign in even if not
   listed in `ALLOWED_EMAILS`.

4. **Logo** — save your SE Ghana logo as `public/logo.png` (any reasonable
   size, transparent background looks best). No code changes needed.

## Local development
```
npm install
cp .env.example .env.local   # fill in values, including POSTGRES_URL
npm run dev
```

## Deploy to Vercel
Push to GitHub, import into Vercel, add all environment variables (including
the Postgres ones once the database is connected), deploy. Set
`NEXTAUTH_URL` to your live domain and add the matching redirect URI in
Google Cloud Console (see earlier setup notes if you have them).

## How coordinators upload data
1. Sign in, tap the black "Go to admin dashboard" button.
2. Download the template, fill in one learner per row, save.
3. Pick the correct hub, choose the file, tap "Upload learners".
4. Repeat any time there's more data — uploads add to a hub, they don't
   replace what's already there. See `Learner-Validator-Guide.docx` for the
   full illustrated walkthrough to share with colleagues.

## How enumerators validate
1. Sign in while online, tap a hub to download its learner list.
2. Validate fields (works fully offline from here).
3. Use "Add a learner not on this list" for replacements.
4. Tap Submit — sends immediately if online, or queues and auto-sends once
   back online.

## Loading the Agritech data you already have
Your original 215-learner Agritech list (from the PDF) is preserved at
`data/agritech-learners.json` and pre-converted into `sql/seed_agritech.sql`.
After running `sql/schema.sql`, run `sql/seed_agritech.sql` the same way
(paste into Vercel's Postgres Query tab and run) to load those 215 learners
straight into the Agritech hub — no need to re-upload them through the admin
page.

## Notes
- Learner data model: each learner row keeps both the *original* uploaded
  values and the *validated* values, so nothing is silently overwritten.
- A learner is only ever included in one email submission — once validated
  and submitted, they're marked "Submitted" and excluded from future
  batches for that device.
- `Learner-Validator-Guide.docx` is a ready-to-share instructions document
  for both coordinators and enumerators.
