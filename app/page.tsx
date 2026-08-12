"use client";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Logo from "@/components/Logo";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/select-hub");
  }, [status, router]);

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Logo size={44} />
          </div>
          <p className="font-body text-xs tracking-[0.2em] uppercase text-field-600 mb-3">
            Field Ledger
          </p>
          <h1 className="font-display text-4xl sm:text-5xl leading-tight text-ink mb-4">
            Validate learners,
            <br />
            no signal required.
          </h1>
          <p className="text-ink/70 mb-10 leading-relaxed">
            Confirm or correct each learner&rsquo;s enrollment record, hub by hub. Your work is
            saved on this device and submitted the moment you&rsquo;re back online.
          </p>

          {status !== "authenticated" && (
            <button
              onClick={() => signIn("google")}
              className="w-full flex items-center justify-center gap-3 bg-ink text-white rounded-full py-4 text-lg font-semibold shadow-lg hover:bg-field-800 active:scale-[0.99] transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
                <path
                  fill="#fff"
                  d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
                />
                <path
                  fill="#fff"
                  d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z"
                />
                <path
                  fill="#fff"
                  d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33z"
                />
                <path
                  fill="#fff"
                  d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"
                />
              </svg>
              Continue with Google
            </button>
          )}

          <p className="text-xs text-ink/40 mt-6 leading-relaxed">
            Sign-in is restricted to approved SEG Ghana staff accounts. This dataset contains
            disability, refugee/IDP and guardian information &mdash; keep this device secured.
          </p>
        </div>
      </div>
    </main>
  );
}
