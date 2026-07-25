"use client";

import type { AuthModel } from "@phena/schema";
import { Alert, AlertDescription } from "@phena/ui/components/alert";
import { Button } from "@phena/ui/components/button";
import { DetailedError, parseResponse } from "hono/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { LoginForm } from "@/app/admin/_components/login-form";
import { useAuth } from "@/app/auth-provider";
import { client } from "@/lib/api-client";

export function AdminLogin() {
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
            json: { name: data.name, password: data.password, role: "admin" },
          }),
        );

        setTeam(res.team);
        router.replace("/admin/dashboard");
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
          handleSubmit({ name: "Admin Team", password: "admin", role: "admin" });
        }}
        variant="secondary"
      >
        Login as Demo
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        Looking for the competition?{" "}
        <Link href="/" className="hover:text-primary underline underline-offset-4">
          Participant Login
        </Link>
      </p>
    </div>
  );
}
