# Security operations

This application is hardened in code, but security also depends on the Supabase
project and hosting configuration. Complete this checklist before production.

## Required deployment steps

1. Back up the database, then run the complete [`supabase/schema.sql`](supabase/schema.sql)
   script in the Supabase SQL editor. It enables RLS, restricts database roles,
   validates cross-table ownership, and prevents accidental public access for
   future tables.
2. In Supabase Auth, keep **Confirm email** enabled, disable anonymous sign-ins
   unless they are intentionally supported, and enable CAPTCHA (Cloudflare
   Turnstile or hCaptcha) for sign-up and sign-in.
3. Set a password policy of at least 12 characters and enable leaked-password
   protection where your Supabase plan supports it. Enable MFA for accounts that
   administer the Supabase project.
4. Set the Site URL and Auth redirect allow-list to the exact HTTPS production
   domain(s); remove preview, localhost, and unused domains from production.
   Enable security notification emails for password and email changes.
5. Review Auth rate limits and configure production SMTP. Do not disable email
   confirmation merely to avoid the development email quota.
6. Store only the Supabase URL and publishable/anon key in `NEXT_PUBLIC_*`
   variables. Never put a `service_role` key, database password, SMTP password,
   or personal access token in browser-visible variables, source control, or
   client-side code. Rotate any secret that is ever exposed.
7. Use HTTPS-only hosting. If self-hosting on multiple instances, set the same
   high-entropy `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` on every instance and keep
   it in the host's secret manager.

## Ongoing checks

- Run `npm audit --omit=dev` before releases and update dependencies promptly.
- Verify the production response headers include CSP, HSTS, `X-Content-Type-Options`,
  `Referrer-Policy`, and clickjacking protection.
- Review the Supabase Security Advisor and RLS policies after every schema
  change. New public tables must explicitly enable RLS and receive narrowly
  scoped grants and policies.
- Review Supabase Auth/audit logs and hosting logs for abnormal sign-in or
  request-volume patterns. Keep database backups and test restoration.

The public Supabase URL and anon/publishable key are intentionally visible in a
browser application; they are not privileged credentials. RLS and the database
grants are what prevent those values from exposing other users' data.
