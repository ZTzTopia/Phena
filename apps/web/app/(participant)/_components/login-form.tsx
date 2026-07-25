"use client";
/* eslint-disable react/no-children-prop */
import type { AuthModel } from "@phena/schema";
import { Button } from "@phena/ui/components/8bit/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@phena/ui/components/8bit/card";
import { Input } from "@phena/ui/components/8bit/input";
import { Field, FieldError, FieldLabel } from "@phena/ui/components/field";
import { cn } from "@phena/ui/lib/utils";
import { useLoginForm } from "@/hooks/use-login-form";

export function LoginForm({
  className,
  onFormSubmit,
  isLoading,
  ...props
}: {
  className?: string;
  onFormSubmit?: (data: AuthModel["login"]) => void;
  isLoading?: boolean;
}) {
  const { form } = useLoginForm({
    onSubmit: onFormSubmit,
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription className="text-xs">
            Enter your team name to login to your account
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
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="name">Team Name</FieldLabel>
                      <Input
                        id="name"
                        name={field.name}
                        type="text"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter your team name"
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
