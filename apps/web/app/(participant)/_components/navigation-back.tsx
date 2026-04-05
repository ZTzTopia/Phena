import { Button } from "@phena/ui/components/8bit/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

interface NavigationBackProps {
  href: string;
}

export function NavigationBack({ href }: NavigationBackProps) {
  return (
    <div className="font-retro-body mr-4 inline-flex">
      <Button variant="ghost" size="icon" asChild>
        <Link href={href}>
          <ArrowLeftIcon className="size-5" />
        </Link>
      </Button>
    </div>
  );
}
