"use client";

import { useRouter } from "next/navigation";

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-slate-400">Last updated: 2025-12-25</p>
        </header>

        <section className="space-y-8 text-sm leading-relaxed text-slate-300">
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-white">1. Introduction</h2>
            <p>
              These Terms &amp; Conditions govern the use of BlueCut. By accessing or
              using the service, you agree to these Terms.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-white">
              2. Description of the Service
            </h2>
            <p>
              BlueCut provides an automated service for removing image backgrounds
              using artificial intelligence.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-white">3. AI Disclaimer</h2>
            <p>The service uses automated AI technology.</p>
            <p>
              Results are generated automatically and may not always be accurate or
              perfect. BlueCut does not guarantee specific results or outcomes.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-white">4. User Responsibilities</h2>
            <p>
              Users are responsible for the content they upload and confirm that they
              have the legal right to use those images.
            </p>
            <p>Uploading illegal, harmful, or abusive content is strictly prohibited.</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-white">5. Service Availability</h2>
            <p>
              The service may be modified, limited, or updated at any time without
              prior notice.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-white">6. Account Suspension</h2>
            <p>
              We reserve the right to limit, suspend, or terminate accounts that
              abuse the service or violate these Terms.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-white">7. Limitation of Liability</h2>
            <p>The service is provided “as is”, without warranties of any kind.</p>
            <p>BlueCut is not liable for any damages resulting from the use of the service.</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-white">8. Governing Law</h2>
            <p>
              These Terms are governed by the laws of Romania and applicable European
              Union regulations.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-white">9. Contact</h2>
            <p>
              For questions related to these Terms &amp; Conditions, contact{" "}
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
