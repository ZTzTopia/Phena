"use client";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    </div>
  );
}
