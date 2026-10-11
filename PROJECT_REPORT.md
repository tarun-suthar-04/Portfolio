# PROJECT_REPORT.md

## Current status

The Next.js application has an implemented public gallery and work viewer, Supabase-backed data access, protected admin routes, a one-time first-admin registration flow, and work/category management actions. The admin work form now supports signed Cloudinary image/video uploads and saves media metadata to Supabase. Service credentials are configured locally and are not included in the repository.

## Known limitations

- Cloudinary upload credentials and a real end-to-end image/video upload still need to be verified in the connected Cloudinary account.
- Media removal, reordering, and authorable alt text/captions are not implemented yet.
- `app/sitemap.ts` still reads the mock work dataset rather than live published work.
- Apply Supabase migrations `0001` and `0002`. The first admin is created from `/admin/register` using a server-only API key and setup token; the role is checked in app code and RLS.
- Configure `.env.local` from `.env.example` for local use. Never commit real secrets.

## Security notes

`0002_admin_role_policies.sql` restricts authenticated writes to the server-managed admin claim and adds admin visibility for drafts. The Cloudinary signer requires that same admin claim and signs a work-scoped folder.

## Suggested next improvements

1. Verify image and video uploads with configured Cloudinary credentials, then add media removal/reordering and alt-text editing.
2. Replace mock sitemap data with the published Supabase query.
3. Improve server-action validation and duplicate-slug handling.
4. Add automated tests and accessibility/performance audits before production deployment.
