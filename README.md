# KIROKU V4 — Step 2: Vercel + Supabase Auth and Cloud Collections

This is a complete upgrade of **KIROKU V3.2**, preserving the cinematic intro, home/spotlight, Netflix-inspired Top 10, search, anime title details and Kitsu catalog integration. New functionality: Supabase email/password accounts, private user profiles, cloud watchlists, account page, password recovery, and **manual, non-destructive import** of the previous browser collection.

## 1. Upload to GitHub, then deploy Vercel

1. Extract this ZIP. The folder contains `package.json` at its root.
2. Create a new repository on GitHub or update the existing KIROKU repository. Upload the **contents** of this folder, not an extra nested folder.
3. Open https://vercel.com/new, select the repository and choose Next.js. Root Directory: `./`. Build Command: `npm run build`. Output: default.
4. The site can deploy with the catalog and browser-only watchlist *even before* Supabase environment variables are added. Auth UI will show a configuration message until the variables exist.
5. After you add environment variables to an existing Vercel project, **redeploy**. Vercel variables apply only to new deployments.

## 2. Create the Supabase project and database

1. At https://supabase.com/dashboard, create a project.
2. Open **SQL Editor** > **New query**, paste the full contents of `supabase/migrations/20261113_kiroku_phase2.sql`, and execute.
3. The script creates `public.profiles` and `public.watchlist_entries`, a signup profile trigger, row constraints, and explicit `SELECT/INSERT/UPDATE/DELETE` Row Level Security (RLS) policies. Each signed-in user can only access their own rows. Anonymous clients have no table privileges.
4. After setup, test with two different accounts. Make sure each can only see its own data. For a public launch, also run automated RLS tests and review privacy, rate limiting, copyright/metadata licensing, and data retention.

## 3. Configure environment variables

In the Supabase project **Connect** panel, copy the **Project URL** and **Publishable key**. In Vercel > Project > **Settings > Environment Variables**, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

Choose **Production**, and Preview if needed. **Redeploy** afterward.

For local development, create `.env.local` in the project root with the same two values, then run:

```bash
npm install
npm run lint
npm run build
npm run dev
```

Do not commit `.env.local`. **Never use the service_role key, secret API key, or database password in any `NEXT_PUBLIC_...` variable.** The browser publishable key is safe only because RLS protects data.

## 4. Configure Supabase email authentication

1. Open Supabase > **Authentication > Providers** > Email. Enable email/password auth and keep **Confirm email** enabled.
2. Open **Authentication > URL Configuration**:
   - **Site URL:** `https://YOUR-KIROKU-DOMAIN.vercel.app`
   - **Redirect URLs:** `https://YOUR-KIROKU-DOMAIN.vercel.app/auth/confirm` and `http://localhost:3000/auth/confirm`.
   - If using Preview deployments, add their exact callback URLs too.
3. Open **Authentication > Email Templates** and change the destination links so the SSR callback can verify a token hash:

   **Confirm signup**:
   ```html
   <a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Confirm your KIROKU account</a>
   ```

   **Reset password**:
   ```html
   <a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery">Reset your KIROKU password</a>
   ```

   The app supplies `.RedirectTo` as your deployed `/auth/confirm` route. Save each email template.
4. In production, configure reputable SMTP delivery and appropriate email rate limits. Supabase's default email service has restrictions and is not intended for a large public audience.

## 5. Test step by step

- Home `/`: intro, spotlights, Top 10, API titles and search work unchanged.
- Guest `/library`: add and edit watchlist. Legacy key `kyo:library:v1` is unchanged, preserving existing browser collections on the *same origin/browser*.
- `/auth`: sign up, confirm from email, sign in, sign out, forgot password.
- `/account`: update display name; view cloud library count; optionally import guest entries.
- `/library` signed in: add, remove, update progress/status. Reload and verify data stays. Sign in from a second device and verify cloud data follows the account.
- Import: once signed in, choose **Import browser titles**. Existing cloud status/progress wins on conflicts; guest entries remain in browser storage. The import can safely be repeated. It does not automatically mix a shared computer's guest list into an account.
- Cross-user isolation: use two test accounts. Neither should see/edit the other's collections or profiles. RLS does the enforcement in the database, not just client-side code.

## File map

- `components/auth-provider.tsx`: shared authenticated-user state
- `components/library-provider.tsx`: guest library + cloud sync + manual merge
- `app/auth/page.tsx`: login, signup, recovery request
- `app/auth/confirm/route.ts`: token hash / PKCE code confirmation
- `app/account/page.tsx`: account profile, library status, import
- `app/account/reset-password/page.tsx`: password update after recovery
- `lib/supabase/client.ts`: browser client
- `lib/supabase/server.ts`: cookie-backed server client
- `lib/supabase/proxy.ts`, `proxy.ts`: session token refresh on Next.js 16
- `supabase/migrations/20261113_kiroku_phase2.sql`: database schema and policies
- `app/step2.css`: auth and account styling, without changing V3.2 design

## Notes and limitations

- No Supabase project has been created or connected automatically; you must configure the project and keys.
- Cross-device data is synchronized when the signed-in user loads or refreshes the library, not as an always-live real-time subscription.
- Changes optimistically update the UI; a failed request shows an error and restores the previous local view. An uninterrupted connection is recommended when making multiple rapid edits to the same anime.
- The original browser list remains distinct from the cloud account and is preserved until the user clears their browser storage. It is not synced while signed out.
- This is not a streaming/piracy platform; it displays metadata and anime tracking functionality. Review catalog/API image licensing and use rights before a large public launch.
- This package was assembled and checked statically; final end-to-end deployment, actual email delivery, and database permissions require testing with your own Vercel and Supabase projects.
