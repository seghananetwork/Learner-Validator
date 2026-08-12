"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  ValidatedLearner,
  FIELD_KEYS,
  FIELD_LABELS,
  isComplete,
  GENDERS,
  POPULATION_SEGMENTS,
  DISABILITY_TYPES,
  ID_TYPES,
  EMPLOYMENT_STATUSES,
  blankNewLearner,
} from "@/lib/constants";
import { hubName, isValidHub } from "@/lib/hubs";
import { getCachedLearners, saveLearners } from "@/lib/db";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import { submitOrQueue, flushQueue } from "@/lib/submit";
import { getQueue } from "@/lib/db";
import FieldRow from "@/components/FieldRow";
import AddLearnerForm, { NewLearnerInput } from "@/components/AddLearnerForm";
import Logo from "@/components/Logo";

const OPTIONS_BY_KEY: Record<string, readonly string[] | undefined> = {
  gender: GENDERS,
  populationSegment: POPULATION_SEGMENTS,
  typeOfDisability: DISABILITY_TYPES,
  typeOfId: ID_TYPES,
  employmentStatus: EMPLOYMENT_STATUSES,
};

export default function ValidateHubPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const hub = String(params.hub || "");
  const HUB_NAME = hubName(hub);
  const online = useOnlineStatus();

  const [learners, setLearners] = useState<ValidatedLearner[] | null>(null);
  const [activeSn, setActiveSn] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [queueCount, setQueueCount] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
  }, [status, router]);

  useEffect(() => {
    if (!isValidHub(hub)) return;

    (async () => {
      // Show cached data instantly if we have it (works offline).
      const cached = await getCachedLearners(hub);
      if (cached) setLearners(cached);

      // Then try to refresh from the server (works online; silently skipped offline).
      try {
        const res = await fetch(`/api/hubs/${hub}/learners`);
        if (res.ok) {
          const data = await res.json();
          // Preserve any local-only unsynced edits/new learners not yet reflected server-side.
          const localOnly = (cached || []).filter((l) => l.isNew && !l.id);
          const merged = [...data.learners, ...localOnly];
          setLearners(merged);
          await saveLearners(hub, merged);
        } else if (!cached) {
          setLoadError("Couldn't load the learner list, and nothing is cached on this device yet.");
        }
      } catch {
        if (!cached) {
          setLoadError("You're offline and this hub hasn't been opened on this device before.");
        }
      }
      const q = await getQueue(hub);
      setQueueCount(q.length);
    })();
  }, [hub]);

  useEffect(() => {
    if (learners && hub) saveLearners(hub, learners);
  }, [learners, hub]);

  const trySync = useCallback(async () => {
    if (!hub) return;
    const sent = await flushQueue(hub, HUB_NAME);
    if (sent > 0) {
      const q = await getQueue(hub);
      setQueueCount(q.length);
      setBanner(`Synced ${sent} queued submission${sent > 1 ? "s" : ""} now that you're online.`);
      setTimeout(() => setBanner(null), 5000);
    }
  }, [hub, HUB_NAME]);

  useEffect(() => {
    if (online) trySync();
  }, [online, trySync]);

  const filtered = useMemo(() => {
    if (!learners) return [];
    return learners.filter((l) => {
      const done = isComplete(l);
      if (filter === "pending" && done) return false;
      if (filter === "done" && !done) return false;
      if (query && !l.name.value.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [learners, query, filter]);

  const doneCount = learners ? learners.filter(isComplete).length : 0;
  const total = learners ? learners.length : 0;
  const unsubmittedDoneCount = learners
    ? learners.filter((l) => isComplete(l) && !l.submitted).length
    : 0;

  const active = learners?.find((l) => l.sn === activeSn) ?? null;
  const activeIndex = filtered.findIndex((l) => l.sn === activeSn);

  function updateField(sn: number, key: (typeof FIELD_KEYS)[number], next: any) {
    setLearners((prev) =>
      prev ? prev.map((l) => (l.sn === sn ? { ...l, [key]: next } : l)) : prev
    );
  }

  function goTo(offset: number) {
    const next = filtered[activeIndex + offset];
    if (next) setActiveSn(next.sn);
  }

  function handleAddLearner(input: NewLearnerInput) {
    setLearners((prev) => {
      const nextTempSn = (prev?.filter((l) => (l.sn ?? 0) < 0).length || 0) + 1;
      const nl = blankNewLearner(nextTempSn);
      nl.name = { original: input.name, value: input.name, confirmed: true };
      nl.gender = { original: input.gender, value: input.gender, confirmed: true };
      nl.populationSegment = {
        original: input.populationSegment,
        value: input.populationSegment,
        confirmed: true,
      };
      nl.typeOfDisability = {
        original: input.typeOfDisability,
        value: input.typeOfDisability,
        confirmed: true,
      };
      nl.dob = { original: input.dob, value: input.dob, confirmed: true };
      nl.typeOfId = { original: input.typeOfId, value: input.typeOfId, confirmed: true };
      nl.phone = { original: input.phone, value: input.phone, confirmed: true };
      nl.guardianContact = {
        original: input.guardianContact,
        value: input.guardianContact,
        confirmed: true,
      };
      nl.employmentStatus = {
        original: input.employmentStatus,
        value: input.employmentStatus,
        confirmed: true,
      };
      return [nl, ...(prev || [])];
    });
    setShowAddForm(false);
    setBanner("Learner added. They'll be synced and included in your next submission.");
    setTimeout(() => setBanner(null), 5000);

    // Best-effort immediate sync of the new learner record (safe to fail silently — will
    // be created server-side on submit if this doesn't reach the server now).
    fetch(`/api/hubs/${hub}/learners`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).catch(() => {});
  }

  async function handleSubmit() {
    if (!learners || !session?.user?.email) return;
    const batch = learners.filter((l) => isComplete(l) && !l.submitted);
    if (batch.length === 0) return;
    setSubmitting(true);
    const result = await submitOrQueue(hub, HUB_NAME, batch, session.user.email);
    setLearners((prev) =>
      prev
        ? prev.map((l) => (batch.find((b) => b.sn === l.sn) ? { ...l, submitted: true } : l))
        : prev
    );
    if (result === "sent") {
      setBanner(`Sent ${batch.length} validated learner${batch.length > 1 ? "s" : ""} to MERL.`);
    } else {
      setBanner(
        `You're offline. ${batch.length} learner${
          batch.length > 1 ? "s" : ""
        } saved and will send automatically once you're back online.`
      );
      const q = await getQueue(hub);
      setQueueCount(q.length);
    }
    setSubmitting(false);
    setTimeout(() => setBanner(null), 6000);
  }

  if (!isValidHub(hub)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink/50 px-6 text-center">
        Unknown hub. <a href="/select-hub" className="underline ml-1">Choose a hub</a>
      </div>
    );
  }

  if (status === "loading" || (!learners && !loadError)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink/50">
        Loading {HUB_NAME}&rsquo;s learners&hellip;
      </div>
    );
  }

  if (loadError && !learners) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink/60 px-6 text-center">
        {loadError}
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-28">
      {showAddForm && (
        <AddLearnerForm onCancel={() => setShowAddForm(false)} onSave={handleAddLearner} />
      )}

      <header className="sticky top-0 z-10 bg-field-50/95 backdrop-blur border-b border-ink/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/select-hub" className="shrink-0">
              <Logo size={28} />
            </a>
            <div>
              <p className="font-display text-lg leading-none text-ink">{HUB_NAME}</p>
              <p className="text-xs text-ink/50 mt-0.5">
                {doneCount}/{total} validated
              </p>
            </div>
          </div>
          <button onClick={() => signOut()} className="text-xs text-ink/40 underline">
            Sign out
          </button>
        </div>
        <div className="h-1 bg-ink/5">
          <div
            className="h-1 bg-field-600 transition-all"
            style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
          />
        </div>
        {!online && (
          <div className="bg-clay/10 text-clay text-xs text-center py-1.5 font-medium">
            Offline &mdash; your validations are saving to this device.
            {queueCount > 0 ? ` ${queueCount} submission(s) waiting to send.` : ""}
          </div>
        )}
        {banner && (
          <div className="bg-field-600 text-white text-xs text-center py-1.5 font-medium">
            {banner}
          </div>
        )}
      </header>

      {active ? (
        <LearnerDetail
          learner={active}
          index={activeIndex}
          countInView={filtered.length}
          onBack={() => setActiveSn(null)}
          onPrev={() => goTo(-1)}
          onNext={() => goTo(1)}
          onChange={(key, next) => updateField(active.sn as number, key, next)}
        />
      ) : (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full mb-4 bg-clay text-white font-semibold rounded-2xl px-5 py-4 text-base shadow-md hover:bg-clay/90 active:scale-[0.99] transition-transform flex items-center justify-center gap-2"
          >
            <span className="text-xl leading-none">+</span> Add a learner not on this list
          </button>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name&hellip;"
            className="w-full border border-ink/15 rounded-full px-4 py-2.5 text-sm mb-3 bg-white focus:outline-none focus:ring-2 focus:ring-field-300"
          />
          <div className="flex gap-2 mb-4">
            {(["all", "pending", "done"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs font-medium rounded-full px-3.5 py-1.5 border ${
                  filter === f
                    ? "bg-ink text-white border-ink"
                    : "border-ink/15 text-ink/60 bg-white"
                }`}
              >
                {f === "all" ? "All" : f === "pending" ? "Pending" : "Validated"}
              </button>
            ))}
          </div>

          <ul className="space-y-2">
            {filtered.map((l) => {
              const done = isComplete(l);
              return (
                <li key={l.sn}>
                  <button
                    onClick={() => setActiveSn(l.sn)}
                    className="w-full flex items-center justify-between bg-white border border-ink/10 rounded-xl px-4 py-3 text-left hover:border-field-400 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-ink flex items-center gap-2">
                        {l.name.value}
                        {l.isNew && (
                          <span className="text-[10px] uppercase tracking-wide bg-clay/15 text-clay px-1.5 py-0.5 rounded font-semibold">
                            Added
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-ink/45">
                        {l.sn && l.sn > 0 ? `SN ${l.sn} \u00b7 ` : ""}
                        {l.dob.value || "DOB not set"}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-medium rounded-full px-2.5 py-1 ${
                        done
                          ? l.submitted
                            ? "bg-field-100 text-field-700"
                            : "bg-field-600 text-white"
                          : "bg-ink/5 text-ink/40"
                      }`}
                    >
                      {done ? (l.submitted ? "Submitted" : "Ready") : "Pending"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {!active && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-ink/10 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <p className="text-xs text-ink/50">
              {unsubmittedDoneCount > 0
                ? `${unsubmittedDoneCount} validated learner${
                    unsubmittedDoneCount > 1 ? "s" : ""
                  } ready to submit`
                : "Validate all 9 fields for a learner to include them in a submission"}
            </p>
            <button
              disabled={unsubmittedDoneCount === 0 || submitting}
              onClick={handleSubmit}
              className="bg-clay text-white text-base font-semibold rounded-full px-6 py-3.5 shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting\u2026" : "Submit validated learners"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function LearnerDetail({
  learner,
  index,
  countInView,
  onBack,
  onPrev,
  onNext,
  onChange,
}: {
  learner: ValidatedLearner;
  index: number;
  countInView: number;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  onChange: (key: (typeof FIELD_KEYS)[number], next: any) => void;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <button onClick={onBack} className="text-sm text-ink/50 mb-3 flex items-center gap-1">
        &larr; Back to list
      </button>

      <div className="bg-white rounded-2xl border border-ink/10 px-5 py-2">
        <div className="flex items-center justify-between py-3 border-b border-ink/10">
          <p className="text-xs text-ink/40">
            {learner.sn && learner.sn > 0 ? `SN ${learner.sn} \u00b7 ` : ""}
            {index + 1} of {countInView}
          </p>
          {isComplete(learner) && (
            <span className="text-[11px] font-medium bg-field-600 text-white rounded-full px-2.5 py-1">
              All fields confirmed
            </span>
          )}
        </div>

        {FIELD_KEYS.map((key, i) => (
          <FieldRow
            key={key}
            label={FIELD_LABELS[i]}
            field={(learner as any)[key]}
            options={OPTIONS_BY_KEY[key]}
            onChange={(next) => onChange(key, next)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pb-6">
        <button
          onClick={onPrev}
          disabled={index <= 0}
          className="text-base font-semibold text-ink border-2 border-ink/15 rounded-full px-5 py-3 disabled:opacity-30"
        >
          &larr; Previous
        </button>
        <button
          onClick={onNext}
          disabled={index >= countInView - 1}
          className="text-base font-semibold text-white bg-ink rounded-full px-5 py-3 disabled:opacity-30"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}
