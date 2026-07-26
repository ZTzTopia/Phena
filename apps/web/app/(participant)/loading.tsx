"use client";

import LoadingScreen from "@phena/ui/components/8bit/blocks/loading-screen";
import { useState } from "react";
import { useMountEffect } from "@/hooks/use-mount-effect";

const tips = [
  "Insert coin to continue...",
  "Every flag you capture grants XP!",
  "Check your inventory for useful recon tools.",
  "Save point reached! Progress auto-saved.",
  "Read the quest description before casting spells.",
  "Hidden bonus stage: Check dev tools for extra flags.",
  "Multiplayer bonus: Team up for combo attacks!",
  "Boss arena: Exploit the CVE for critical damage.",
  "Grinding XP: Complete easy challenges first to level up.",
  "Timer is running! Speedrun the SQL injection challenge.",
  "Armor up: Sanitize your inputs before sending.",
  "Critical hit! Your payload executed successfully.",
  "Area unlocked: Burp Suite reveals hidden network paths.",
  "Achievement unlocked: First blood - capture the initial flag.",
  "Game over? No, just respawn. Read the error logs.",
];

export default function Loading() {
  const [randomTips, setRandomTips] = useState<string[]>([]);

  useMountEffect(() => {
    setRandomTips(tips.sort(() => 0.5 - Math.random()).slice(0, 4));
  });

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center">
      <LoadingScreen
        tips={randomTips}
        text="Loading"
        autoProgress={true}
        autoProgressDuration={16000}
      />
    </div>
  );
}
