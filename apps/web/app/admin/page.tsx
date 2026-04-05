"use client";

import type { AuthModel } from "@phena/schema";
import { DetailedError, parseResponse } from "hono/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminLoginForm } from "@/app/admin/_components/admin-login-form";
import { useAuth } from "@/app/auth-provider";
import { client } from "@/lib/api-client";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
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

      if (res.team.role !== "admin") {
        throw new Error("Access denied. Admin credentials required.");
      }

      login(res.team);

      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 0);
    } catch (err) {
      setError(
        err instanceof DetailedError
          ? err.detail.data.error
          : err instanceof Error
            ? err.message
            : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-6">
      <AdminLoginForm onFormSubmit={handleSubmit} error={error} isLoading={isLoading} />
      <button
        type="button"
        onClick={() => {
          setError(null);
          setIsLoading(true);
          handleSubmit({ name: "Admin Team", password: "admin" });
        }}
        className="text-muted-foreground hover:text-primary text-center text-xs"
      >
        Login as Demo
      </button>
      <p className="text-muted-foreground text-center text-sm">
        Looking for the competition?{" "}
        <Link href="/" className="hover:text-primary underline underline-offset-4">
          Participant Login
        </Link>
      </p>
    </div>
  );
}
