import { Badge } from "@phena/ui/components/8bit/badge";
import { cn } from "@phena/ui/lib/utils";
import React from "react";

interface StatusIndicatorProps {
  status:
    | "online"
    | "offline"
    | "pending"
    | "live"
    | "connected"
    | "disconnected"
    | "active"
    | "inactive";
  icon?: React.ReactNode;
}

export function StatusIndicator({ status, icon }: StatusIndicatorProps) {
  const isGood = ["online", "live", "connected", "active"].includes(status.toLowerCase());
  const isPending = ["pending"].includes(status.toLowerCase());

  return (
    <div
      className={cn(
        "inline-flex font-retro-body",
        isGood ? "text-green-400 blink" : isPending ? "text-yellow-400" : "text-red-400",
      )}
    >
      <Badge variant={isGood ? "default" : isPending ? "secondary" : "destructive"}>
        {icon && <span className="mr-2">{icon}</span>}
        {status.toUpperCase()}
      </Badge>
    </div>
  );
}
