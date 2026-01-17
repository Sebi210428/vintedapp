This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Windows note (Prisma + Turbopack)

If you run with Turbopack on Windows, you may hit `os error 1314` (symlink privilege) when Prisma is imported (e.g. on API routes like password reset). The default `npm run dev` in this repo uses Webpack to avoid that.

- Use Webpack dev server: `npm run dev` or `npm run dev:webpack`
- Use Turbopack only if you have symlink privileges (Windows Developer Mode or run terminal as admin): `npm run dev:turbo`

## Environment (password reset email)

- Copy `vinted-next/.env.example` to `vinted-next/.env.local`
- For Gmail SMTP (sender), set:
  - `APP_URL="http://localhost:3000"` (or your deployed domain)
  - `NEXTAUTH_URL="http://localhost:3000"` (or your deployed domain, to remove NextAuth warnings)
  - `SMTP_HOST="smtp.gmail.com"`
  - `SMTP_PORT="465"` (or `587`)
  - `SMTP_USER="youraddress@gmail.com"`
  - `SMTP_PASS="your_gmail_app_password"` (Google Account  Security  2-Step Verification  App passwords)
  - `SMTP_FROM="BlueCut <youraddress@gmail.com>"` (optional)

## Background remover jobs (upload → processing → download)

### Test SMTP

After setting `SMTP_*`, send a test email:

```bash
npm run test:smtp -- you@yourdomain.com
```

This repo stores uploads/results locally in `vinted-next/storage` and tracks jobs in the DB.

- Create DB tables (SQLite): `npx prisma db push`
- Start dev server: `npm run dev`
- Go to: `http://localhost:3000/dashboard`

### Worker integration (optional)

If you have an external worker, set:

- `WORKER_URL="http://localhost:4000"` (the worker should expose `POST /start`)
- `WORKER_SHARED_SECRET="...random..."` (sent as `x-worker-secret`)

Flow used by this repo:

1) App creates a job and saves the input image.
2) App calls `POST {WORKER_URL}/start` with:
   - `jobId`, `inputUrl` (`/api/jobs/{jobId}/input`), `callbackUrl` (`/api/jobs/callback`), `outputFormat`, `quality`, `workerSecret`
3) Worker downloads `inputUrl` (send header `x-worker-secret`)
4) Worker calls `POST callbackUrl` with JSON:
   - success: `{ jobId, ok: true, outputBase64, outputMime }`
   - failure: `{ jobId, ok: false, error }`

### Tuning

- `JOB_CREDITS_COST="50"` credits per image (default 50)
- `MAX_UPLOAD_MB="10"` max upload size in MB (default 10)
- `MOCK_WORKER="true"` to auto-complete jobs in dev when no worker is configured

## Google login (optional)

- Create OAuth credentials in Google Cloud Console and set:
  - `GOOGLE_CLIENT_ID="...apps.googleusercontent.com"`
  - `GOOGLE_CLIENT_SECRET="..."`

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
