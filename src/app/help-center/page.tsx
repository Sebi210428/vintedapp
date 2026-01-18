import Link from "next/link";

export default function HelpCenterPage() {
  return (
    <main className="min-h-screen bg-[#05080f] text-white">
      <div className="mx-auto w-full max-w-4xl px-6 py-14">
        <div className="mb-10 flex items-center justify-between gap-6">
          <Link
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
            href="/"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
            href="/dashboard"
          >
            <span className="material-symbols-outlined text-lg">dashboard</span>
            Go to Dashboard
          </Link>
        </div>

        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
          <p className="mt-3 text-sm text-slate-400 max-w-2xl">
            Quick answers and troubleshooting for BlueCut. If you can&apos;t find
            what you need, contact us.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-lg font-bold">Getting started</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>
                Create an account: <Link className="underline" href="/register">/register</Link>
              </li>
              <li>
                Sign in: <Link className="underline" href="/login">/login</Link>
              </li>
              <li>
                Configure defaults (format/quality):{" "}
                <Link className="underline" href="/dashboard/preferences">
                  Preferences
                </Link>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-lg font-bold">Uploads &amp; processing</h2>
            <p className="mt-3 text-sm text-slate-300">
              The upload + processing worker integration is added separately. Once
              connected, you&apos;ll be able to upload from the dashboard and track
              progress in Notifications and History.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>Supported formats: JPG, PNG, WEBP</li>
              <li>Recommended: clear subject, good lighting</li>
              <li>Default output format and quality are set in Preferences</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-lg font-bold">Password &amp; account</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>
                Change password: <Link className="underline" href="/dashboard/account">Account Settings</Link>
              </li>
              <li>
                Forgot password: <Link className="underline" href="/reset-password">Reset password</Link>
              </li>
              <li>
                You can&apos;t change your email yet (coming later).
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-lg font-bold">Troubleshooting</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>
                Not receiving reset emails? Check spam, and make sure SMTP is configured
                in production.
              </li>
              <li>
                Seeing an error screen? Try reloading. If it persists, send us the
                error message.
              </li>
              <li>
                On Windows dev: Prisma + Turbopack may require symlink privileges — use
                Webpack dev mode (default in this repo).
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="text-lg font-bold">Contact</h2>
            <p className="mt-3 text-sm text-slate-300">
              Email us at{" "}
              <a className="underline" href="mailto:bluecut@gmail.com">
                bluecut@gmail.com
              </a>{" "}
              with your account email and a short description of the issue.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

