# Deploying to Vercel and Supabase

The app works with no account and no keys: everything stays in the browser. Accounts (Supabase) add progress sync, and API keys add real market data. This checklist is for the site owner. Do these steps yourself; none of them can be done from the code.

## 1. Supabase project

1. Create a project at supabase.com. Note the **Project URL** (`https://<ref>.supabase.co`) and the **publishable (anon) key** from Project Settings > API.
   - Never use the `service_role` / secret key anywhere in this app. Only the publishable key reaches the browser.
2. Run the migration in `supabase/migrations/20261118000000_user_state.sql` (SQL editor, or `supabase link` then `supabase db push`). It creates `public.user_state` with row level security on and owner-only policies.
3. Run the database tests: `supabase test db` (needs the Supabase CLI and Docker). They check that anonymous users and other users cannot read or change your row. These have **not** been run yet.
4. Authentication > URL Configuration:
   - Site URL: `https://<your-vercel-domain>/app`
   - Redirect URLs: `https://<your-vercel-domain>/app` (and `http://127.0.0.1:8000/app` for local testing)
5. Authentication > Providers:
   - Email: on, **Confirm email** on, minimum password length 10, require lower case, upper case and digits.
   - Google: create an OAuth client in Google Cloud Console. Authorized redirect URI: `https://<ref>.supabase.co/auth/v1/callback`. Paste the client ID and secret into Supabase.
   - GitHub: create an OAuth app in GitHub > Settings > Developer settings. Callback URL: `https://<ref>.supabase.co/auth/v1/callback`.
6. Authentication > Rate Limits: keep the defaults or lower them. Consider turning on CAPTCHA (Attack Protection) for sign-up.
7. Set up a custom SMTP sender before real users sign up. The built-in sender is limited to a few emails per hour.

## 2. Market data keys (optional)

| Variable | Where to get it | Notes |
| --- | --- | --- |
| `ALPHA_VANTAGE_API_KEY` | alphavantage.co/support/#api-key | 25 requests/day |
| `COINGECKO_DEMO_API_KEY` | coingecko.com/en/api | Demo plan, attribution required |
| `TIINGO_API_KEY` | tiingo.com > Account > API | Free plan is personal use only |
| `FINNHUB_API_KEY` | finnhub.io/dashboard | Free plan: quotes, 60 calls/minute |

Kraken, CoinPaprika and Frankfurter need no key.

The free plans of these providers are for personal, non-commercial use and do not allow redistributing their data. So on the public site, keyed sources are **limited to the accounts you list** in `DATA_USER_EMAILS` or `DATA_USER_IDS`. If both are empty, nobody can load them. Everyone can still use CSV import, SYNTHETIC data, Kraken, CoinPaprika and Frankfurter.

## 3. Vercel project

1. Import the GitHub repository in Vercel. No build command is needed: `vercel.json` serves `app/` and the functions in `api/`.
2. Project > Settings > Environment Variables (Production and Preview):
   - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`
   - `DATA_USER_EMAILS` = your own sign-in email (comma-separated for more)
   - any market keys from step 2
3. Deploy, then open `https://<your-vercel-domain>/` (landing page) and `/app`.

See `.env.example` for the full list. For local use, copy it to `.env` (git-ignored) and run `node app/server.js`.

## 4. Check after deploying

- `/api/config` returns `auth: true` and only the URL and publishable key.
- Sign up, confirm the email, sign in, change a lesson's progress, then sign in on another browser and sync.
- While signed out, the backtest lab's Alpha Vantage source answers "Sign in to load this data source". Signed in with a non-listed account, it answers "limited to the site owner".
- Response headers include `Content-Security-Policy`, `Strict-Transport-Security` and `X-Frame-Options: DENY`.

## 5. Keep in mind

- Rate limits for `/api/market` are kept in memory per server instance, so they are best effort on Vercel. Move them to a shared store (for example Upstash Redis) if you see abuse.
- If a key is ever exposed, rotate it at the provider and update the Vercel variable.
