"use client";

import { Spinner } from "@phena/ui/components/spinner";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-2 py-10">
      <Spinner className="size-6" />
      <p className="text-muted-foreground text-sm">Loading…</p>
    </div>
  );
}
