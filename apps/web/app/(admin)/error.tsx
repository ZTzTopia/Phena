"use client";

import { AdminError } from "@/app/(admin)/_components/admin-error";

export default function AdminRouteError({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
}) {
  return <AdminError error={error} unstable_retry={unstable_retry} />;
}
