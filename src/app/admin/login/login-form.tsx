"use client";

import { useActionState, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { loginSchema, type LoginInput } from "@/domain/schemas";
import { signInAction, type SignInActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Checkbox } from "@/components/ui/input";
import { Icon } from "@/components/shared/icon";

const initialState: SignInActionState = { ok: true };

/** Admin login form (react-hook-form + loginSchema, server action submit). */
export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    formState: { errors },
  } = useForm<z.input<typeof loginSchema>, unknown, LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", keepSignedIn: false },
    mode: "onSubmit",
  });

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[12px] border border-danger/30 bg-danger/5 p-3 text-small text-danger"
        >
          <Icon name="AlertTriangle" className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{state.error}</span>
        </div>
      ) : null}

      <Field label="Work email" htmlFor="email" error={errors.email?.message} required>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="you@yourplatform.test"
          aria-invalid={errors.email ? true : undefined}
          {...register("email")}
        />
      </Field>

      <Field label="Password" htmlFor="password" error={errors.password?.message} required>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pr-11"
            aria-invalid={errors.password ? true : undefined}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-[8px] text-text-tertiary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            <Icon name={showPassword ? "EyeOff" : "Eye"} className="size-5" aria-hidden />
          </button>
        </div>
      </Field>

      <div className="flex items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-small text-text-secondary">
          <Checkbox {...register("keepSignedIn")} />
          Keep me signed in
        </label>
        <a
          href="#"
          aria-disabled="true"
          className="text-small font-medium text-text-tertiary"
          title="Password resets are handled by your platform administrator."
          onClick={(e) => e.preventDefault()}
        >
          Forgot password?
        </a>
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? <Icon name="Loader2" className="size-4 animate-spin" aria-hidden /> : null}
        {pending ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-xs text-text-tertiary">
        Authorized YourPlatform team access only.
      </p>
    </form>
  );
}
