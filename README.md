# Learner Validator (Agritech, Year 3 Cohort 1)

Offline-first field tool: Google-authenticated staff validate the 9 enrollment
fields for each learner, working with zero connectivity, then submit a batch
that emails an Excel file to `merl@seghana.net`.

## What's already built
- 215 Agritech learners preloaded from `data/agritech-learners.json` (parsed
  from the PDF you shared). To validate a different hub next, replace this
  file with the same shape (see `Learner` type in `lib/constants.ts`) — the
  rest of the app is hub-agnostic (just also update `HUB` in `lib/constants.ts`).
- Google sign-in via NextAuth, with an optional email allow-list.
- Every validation is saved to IndexedDB on-device immediately — closing the
  app, losing signal, or a full restart won't lose progress.
- Submit sends immediately if online; if offline, it queues and auto-sends
  the moment the device reconnects (checked on every `online` browser event).
- Installable as a PWA so the app shell itself loads with no network.

## One-time setup

1. **Install dependencies** (needs network — not possible in this sandbox):
   ```
   npm install
   ```

2. **Google OAuth credentials**
   - Go to Google Cloud Console → APIs & Services → Credentials → Create OAuth
     Client ID → Web application.
   - Authorized redirect URI: `https://YOUR-DOMAIN/api/auth/callback/google`
     (and `http://localhost:3000/api/auth/callback/google` for local dev).
   - Copy the client ID/secret into `.env.local` (see `.env.example`).

3. **Email sending**
   - You need SMTP credentials that can send *as* `noreply@seghana.net`
     (e.g. a Google Workspace app password for that mailbox, or your
     transactional email provider's SMTP details).
   - Fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in `.env.local`.
   - If you'd rather use an API-based sender (Resend, Postmark, SendGrid API)
     instead of SMTP, swap the implementation in `app/api/submit/route.ts` —
     the rest of the app doesn't need to change.

4. **Allow-list**
   - Set `ALLOWED_EMAILS` to a comma-separated list of your field staff's
     personal Gmail addresses. Leave blank while testing to allow anyone in.

5. **Icons**
   - Add `public/icon-192.png` and `public/icon-512.png` (any square PNG) so
     the PWA install prompt has artwork. The app works without them.

## Local development
```
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

## Deploy to Vercel
```
vercel
```
Then set the same environment variables in the Vercel project settings
(Settings → Environment Variables) and redeploy. Set `NEXTAUTH_URL` to your
production URL.

## How field staff use it
1. Open the app **once while online** so it caches and the learner list loads
   into IndexedDB, then sign in with Google.
2. Go validate learners anywhere — flights, farms, no signal needed. Each of
   the 9 fields can be confirmed as-is or edited.
3. Tap **Submit validated learners** whenever convenient. If offline, it's
   queued silently and sent automatically once back on network — no need to
   remember to retry.

## Notes / things to decide before real rollout
- The allow-list is a single env var today; if the field team is large, a
  proper user table would scale better long-term.
- One workbook per submission batch (not per learner) keeps MERL's inbox
  manageable — a learner is only included in a batch once, then marked
  "Submitted" and excluded from the next batch.
- Currently ships with the Agritech list baked in. Swapping hubs means
  swapping the JSON file for now; adding an in-app CSV/Excel importer for
  new hubs is a natural next step once this version is validated with users.
