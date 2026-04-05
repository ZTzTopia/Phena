import { Button } from "@phena/ui/components/button";
import { useSidebar } from "@phena/ui/components/sidebar";
import { cn } from "@phena/ui/lib/utils";
import { ArrowBarLeft, ArrowBarRight } from "pixelarticons/react";

export function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { open, isMobile, toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      {!open || isMobile ? <ArrowBarRight /> : <ArrowBarLeft />}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
