# PROJECT_REPORT.md

## Current status

The Next.js application has an implemented public gallery and work viewer, Supabase-backed data access, an admin login and protected admin routes, work/category management actions, and a Cloudinary signature helper. Live service credentials and a deployed Supabase project are not included in the repository.

## Known limitations

- Cloudinary upload signing is admin-gated, but there is no upload interface or media-row persistence in the work form.
- `app/sitemap.ts` still reads the mock work dataset rather than live published work.
- Apply Supabase migrations `0001` and `0002`; set the owner's server-managed Supabase `app_metadata.role` to `admin` before using admin routes. The role is checked both in the app and in RLS policies.
- Configure `.env.local` from `.env.example` for local use. Never commit real secrets.

## Security notes

`0002_admin_role_policies.sql` tightens previously broad authenticated write policies for work, media, and categories. It also adds admin visibility for drafts. `lib/cloudinary/sign.ts` now requires the same admin claim and fixes the upload folder rather than accepting caller-controlled folder names.

## Suggested next improvements

1. Wire signed Cloudinary uploads into the work form, including type/size validation and persistence of media metadata.
2. Replace mock sitemap data with the published Supabase query.
3. Add validation for all server-action inputs, duplicate slug handling, and structured user-facing database errors.
4. Add tests and accessibility/performance audits before production deployment.
