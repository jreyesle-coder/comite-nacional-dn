"use client";

import { useState } from "react";

export default function Logo() {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gold-400 bg-prm-800 text-xs font-bold text-gold-100">
        PRM
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-prm.png"
      alt="Logo PRM"
      className="h-10 w-10 object-contain"
      onError={() => setError(true)}
    />
  );
}
