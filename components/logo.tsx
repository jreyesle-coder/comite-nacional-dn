"use client";

import { useState } from "react";

export default function Logo() {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-bold text-prm-700">
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
