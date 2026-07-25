import { ParticipantShell } from "../../_components/shell";

export default function PublicContestLayout({ children }: { children: React.ReactNode }) {
  return <ParticipantShell>{children}</ParticipantShell>;
}
