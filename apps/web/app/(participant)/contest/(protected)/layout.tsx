import { requireRole } from "@/lib/auth";
import { ParticipantShell } from "../../_components/shell";

export default async function ProtectedContestLayout({ children }: { children: React.ReactNode }) {
  await requireRole("/", "team");
  return <ParticipantShell>{children}</ParticipantShell>;
}
