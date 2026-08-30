"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveProfile, type ProfileState } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { ErrorNote } from "@/components/ui/states";
import { ProfileFields } from "./profile-fields";
import type { CreatorProfileRow } from "@/lib/types/database";

const INITIAL: ProfileState = { error: null };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function ProfileForm({ profile }: { profile: CreatorProfileRow }) {
  const [state, formAction] = useFormState(saveProfile, INITIAL);

  return (
    <form action={formAction} className="card space-y-6 p-5">
      <ProfileFields profile={profile} />
      {state.error && <ErrorNote message={state.error} />}
      {state.success && (
        <p className="rounded-soft border border-pos/30 bg-pos/[0.06] px-4 py-3 text-sm text-pos">
          Saved.
        </p>
      )}
      <Submit />
    </form>
  );
}
