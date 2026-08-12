"use client";
import { useState } from "react";

export default function Logo({ size = 36 }: { size?: number }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="rounded-lg bg-field-700 text-white font-display flex items-center justify-center font-bold"
          style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
          SE
        </div>
        <span className="font-display text-lg text-ink">SE Ghana</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="SE Ghana"
      style={{ height: size }}
      className="w-auto"
      onError={() => setFailed(true)}
    />
  );
}
