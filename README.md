# Tarun / Visual Works

A visual portfolio and archive built with Next.js App Router, React, TypeScript, Tailwind CSS, Supabase, and Cloudinary. The project includes a public gallery and viewer, plus an authenticated admin area for managing work and categories.

## Features

- Responsive masonry gallery with category filters and video previews.
- Shareable work detail routes and modal navigation.
- Supabase-backed published work, category, and admin data access.
- Admin sign-in, work metadata editing, publishing, and category management.
- Signed Cloudinary image/video uploads with media metadata saved in Supabase.

Configure Supabase and Cloudinary before using the admin and upload features with live data.

## Requirements

- Node.js 20 or later
- Supabase project
- Cloudinary account

## Local setup

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Set the values in `.env.local` before using database-backed routes:

For a UI-only local run without a reachable Supabase project, set `USE_MOCK_DATA=true`. This fallback is restricted to development and only affects public gallery/viewer data; admin functions still require Supabase.

| Variable | Use |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key |
| `SUPABASE_SECRET_KEY` | Preferred server-only key for one-time admin creation |
| `SUPABASE_SERVICE_ROLE_KEY` | Legacy server-only key; fallback for admin creation |
| `ADMIN_SETUP_TOKEN` | Private one-time token required at `/admin/register` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Server-only Cloudinary signing secret |
| `NEXT_PUBLIC_SITE_URL` | Canonical site origin used by SEO routes |
| `USE_MOCK_DATA` | Use bundled sample gallery data in development (`true` or `false`) |

Never commit `.env.local` or production secrets.

## Supabase setup

1. Create a Supabase project and apply migrations `0001_initial_schema.sql` and `0002_admin_role_policies.sql`.
2. Add the project URL, publishable/anon key, and secret key (or legacy service-role key) to `.env.local`.
3. Generate a long random token (for example, `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) and set it as `ADMIN_SETUP_TOKEN` in `.env.local`.
4. Start the app, open `/admin/register`, and create the first admin account using that token.
5. Remove `ADMIN_SETUP_TOKEN` from `.env.local` after registration. Never expose either server-only key in client code or commit it.

The migration limits write access and draft visibility to tokens carrying the server-managed `app_metadata.role = admin` claim. Registration creates one admin and blocks further registrations after an admin exists. Keep both setup credentials server-only; the registration form signs the new admin in automatically.

## Commands

```bash
npm run dev
npm run build
npm run typecheck
```

## Known limitations

- Admins can upload images and videos directly to Cloudinary and save their metadata in Supabase. Configure the Cloudinary environment variables above; media removal, reordering, and alt-text editing are still pending.
- The sitemap still reads mock works, so live published projects are not represented yet.
- The exact authorization and database setup should be reviewed in the target Supabase project before deployment.
