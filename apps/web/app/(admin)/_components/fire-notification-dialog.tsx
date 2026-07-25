"use client";

import { type NotificationModel as NM } from "@phena/schema";
import { Button } from "@phena/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@phena/ui/components/dialog";
import { Label } from "@phena/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@phena/ui/components/select";
import { Textarea } from "@phena/ui/components/textarea";
import { useQuery } from "@tanstack/react-query";
import { DetailedError, parseResponse } from "hono/client";
import { MegaphoneIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { client } from "@/lib/api-client";

type TeamOption = { id: string; name: string };

export function FireNotificationDialog() {
  const GLOBAL_VALUE = "__global__";
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [teamPublicId, setTeamPublicId] = useState<string>(GLOBAL_VALUE);
  const [sending, setSending] = useState(false);

  const { data: teamsData } = useQuery({
    queryKey: ["admin", "teams"],
    queryFn: async () => {
      const res = await parseResponse(
        client.api.teams.$get({ query: { page: "1", limit: "200" } }),
      );
      return res as { teams: TeamOption[] };
    },
  });

  const teams = teamsData?.teams ?? [];

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const body: NM["createBody"] = { message: message.trim() };
      if (teamPublicId !== GLOBAL_VALUE) {
        body.teamPublicId = teamPublicId;
      }
      await parseResponse(client.api.notifications.$post({ json: body }));
      toast.success("Notification sent");
      setMessage("");
      setTeamPublicId(GLOBAL_VALUE);
      setOpen(false);
    } catch (err) {
      toast.error(
        err instanceof DetailedError
          ? err.detail.data.error
          : err instanceof Error
            ? err.message
            : "Failed to send notification",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <MegaphoneIcon className="mr-2 size-4" />
          Fire Notification
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fire Notification</DialogTitle>
          <DialogDescription>
            Send a notification to all teams or a specific team.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="team">Target</Label>
            <Select value={teamPublicId} onValueChange={setTeamPublicId}>
              <SelectTrigger id="team">
                <SelectValue placeholder="All teams (global)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={GLOBAL_VALUE}>All teams (global)</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || !message.trim()}>
            {sending ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
