"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signIn, signUp, type AuthState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Hint, Input, Label } from "@/components/ui/field";
import { ErrorNote } from "@/components/ui/states";
import { Logo } from "./logo";

const INITIAL: AuthState = { error: null };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" loading={pending}>
      {pending ? "Working…" : label}
    </Button>
  );
}

export function AuthForm({ mode, next }: { mode: "sign-in" | "sign-up"; next?: string }) {
  const action = mode === "sign-in" ? signIn : signUp;
  const [state, formAction] = useFormState(action, INITIAL);

  const isSignIn = mode === "sign-in";

  return (
    <div className="mx-auto w-full max-w-sm">
      <Link href="/" className="mb-10 inline-flex" aria-label="Pulse home">
        <Logo />
      </Link>

      <h1 className="font-display text-2xl font-bold">
        {isSignIn ? "Sign in to Pulse" : "Create your account"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {isSignIn
          ? "Pick up where your account left off."
          : "Log a handful of videos and Pulse starts reading your patterns."}
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        {next && <input type="hidden" name="next" value={next} />}

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignIn ? "current-password" : "new-password"}
            required
            minLength={isSignIn ? undefined : 8}
            placeholder="••••••••"
          />
          {!isSignIn && <Hint>At least 8 characters.</Hint>}
        </div>

        {state.error && <ErrorNote message={state.error} />}

        <SubmitButton label={isSignIn ? "Sign in" : "Create account"} />
      </form>

      <p className="mt-6 text-sm text-muted">
        {isSignIn ? "No account yet? " : "Already have an account? "}
        <Link
          href={isSignIn ? "/signup" : "/login"}
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          {isSignIn ? "Create one" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
