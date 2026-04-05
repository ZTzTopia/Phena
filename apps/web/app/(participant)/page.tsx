"use client";

import type { AuthModel } from "@phena/schema";
import { Alert, AlertDescription } from "@phena/ui/components/8bit/alert";
import { DetailedError, parseResponse } from "hono/client";
import { useRouter } from "next/navigation";
import "@phena/ui/components/8bit/styles/retro.css";
import { useState } from "react";
import { LoginForm } from "@/app/(participant)/_components/login-form";
import { client } from "@/lib/api-client";

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: AuthModel["login"]) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await parseResponse(
        client.api.auth.login.$post({
          json: { name: data.name, password: data.password },
        }),
      );

      if (res.team.role === "admin") {
        setError("You are not authorized to access this page.");
      } else {
        router.push("/contest");
      }
    } catch (err) {
      setError(
        err instanceof DetailedError ? err.detail.data.error : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col justify-center gap-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {isLoading && (
        <Alert>
          <AlertDescription>Loading...</AlertDescription>
        </Alert>
      )}
      <LoginForm onFormSubmit={handleSubmit} />
      <button
        type="button"
        onClick={() => {
          setError(null);
          setIsLoading(true);
          handleSubmit({ name: "43LK0DM", password: "123" });
        }}
        className="text-muted-foreground hover:text-primary text-center text-xs"
      >
        Login as Demo
      </button>
    </div>
  );
}
