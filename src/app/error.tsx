"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow mb-3">Something broke</p>
      <h1 className="font-display text-2xl font-bold">This page didn&rsquo;t load</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        The error has been logged. Reloading usually clears it.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-[11px] text-muted">Reference: {error.digest}</p>
      )}
      <Button className="mt-6" onClick={reset}>
        Reload this page
      </Button>
    </div>
  );
}
