"use client";

import { SidebarInset, SidebarProvider } from "@phena/ui/components/sidebar";
import { Toaster } from "@phena/ui/components/sonner";
import { AdminSidebar } from "@/app/(admin)/_components/sidebar";
import { AdminSiteHeader } from "@/app/(admin)/_components/site-header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AdminSidebar variant="floating" />
        <SidebarInset>
          <AdminSiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </>
  );
}
