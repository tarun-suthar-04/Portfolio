# Tarun / Visual Works

A visual portfolio and archive built with Next.js App Router, React, TypeScript, Tailwind CSS, Supabase, and Cloudinary. The project includes a public gallery and viewer, plus an authenticated admin area for managing work and categories.

## Features

- Responsive masonry gallery with category filters and video previews.
- Shareable work detail routes and modal navigation.
- Supabase-backed published work, category, and admin data access.
- Admin sign-in, work metadata editing, publishing, and category management.
- Supabase Row Level Security and Cloudinary signed-upload helper.

Media uploads are not yet wired into the admin form. Configure the services below before running the app against live data.

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
| `SUPABASE_SERVICE_ROLE_KEY` | Reserved server-only key; do not expose to the browser |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Server-only Cloudinary signing secret |
| `NEXT_PUBLIC_SITE_URL` | Canonical site origin used by SEO routes |
| `USE_MOCK_DATA` | Use bundled sample gallery data in development (`true` or `false`) |

Never commit `.env.local` or production secrets.

## Supabase setup

1. Create a Supabase project and apply `supabase/migrations/0001_initial_schema.sql`.
2. Create the owner account in Supabase Auth.
3. Set that user's **app metadata** to `{ "role": "admin" }` using a trusted Supabase admin interface. Do not set this in user-editable metadata.
4. Add the project URL and publishable/anon key to `.env.local`.

The migration limits write access and draft visibility to tokens carrying the server-managed `app_metadata.role = admin` claim. Users may need to sign out and in again after changing app metadata to receive a refreshed token.

## Commands

```bash
npm run dev
npm run build
npm run typecheck
```

## Known limitations

- Cloudinary upload signing is implemented and admin-gated, but the upload UI and media-row persistence are not connected.
- The sitemap still reads mock works, so live published projects are not represented yet.
- The exact authorization and database setup should be reviewed in the target Supabase project before deployment.
