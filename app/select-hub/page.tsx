"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { HUBS } from "@/lib/hubs";
import Logo from "@/components/Logo";

export default function SelectHub() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = (session?.user as any)?.isAdmin;

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
  }, [status, router]);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-ink/50">Loading&hellip;</div>;
  }

  return (
    <main className="min-h-screen pb-16">
      <header className="border-b border-ink/10 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <button onClick={() => signOut()} className="text-xs text-ink/40 underline">
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-8">
        <h1 className="font-display text-3xl text-ink mb-2">Choose a hub</h1>
        <p className="text-ink/60 mb-6">Select the hub whose learners you're validating today.</p>

        {isAdmin && (
          <button
            onClick={() => router.push("/admin")}
            className="w-full mb-6 bg-clay text-white font-semibold rounded-2xl px-5 py-4 text-lg shadow-md hover:bg-clay/90 active:scale-[0.99] transition-transform"
          >
            Go to admin dashboard &rarr;
          </button>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {HUBS.map((h) => (
            <button
              key={h.slug}
              onClick={() => router.push(`/validate/${h.slug}`)}
              className="bg-white border-2 border-field-600/20 rounded-2xl px-4 py-5 text-center font-semibold text-ink hover:border-field-600 hover:bg-field-50 active:scale-[0.98] transition-all shadow-sm"
            >
              {h.name}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
