"use client";

import { SidebarInset, SidebarProvider } from "@phena/ui/components/sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { ParticipantSiteHeader } from "@/app/(participant)/_components/site-header";
import { ParticipantSidebar } from "./_components/sidebar";

export default function ParticipantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(pathname !== "/");

  useEffect(() => {
    setSidebarOpen(pathname !== "/");
  }, [pathname]);

  return (
    <>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      >
        <div className="retro pixelated flex min-h-svh w-full">
          <ParticipantSidebar className="border-foreground dark:border-ring border-r-6! border-dashed" />
          <SidebarInset>
            <ParticipantSiteHeader />
            <main className="flex flex-1 p-6">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
      <Toaster />
    </>
  );
}
