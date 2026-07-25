"use client";

import type { AuthModel } from "@phena/schema";
import { Alert, AlertDescription } from "@phena/ui/components/8bit/alert";
import { Button } from "@phena/ui/components/8bit/button";
import { DetailedError, parseResponse } from "hono/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "@phena/ui/components/8bit/styles/retro.css";
import { useCallback, useState } from "react";
import { LoginForm } from "@/app/(participant)/_components/login-form";
import { useAuth } from "@/app/auth-provider";
import { client } from "@/lib/api-client";

export function HomeLogin() {
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const { setTeam } = useAuth();
  const router = useRouter();

  const handleSubmit = useCallback(
    async (data: AuthModel["login"]) => {
      setFormLoading(true);

      try {
        const res = await parseResponse(
          client.api.auth.login.$post({
            json: { name: data.name, password: data.password, role: "team" },
          }),
        );

        setTeam(res.team);
        router.replace("/contest");
      } catch (err) {
        setError(
          err instanceof DetailedError ? err.detail.data.error : "An unexpected error occurred",
        );
      } finally {
        setFormLoading(false);
      }
    },
    [setTeam, router],
  );

  return (
    <div className="mx-auto flex min-h-svh min-w-md flex-col justify-center gap-6 px-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <LoginForm onFormSubmit={handleSubmit} isLoading={formLoading} />
      <Button
        onClick={() => {
          setError(null);
          setFormLoading(true);
          handleSubmit({ name: "43LK0DM", password: "123", role: "team" });
        }}
        variant="secondary"
      >
        Login as Demo
      </Button>
      <div className="flex justify-center gap-4 text-xs">
        <Button variant="link" asChild>
          <Link href="/contest/battle-map">Battle Map</Link>
        </Button>
        <Button variant="link" asChild>
          <Link href="/contest/rankings">Rankings</Link>
        </Button>
      </div>
    </div>
  );
}
