# The Hooker Lab

Marketing site with an admin panel. Next.js 16, Tailwind 4, Drizzle ORM on Neon Postgres, Resend for email.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill it in (see the comments in the file).
3. `npm run db:migrate` applies the migrations in `drizzle/`.
4. `npm run db:seed` creates the site settings, section copy, the first admin (from `ADMIN_EMAIL` / `ADMIN_PASSWORD`) and the initial content. It is safe to run again.
5. `npm run dev` and open http://localhost:3000. The admin is at http://localhost:3000/admin.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm test` | vitest unit tests |
| `npm run db:generate` | generate a migration after editing `src/lib/db/schema.ts` |
| `npm run db:migrate` | apply migrations |
| `npm run db:seed` | idempotent seed |
| `npm run db:studio` | Drizzle Studio |

## How content flows

Public pages read through cached functions in `src/lib/content/queries.ts`, tagged per content type. Admin server actions in `src/lib/admin/actions/` write to Postgres and call `updateTag`, so edits appear on the site immediately. If the database is unreachable in production, the public site falls back to the static content in `src/data/`.

The contact form posts to `/api/enquiry` and the online programme dialog posts to `/api/online-registrations`. Both store the submission first and then email the notification address from Settings via Resend. If the email fails, the row is kept and the admin inbox shows an "email failed" badge with a resend button.

## Admin

- Sign in at `/admin/login` with the seeded account, then change the password under Account.
- Programmes, Expertise, Testimonials and FAQ: create, edit, reorder, publish or hide, delete.
- Section copy: eyebrow, headline and intro text for each section.
- Enquiries and Registrations: inboxes with new, read and archived states and private notes.
- Settings: contact email, notification email, email sender, currency and the global pricing switch.
- Images: every image field has an upload button. Files are saved under `public/uploads/` on the server (not committed to git). That folder is only persistent on a host with a real disk; on Vercel the files are lost on redeploy, so use a storage service there or paste an https:// URL instead.

## Pricing

A programme price shows on the site only when Settings → "Show programme prices" is on **and** the programme's own "Show price" switch is on **and** a price is set. Both switches are off by default.

## Deploying to Vercel

Set every variable from `.env.example` in the Vercel project. `DATABASE_URL` is needed at build time because content is prerendered. Run `npm run db:migrate` against production before deploying a schema change; the build does not run migrations. `RESEND_FROM` and the sender email in Settings must be on a domain verified in Resend.
