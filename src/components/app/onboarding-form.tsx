"use client";

import { useFormState, useFormStatus } from "react-dom";
import { completeOnboarding, type ProfileState } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { ErrorNote } from "@/components/ui/states";
import { ProfileFields } from "./profile-fields";
import { Logo } from "./logo";

const INITIAL: ProfileState = { error: null };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" loading={pending}>
      {pending ? "Saving…" : "Start analysing"}
    </Button>
  );
}

export function OnboardingForm() {
  const [state, formAction] = useFormState(completeOnboarding, INITIAL);

  return (
    <div className="mx-auto w-full max-w-xl">
      <Logo className="mb-10" />

      <p className="eyebrow mb-3">Step 1 of 2</p>
      <h1 className="font-display text-2xl font-bold">Tell Pulse who it&rsquo;s reading for</h1>
      <p className="mt-2 text-sm text-muted">
        This shapes the language, the angles and the benchmarks. You can change any of it later.
      </p>

      <form action={formAction} className="mt-8 space-y-6">
        <ProfileFields />
        {state.error && <ErrorNote message={state.error} />}
        <Submit />
        <p className="text-center text-xs text-muted">
          Next: log a few videos so the first recommendations aren&rsquo;t guesses.
        </p>
      </form>
    </div>
  );
}
