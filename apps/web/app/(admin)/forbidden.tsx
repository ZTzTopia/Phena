import { Button } from "@phena/ui/components/button";
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="bg-background px-x mx-auto flex min-h-svh flex-col items-center justify-center gap-5 text-center">
      <div className="text-6xl font-bold tracking-tight sm:text-8xl">403</div>

      <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Access Denied</h1>

      <p className="text-muted-foreground text-xs">
        You do not have permission to access this area.
      </p>

      <div className="flex justify-center">
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    </div>
  );
}
