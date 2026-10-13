# Admin panel and database-backed content — design

Date: 2026-10-13
Status: draft for review

## 1. Goal

Make the marketing site's content editable from a protected admin panel, persisted in Postgres, without changing how the public site looks or feels. Contact enquiries and online-programme registrations are stored in the database, emailed to the site owner, and visible in the admin.

Editable from the admin:

- Programmes (the "Services" section): full CRUD, reorder, publish/hide, optional price.
- Expertise: pillars and their skills, full CRUD, reorder, publish/hide.
- Testimonials: full CRUD, reorder, publish/hide.
- FAQ: full CRUD, reorder, publish/hide.
- Section headings: eyebrow, headline and intro copy for each of the above sections and for Contact.
- Site settings: public contact email, enquiry notification email, email sender, global "show pricing" switch, currency.
- Admin account: name, email, password.
- Inboxes: enquiries and online registrations, with new/read/archived states and private notes.

Out of scope (decided during brainstorming): image uploads (image fields are URL/path text), auto-reply emails to the sender, multiple admin accounts, editing the contact form's field labels and option lists, editing Hero/Philosophy/About/legal pages.

## 2. Decisions

| Topic | Decision | Why |
| --- | --- | --- |
| ORM | Drizzle ORM with `drizzle-kit` migrations | Type-safe, light runtime, readable SQL migrations, good fit for serverless. |
| Database | Neon Postgres, pooled connection string in `DATABASE_URL` | Chosen by the owner. Works locally and on Vercel. |
| Driver | `pg` (node-postgres) via `drizzle-orm/node-postgres` | Works over TCP with Neon's pooler, supports transactions, same code locally and on Vercel. |
| Hosting | Vercel | Chosen by the owner. |
| Auth | Single admin, email + password, `bcryptjs` hash, `iron-session` encrypted cookie | No third-party auth service, no native build dependency, matches the Next 16 auth guide for Cache Components. |
| Validation | `zod` | Shared between server actions and route handlers. |
| Email | `resend` SDK | Chosen by the owner. |
| Images | Text fields for URL or `/images/...` path | Chosen by the owner. No upload code. |
| Caching | Next 16 Cache Components: `use cache` readers tagged per content type, `updateTag` after each admin write | Public pages stay prerendered and instant; edits appear immediately. |
| Tests | `vitest` for pure logic | Repo has no test setup today; keep it to validation, mapping and rules. |

## 3. Architecture

```
Public pages (server components)
  app/(site)/page.tsx, app/(site)/faq/page.tsx, app/(site)/layout.tsx
      |  await cached readers
      v
src/lib/content/queries.ts   'use cache' + cacheTag('content:*')
      |  Drizzle
      v
Postgres (Neon) <------------ src/lib/admin/actions/*  (server actions, 'use server')
      ^                              |  requireAdmin() -> zod -> write -> updateTag('content:*')
      |                              ^
app/api/enquiry, app/api/online-registrations   app/admin/** (pages + forms)
  (route handlers: validate -> insert -> email)       src/proxy.ts (cookie presence redirect)
```

Principles:

- One data access layer. All reads and writes go through `src/lib/db/*` and `src/lib/content/*`; components never import Drizzle.
- Public section components keep their markup and animation. They stop importing `src/data/*` and receive a typed `data` prop instead.
- `src/data/*.ts` files stay in the repo as the seed source and as the production fallback if the database is unreachable.
- Admin pages are always dynamic (never cached). Public readers are cached and invalidated by tag.

## 4. Data model

Drizzle schema in `src/lib/db/schema.ts`. All tables have `created_at` and `updated_at` timestamps unless noted. `sort_order` is an integer; lists are ordered by it ascending, then `id`.

### admin_users
`id` serial PK, `email` text unique (lowercased), `name` text, `password_hash` text. One row in practice; the schema does not forbid more.

### site_settings
Single row, `id` integer PK fixed at 1.
`contact_email` text (shown publicly, default `admin@thehookerlab.co.nz`), `notification_email` text (where enquiry and registration notifications go; defaults to contact_email), `from_email` text (Resend sender, must be on a verified domain), `from_name` text (default "The Hooker Lab"), `show_pricing` boolean default false, `currency` text default `NZD`.

### section_copy
`key` text PK, one of `programs`, `expertise`, `testimonials`, `faq`, `contact`, `online`.
`eyebrow` text, `headline` text (one visual line per newline), `headline_accent` text nullable (the red word, used by expertise and testimonials), `intro` text nullable, `cta_label` text nullable, `cta_href` text nullable, `hero_image` text nullable (FAQ page image).

Mapping to the component shapes used today lives in `src/lib/content/mappers.ts` and is unit tested:
- `programs`, `faq`, `contact`: `headline.split("\n")` becomes `string[]`.
- `expertise`, `testimonials`: `{ plain: headline, accent: headline_accent ?? "" }`.

### programs
`id` serial PK, `slug` text unique, `sort_order` int, `format` text (pill, e.g. "Online"), `title` text, `summary` text, `list_title` text, `points` text[], `image_src` text, `image_alt` text, `price` numeric(10,2) nullable, `price_note` text nullable (e.g. "per week", "from"), `show_price` boolean default false, `published` boolean default true.
The displayed number ("01", "02") is derived from the published position, not stored.

### expertise_pillars
`id` serial PK, `slug` text unique, `sort_order` int, `word` text, `summary` text, `image_src` text, `image_alt` text, `panel` boolean default true, `published` boolean default true.

### expertise_skills
`id` serial PK, `pillar_id` int FK to expertise_pillars (cascade delete), `sort_order` int, `name` text, `detail` text.

### testimonials
`id` serial PK, `sort_order` int, `name` text, `role` text, `org` text, `image_src` text, `quote` text, `published` boolean default true.

### faqs
`id` serial PK, `sort_order` int, `question` text, `answer` text, `published` boolean default true.

### enquiries
`id` serial PK, `enquiry_type`, `name`, `email`, `role`, `organisation`, `contact_method`, `phone`, `age_group`, `level`, `group_size`, `location`, `timing`, `message` (all text, optional ones nullable), `workshop_topics` text[], `consent_contact` boolean, `source_page` text, `submitted_at` timestamptz, `status` text default `new` (`new` | `read` | `archived`), `admin_notes` text nullable, `notified_at` timestamptz nullable (set when the notification email was accepted by Resend), `notify_error` text nullable.

### registrations
`id` serial PK, `role`, `level`, `experience` text, `focus_areas` text[], `goal` text nullable, `name`, `email` text, `phone` text nullable, `location` text, `privacy_accepted` boolean, `accepted_at` timestamptz, `status` text default `new`, `admin_notes` text nullable, `notified_at` timestamptz nullable, `notify_error` text nullable.

## 5. Public site data flow

### Readers (`src/lib/content/queries.ts`)
Each reader is an async function with `'use cache'`, `cacheLife('max')` and one or more `cacheTag` calls:

| Reader | Tags | Returns |
| --- | --- | --- |
| `getProgramsSection()` | `content:programs`, `content:sections`, `content:settings` | section copy + published programmes, each with a resolved `priceLabel` or `null` |
| `getExpertiseSection()` | `content:expertise`, `content:sections` | section copy + published pillars with ordered skills |
| `getTestimonialsSection()` | `content:testimonials`, `content:sections` | section copy + published testimonials |
| `getFaqSection()` | `content:faqs`, `content:sections` | section copy + published FAQs |
| `getContactSection()` | `content:sections`, `content:settings` | section copy + contact email |
| `getOnlineCopy()` | `content:sections` | the online section copy (register button label) |
| `getSiteSettings()` | `content:settings` | public-safe settings (contact email only) |

Because the readers are cached, the database is read at build time and after each invalidation, not on every request. `DATABASE_URL` must therefore be present at build time on Vercel.

### Production fallback
In production, if a reader's query throws, it logs the error and returns the equivalent static content from `src/data/*` mapped through the same mappers. In development the error propagates so problems are visible. This is implemented once in a `withFallback(reader, fallback)` helper, not per reader.

### Pricing rule (`src/lib/content/pricing.ts`, unit tested)
A programme shows a price on the public site only when all three hold: `settings.show_pricing` is true, `program.show_price` is true, and `program.price` is not null. The label is formatted with `Intl.NumberFormat` in the settings currency, followed by `price_note` when present. When hidden, the card renders exactly as today.

### Component changes
- `Services`, `Expertise`, `Testimonials`, `FAQ`, `Contact` get a required `data` prop typed from `src/lib/content/types.ts`. Their internal `typeof` types move to that file. JSON-LD blocks inside them use the prop.
- `Services` renders the price line under the summary when `priceLabel` is present.
- `app/(site)/page.tsx` and `app/(site)/faq/page.tsx` become async server components that await the readers and pass data down. FAQ page JSON-LD uses the loaded items.
- `app/(site)/layout.tsx` awaits `getSiteSettings()` and passes `contactEmail` to `Navbar` and `Footer`; the Organization JSON-LD uses it. The static `contact.email` in `src/data/nav.ts` is removed.
- `RegistrationDialog` is mounted on the home page behind a secondary button in the Services section footer ("Register for the online programme"), next to the existing "Get in touch" CTA. The label comes from `section_copy.online.cta_label`. Assumption: this placement is the owner's call and can move during review.
- `next.config.ts` `images.remotePatterns` allows any `https` host, because the admin can paste image URLs.

## 6. Auth

- `src/lib/auth/session.ts`: `iron-session` with cookie `thl_admin`, `httpOnly`, `sameSite: lax`, `secure` in production, 7-day TTL, password from `SESSION_SECRET` (min 32 chars). Session payload is `{ userId }`.
- `src/lib/auth/dal.ts`: `getCurrentAdmin()` reads the session and loads the user; `requireAdmin()` redirects to `/admin/login` when missing. Every admin page and every server action calls `requireAdmin()` first. Route handlers for the public forms do not.
- `src/proxy.ts`: for paths under `/admin` except `/admin/login`, redirect to `/admin/login` when the session cookie is absent. This is the optimistic check only; authorisation is `requireAdmin()`.
- Login: `/admin/login` form posts to a `login` server action, which looks up the user by lowercased email, runs `bcrypt.compare`, sets the session, and redirects to `/admin`. Wrong credentials return one generic message. A failed attempt waits 500 ms before responding to blunt brute force; there is no account lockout.
- Logout: server action that destroys the session.
- First admin: the seed script creates it from `ADMIN_EMAIL` and `ADMIN_PASSWORD` when `admin_users` is empty. The admin changes these from `/admin/account` afterwards.

## 7. Admin panel

Routes live under `app/admin/` with their own `layout.tsx` (no public Navbar or Footer). To keep the public chrome off admin pages, the public routes move into a `(site)` route group with its own layout that renders `Navbar`, `Footer` and the Organization JSON-LD; `app/layout.tsx` keeps only html, body, fonts and metadata. Public URLs are unchanged.

| Route | Purpose |
| --- | --- |
| `/admin/login` | Login form. |
| `/admin` | Dashboard: counts of new enquiries and registrations, last five of each, links to every section. |
| `/admin/programmes`, `/new`, `/[id]` | List with reorder and publish toggles; create and edit forms. |
| `/admin/expertise`, `/[id]` | Pillar list; the pillar edit page also edits its skills inline (add, edit, remove, reorder). |
| `/admin/testimonials`, `/new`, `/[id]` | List and forms. |
| `/admin/faq`, `/new`, `/[id]` | List and forms. |
| `/admin/sections` | One form per section key (tabs): eyebrow, headline, accent, intro, CTA, hero image. |
| `/admin/enquiries`, `/[id]` | Inbox filtered by status; detail view with status buttons, notes, and a "notification failed" badge with a resend button when `notify_error` is set. |
| `/admin/registrations`, `/[id]` | Same shape as enquiries. |
| `/admin/settings` | Site settings form, including the global pricing switch. |
| `/admin/account` | Name and email; a separate password change form that requires the current password. |

UI conventions:

- Server components for pages; small client components only for forms (`useActionState`), toggles and reorder buttons. The admin layout wraps its content in `<Suspense>` because the session read happens at request time.
- Reorder uses up/down buttons that call a `move(id, direction)` action which swaps `sort_order` with the neighbour inside a transaction. No drag-and-drop library.
- Delete asks for confirmation in a client dialog, then calls the action.
- Forms post to server actions, which return `{ ok: true } | { ok: false, errors: Record<string,string>, message?: string }`. Field errors render under the field, the message in a banner. Success redirects to the list with a `?saved=1` flag that shows a dismissible toast.
- List editors (programme points) are a client component that manages an array of inputs and submits them as repeated form fields.
- Styling reuses the existing tokens (`ink`, `coal`, `steel`, `line`, `bone`, `mist`, `accent`) and fonts. Layout: left sidebar on desktop, top bar with a drawer on mobile. No new UI library. Shared primitives live in `src/components/admin/` (`Shell`, `PageHeader`, `Field`, `Input`, `Textarea`, `Toggle`, `Select`, `ListEditor`, `SubmitButton`, `ConfirmDialog`, `Toast`, `StatusBadge`).

## 8. Server actions (`src/lib/admin/actions/`)

One file per content type (`programs.ts`, `expertise.ts`, `testimonials.ts`, `faqs.ts`, `sections.ts`, `settings.ts`, `account.ts`, `inbox.ts`, `auth.ts`). Each action:

1. `await requireAdmin()`.
2. Parse the `FormData` with the zod schema from `src/lib/admin/schemas.ts`. Return field errors on failure.
3. Write with Drizzle (a transaction where more than one row changes).
4. `updateTag(...)` for every tag the change affects.
5. Redirect or return `{ ok: true }`.

Slugs for programmes and pillars are generated from the title on create (`slugify`, unit tested) and made unique with a numeric suffix; they are editable afterwards.

Inbox actions: `setStatus(id, status)`, `saveNotes(id, notes)`, `resendNotification(id)`.

## 9. Public form endpoints and email

### `POST /api/enquiry`
1. Reject non-JSON bodies and bodies over 32 KB.
2. If the honeypot field `website` is non-empty, respond 200 without saving.
3. Validate with a zod schema that mirrors the `validateEnquiry` rules (shared constants for lengths and the email pattern).
4. Insert the row.
5. Send the notification email; on success set `notified_at`, on failure store `notify_error`. The response is 201 either way, because the enquiry is safely stored.

### `POST /api/online-registrations`
Same steps with the registration schema. `RegistrationDialog` already posts to this path.

### Email (`src/lib/email/`)
- `resend.ts` creates the client from `RESEND_API_KEY`. When the key is missing in development, emails are logged to the console instead of sent, and the row gets `notify_error = "RESEND_API_KEY not set"`.
- `templates.ts` builds subject, HTML and plain-text bodies for `enquiryNotification` and `registrationNotification` from the row only (pure functions, unit tested, user input HTML-escaped). Sender is `from_name <from_email>` from site settings; recipient is `notification_email`; `reply_to` is the submitter's email.

## 10. Configuration and scripts

`.env.example` (committed) lists: `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `RESEND_API_KEY`, `RESEND_FROM`, `NEXT_PUBLIC_SITE_URL`. `.env.local` holds real values and is gitignored.

`package.json` scripts: `db:generate` (drizzle-kit generate), `db:migrate` (drizzle-kit migrate), `db:seed` (`tsx scripts/seed.ts`), `db:studio`, `test` (vitest run), `test:watch`.

`scripts/seed.ts` is idempotent: it creates the settings row, the section copy rows, the admin user, and inserts the static content only into tables that are empty. Running it twice changes nothing.

Migrations are run manually or from CI before a deploy (`npm run db:migrate`). The build does not run migrations.

New dependencies: `drizzle-orm`, `pg`, `zod`, `iron-session`, `bcryptjs`, `resend`. Dev: `drizzle-kit`, `@types/pg`, `@types/bcryptjs`, `tsx`, `vitest`, `dotenv`.

## 11. Error handling

- Public pages: production fallback to static content (section 5). Admin pages: a Next `error.tsx` under `/admin` with a retry button.
- Server actions never throw validation errors to the client; they return the error state. Unexpected errors are logged and surface as a generic banner.
- Route handlers return 400 with field errors for invalid input, 201 on success, and 500 only when the insert itself fails.
- Email failures never fail a save; they are recorded on the row and visible in the admin.

## 12. Testing

`vitest` with `src/**/*.test.ts`:

- zod schemas: valid payloads pass; each required field and each limit produces the expected error key.
- `pricing.ts`: the three-condition visibility rule and label formatting.
- `mappers.ts`: section copy to component shapes, programme number derivation, unpublished filtering.
- `slugify` and the unique-suffix logic.
- Email templates: subject and body include the key fields; user input is escaped.
- Reorder swap logic as a pure function on an ordered array.

Manual verification checklist, run before calling the work done: seed, log in, edit each content type and see it on the public page, hide pricing globally and per programme, submit the contact form and the registration dialog and see both rows and emails, log out and confirm `/admin` redirects.

## 13. Implementation order

1. Foundations: dependencies, Drizzle config, schema, first migration, seed script, `.env.example`, vitest.
2. Content readers, mappers, pricing rule, and the public page refactor to props. The site renders from the database with no visible change.
3. Auth: session, DAL, proxy, login and logout, admin layout and shell, the `(site)` route group move.
4. Admin CRUD: programmes, expertise, testimonials, FAQ, sections, settings, account.
5. Inboxes and email: route handlers, Resend, enquiry and registration screens, dialog wiring.
