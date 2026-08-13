"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { HUBS } from "@/lib/hubs";
import Logo from "@/components/Logo";

type Summary = { hub_slug: string; total: number; validated: number };

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = (session?.user as any)?.isAdmin;

  const [hub, setHub] = useState<string>(HUBS[0].slug);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
    if (status === "authenticated" && !isAdmin) router.replace("/select-hub");
  }, [status, isAdmin, router]);

  async function loadSummary() {
    const res = await fetch("/api/admin/summary");
    if (res.ok) {
      const data = await res.json();
      setSummary(data.summary);
    }
  }

  useEffect(() => {
    if (isAdmin) loadSummary();
  }, [isAdmin]);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setMessage(null);
    setError(null);
    const form = new FormData();
    form.append("hub", hub);
    form.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed.");
      } else {
        setMessage(`Added ${data.count} learners to ${HUBS.find((h) => h.slug === hub)?.name}.`);
        setFile(null);
        loadSummary();
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    }
    setUploading(false);
  }

  if (status === "loading" || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-ink/50">Loading&hellip;</div>;
  }

  const summaryMap = Object.fromEntries(summary.map((s) => [s.hub_slug, s]));

  return (
    <main className="min-h-screen pb-16">
      <header className="border-b border-ink/10 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/select-hub"><Logo size={28} /></a>
            <p className="font-display text-lg text-ink">Admin</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/select-hub" className="text-xs text-ink/50 underline">
              Back to hubs
            </a>
            <button onClick={() => signOut()} className="text-xs text-ink/40 underline">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-8">
        <h1 className="font-display text-3xl text-ink mb-2">Upload learner data</h1>
        <p className="text-ink/60 mb-6">
          Upload the filled-in template for a hub. Enumerators will see these learners the next
          time they open that hub.
        </p>

        <a
          href="/templates/learner-upload-template.xlsx"
          download
          className="inline-block mb-6 text-sm font-semibold text-field-700 underline"
        >
          Download the upload template (.xlsx)
        </a>

        <div className="bg-white rounded-2xl border border-ink/10 p-5 mb-8">
          <label className="block text-xs uppercase tracking-wide text-ink/45 font-medium mb-1">
            Hub
          </label>
          <select
            value={hub}
            onChange={(e) => setHub(e.target.value)}
            className="w-full border border-ink/15 rounded-lg px-3 py-3 text-base mb-4"
          >
            {HUBS.map((h) => (
              <option key={h.slug} value={h.slug}>
                {h.name}
              </option>
            ))}
          </select>

          <label className="block text-xs uppercase tracking-wide text-ink/45 font-medium mb-1">
            Filled-in sheet (.xlsx or .csv)
          </label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full border border-ink/15 rounded-lg px-3 py-3 text-base mb-4 bg-white"
          />

          {message && <p className="text-sm text-field-700 font-medium mb-3">{message}</p>}
          {error && <p className="text-sm text-clay font-medium mb-3">{error}</p>}

          <button
            disabled={!file || uploading}
            onClick={handleUpload}
            className="w-full bg-clay text-white font-semibold rounded-2xl px-5 py-4 text-lg shadow-md hover:bg-clay/90 active:scale-[0.99] transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading\u2026" : "Upload learners"}
          </button>
        </div>

        <h2 className="font-display text-xl text-ink mb-3">Progress by hub</h2>
        <div className="bg-white rounded-2xl border border-ink/10 divide-y divide-ink/10">
          {HUBS.map((h) => {
            const s = summaryMap[h.slug];
            return (
              <div key={h.slug} className="flex items-center justify-between px-5 py-3.5">
                <span className="font-medium text-ink">{h.name}</span>
                <span className="text-sm text-ink/50">
                  {s ? `${s.validated} / ${s.total} validated` : "No data yet"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
