"use client";
import { useState } from "react";
import { ValidatedField } from "@/lib/constants";

export default function FieldRow({
  label,
  field,
  options,
  onChange,
}: {
  label: string;
  field: ValidatedField<string>;
  options?: readonly string[];
  onChange: (next: ValidatedField<string>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const edited = field.value !== field.original;

  return (
    <div className="py-4 border-b border-ink/10 last:border-b-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs uppercase tracking-wide text-ink/45 font-medium">{label}</span>
        {field.confirmed && !editing && (
          <span className="text-[11px] text-field-600 font-medium flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6.5 4.8 9 10 3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Confirmed
          </span>
        )}
      </div>

      {!editing ? (
        <div className="flex items-center justify-between gap-3">
          <span className={`text-base ${edited ? "text-clay font-medium" : "text-ink"}`}>
            {field.value || <span className="text-ink/30 italic">blank</span>}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {!field.confirmed && (
              <button
                onClick={() => onChange({ ...field, confirmed: true })}
                className="text-xs font-medium bg-field-600 text-white rounded-full px-3 py-1.5 hover:bg-field-700"
              >
                Confirm
              </button>
            )}
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-medium text-ink/60 border border-ink/15 rounded-full px-3 py-1.5 hover:bg-ink/5"
            >
              Edit
            </button>
          </div>
        </div>
      ) : options ? (
        <div className="flex flex-wrap gap-2 mt-1">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange({ ...field, value: opt, confirmed: true });
                setEditing(false);
              }}
              className={`text-sm rounded-full px-3 py-1.5 border transition-colors ${
                field.value === opt
                  ? "bg-field-700 text-white border-field-700"
                  : "border-ink/15 text-ink/70 hover:bg-ink/5"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            defaultValue={field.value}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onChange({ ...field, value: (e.target as HTMLInputElement).value, confirmed: true });
                setEditing(false);
              }
            }}
            onBlur={(e) => {
              onChange({ ...field, value: e.target.value, confirmed: true });
              setEditing(false);
            }}
            className="flex-1 border border-field-400 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-field-300"
          />
        </div>
      )}
    </div>
  );
}
