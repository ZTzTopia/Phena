import { Button } from "@phena/ui/components/8bit/button";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="retro bg-background px-x flex min-h-svh flex-col items-center justify-center gap-5 text-center">
      <div className="retro text-6xl font-bold tracking-tight sm:text-8xl">404</div>

      <h1 className="retro text-2xl font-bold tracking-tight sm:text-4xl">Page not found</h1>

      <p className="retro text-muted-foreground text-xs">
        Looks like this route crawled out of the crypt and disappeared again.
      </p>

      <div className="flex justify-center">
        <Link href="/contest">
          <Button>Return to Contest</Button>
        </Link>
      </div>
    </div>
  );
}
