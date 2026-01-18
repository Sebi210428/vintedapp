"use client";

import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  const onBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#05080f] text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16">
        <div className="flex items-center justify-between gap-6">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
            onClick={onBack}
            type="button"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </button>
        </div>

        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-slate-400">Last updated: 2025-12-25</p>
        </header>

        <section className="space-y-8 text-sm leading-relaxed text-slate-300">
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-white">1. Introduction</h2>
            <p>
              This Privacy Policy explains how BlueCut collects, uses, and protects
              personal data. The service is operated by an individual based in
              Romania.
            </p>
            <p>
              By using BlueCut, you agree to the collection and use of information as
              described in this policy.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-white">2. Data We Collect</h2>
            <p>We may collect the following personal data:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Email address</li>
              <li>Password (stored securely in encrypted form)</li>
              <li>Name (optional, if provided by the user)</li>
              <li>Uploaded images</li>
              <li>Basic technical data such as IP address and browser type</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-white">3. How We Use Your Data</h2>
            <p>We use collected data to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Create and manage user accounts</li>
              <li>Authenticate users</li>
              <li>Process uploaded images</li>
              <li>Provide and improve the service</li>
              <li>Communicate with users when necessary</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-white">4. Uploaded Images</h2>
            <p>Uploaded images are processed automatically using AI technology.</p>
            <p>
              Uploaded images are automatically deleted within 7 days after processing.
              Images are not used for training, not shared, and not sold to third parties.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-white">
              5. Data Storage &amp; Security
            </h2>
            <p>We take reasonable technical measures to protect user data.</p>
            <p>
              Passwords are never stored in plain text and are always encrypted.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-white">6. User Rights (GDPR)</h2>
            <p>
              As a user located in the European Union, you have the right to:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Access your personal data</li>
              <li>Request correction or deletion of your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p>
              To exercise these rights, contact us at{" "}
              <a className="underline underline-offset-4 hover:text-white" href="mailto:bluecut@gmail.com">
                bluecut@gmail.com
              </a>
              .
            </p>
          </div>

          <div className="space-y-2" id="cookies">
            <h2 className="text-base font-semibold text-white">7. Cookies</h2>
            <p>
              BlueCut uses essential cookies that are required for authentication and
              security (for example, keeping you signed in via NextAuth).
            </p>
            <p>
              We may also store a local preference to remember that you dismissed the
              cookie notice.
            </p>
            <p>We do not use marketing cookies.</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-white">8. Contact</h2>
            <p>
              For any questions regarding this Privacy Policy, you can contact us at{" "}
              <a className="underline underline-offset-4 hover:text-white" href="mailto:bluecut@gmail.com">
                bluecut@gmail.com
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
