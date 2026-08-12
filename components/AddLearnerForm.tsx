"use client";
import { useState } from "react";
import {
  GENDERS,
  POPULATION_SEGMENTS,
  DISABILITY_TYPES,
  ID_TYPES,
  EMPLOYMENT_STATUSES,
} from "@/lib/constants";

export type NewLearnerInput = {
  name: string;
  gender: string;
  populationSegment: string;
  typeOfDisability: string;
  dob: string;
  typeOfId: string;
  phone: string;
  guardianContact: string;
  employmentStatus: string;
  reason: string;
};

export default function AddLearnerForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (input: NewLearnerInput) => void;
}) {
  const [form, setForm] = useState<NewLearnerInput>({
    name: "",
    gender: GENDERS[0],
    populationSegment: "N/A",
    typeOfDisability: "N/A",
    dob: "",
    typeOfId: ID_TYPES[0],
    phone: "",
    guardianContact: "",
    employmentStatus: "Not employed",
    reason: "",
  });

  const set = (k: keyof NewLearnerInput, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const canSave = form.name.trim().length > 1 && form.reason.trim().length > 2;

  return (
    <div className="fixed inset-0 bg-ink/40 z-20 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-5">
        <h2 className="font-display text-xl text-ink mb-1">Add a replacement learner</h2>
        <p className="text-sm text-ink/60 mb-4">
          Use this when a listed learner is over-age, disqualified, or otherwise being replaced.
        </p>

        <label className="block text-xs uppercase tracking-wide text-ink/45 font-medium mb-1 mt-3">
          Reason for adding *
        </label>
        <input
          value={form.reason}
          onChange={(e) => set("reason", e.target.value)}
          placeholder="e.g. Replacing an over-age learner"
          className="w-full border border-ink/15 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-field-300"
        />

        <label className="block text-xs uppercase tracking-wide text-ink/45 font-medium mb-1 mt-3">
          Full name *
        </label>
        <input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="w-full border border-ink/15 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-field-300"
        />

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink/45 font-medium mb-1">
              Gender
            </label>
            <select
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
              className="w-full border border-ink/15 rounded-lg px-3 py-2.5 text-base"
            >
              {GENDERS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink/45 font-medium mb-1">
              Date of birth
            </label>
            <input
              value={form.dob}
              onChange={(e) => set("dob", e.target.value)}
              placeholder="DD/MM/YYYY"
              className="w-full border border-ink/15 rounded-lg px-3 py-2.5 text-base"
            />
          </div>
        </div>

        <label className="block text-xs uppercase tracking-wide text-ink/45 font-medium mb-1 mt-3">
          Population segment
        </label>
        <select
          value={form.populationSegment}
          onChange={(e) => set("populationSegment", e.target.value)}
          className="w-full border border-ink/15 rounded-lg px-3 py-2.5 text-base"
        >
          {POPULATION_SEGMENTS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <label className="block text-xs uppercase tracking-wide text-ink/45 font-medium mb-1 mt-3">
          Type of disability
        </label>
        <select
          value={form.typeOfDisability}
          onChange={(e) => set("typeOfDisability", e.target.value)}
          className="w-full border border-ink/15 rounded-lg px-3 py-2.5 text-base"
        >
          {DISABILITY_TYPES.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <label className="block text-xs uppercase tracking-wide text-ink/45 font-medium mb-1 mt-3">
          Type of ID
        </label>
        <select
          value={form.typeOfId}
          onChange={(e) => set("typeOfId", e.target.value)}
          className="w-full border border-ink/15 rounded-lg px-3 py-2.5 text-base"
        >
          {ID_TYPES.map((i) => (
            <option key={i}>{i}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink/45 font-medium mb-1">
              Phone number
            </label>
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="w-full border border-ink/15 rounded-lg px-3 py-2.5 text-base"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink/45 font-medium mb-1">
              Guardian contact
            </label>
            <input
              value={form.guardianContact}
              onChange={(e) => set("guardianContact", e.target.value)}
              className="w-full border border-ink/15 rounded-lg px-3 py-2.5 text-base"
            />
          </div>
        </div>

        <label className="block text-xs uppercase tracking-wide text-ink/45 font-medium mb-1 mt-3">
          Employment status
        </label>
        <select
          value={form.employmentStatus}
          onChange={(e) => set("employmentStatus", e.target.value)}
          className="w-full border border-ink/15 rounded-lg px-3 py-2.5 text-base mb-6"
        >
          {EMPLOYMENT_STATUSES.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>

        <div className="flex items-center gap-3 sticky bottom-0 bg-white pt-2">
          <button
            onClick={onCancel}
            className="flex-1 border-2 border-ink/15 text-ink font-semibold rounded-full py-3.5 text-base"
          >
            Cancel
          </button>
          <button
            disabled={!canSave}
            onClick={() => canSave && onSave(form)}
            className="flex-1 bg-clay text-white font-semibold rounded-full py-3.5 text-base shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Add learner
          </button>
        </div>
      </div>
    </div>
  );
}
