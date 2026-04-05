"use client";

/* eslint-disable react/no-children-prop */
import type { AuthModel } from "@phena/schema";
import { Alert, AlertDescription } from "@phena/ui/components/alert";
import { Button } from "@phena/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@phena/ui/components/card";
import { Field, FieldError, FieldLabel } from "@phena/ui/components/field";
import { Input } from "@phena/ui/components/input";
import { cn } from "@phena/ui/lib/utils";
import { useLoginForm } from "@/hooks/use-login-form";

export function AdminLoginForm({
  className,
  onFormSubmit,
  error,
  isLoading,
  autoFillValues,
  ...props
}: {
  className?: string;
  onFormSubmit?: (data: AuthModel["login"]) => void;
  error?: string | null;
  isLoading?: boolean;
  autoFillValues?: { name: string; password: string };
}) {
  const { form, setFieldValue } = useLoginForm({
    onSubmit: onFormSubmit,
  });

  if (autoFillValues) {
    setFieldValue("name", autoFillValues.name);
    setFieldValue("password", autoFillValues.password);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription className="text-xs">
            Enter your admin credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <div className="flex flex-col gap-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="name">Name</FieldLabel>
                      <Input
                        id="name"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter your name"
                        aria-invalid={isInvalid}
                        required
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
              <form.Field
                name="password"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Input
                        id="password"
                        name={field.name}
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="********"
                        aria-invalid={isInvalid}
                        required
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
