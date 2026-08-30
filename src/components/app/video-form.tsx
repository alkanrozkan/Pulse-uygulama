"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Plus, X } from "lucide-react";
import { addVideo, type VideoState } from "@/app/actions/videos";
import { Button } from "@/components/ui/button";
import { FieldRow, Hint, Input, Label, Select } from "@/components/ui/field";
import { ErrorNote } from "@/components/ui/states";
import { FORMAT_OPTIONS } from "@/lib/labels";

const INITIAL: VideoState = { error: null };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {pending ? "Saving…" : "Save video"}
    </Button>
  );
}

export function VideoForm({ defaultPlatform }: { defaultPlatform: "tiktok" | "instagram" }) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useFormState(addVideo, INITIAL);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add a video
      </Button>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="card space-y-5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-semibold">Add a video</h2>
          <p className="mt-1 text-xs text-muted">
            Copy the numbers straight from your analytics. Pulse reads the hook text to work out the
            hook style — you don&rsquo;t need to categorise it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-soft p-1 text-muted hover:bg-raised hover:text-ink"
          aria-label="Close form"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <FieldRow>
        <div>
          <Label htmlFor="platform">Platform</Label>
          <Select id="platform" name="platform" defaultValue={defaultPlatform} required>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="posted_at">Posted on</Label>
          <Input id="posted_at" name="posted_at" type="datetime-local" required />
          <Hint>The time matters — it feeds your best posting window.</Hint>
        </div>
      </FieldRow>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required placeholder="How I edit a reel in 4 minutes" />
      </div>

      <div>
        <Label htmlFor="hook">Hook</Label>
        <Input
          id="hook"
          name="hook"
          required
          placeholder="Stop editing your reels like this"
        />
        <Hint>The literal first line, word for word.</Hint>
      </div>

      <FieldRow>
        <div>
          <Label htmlFor="topic">Topic</Label>
          <Input id="topic" name="topic" required placeholder="Editing workflow" />
          <Hint>Reuse the same wording across videos so they group.</Hint>
        </div>
        <div>
          <Label htmlFor="format">Format</Label>
          <Select id="format" name="format" defaultValue="talking_head" required>
            {FORMAT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        </div>
      </FieldRow>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <NumberField name="views" label="Views" required />
        <NumberField name="likes" label="Likes" />
        <NumberField name="comments" label="Comments" />
        <NumberField name="shares" label="Shares" />
        <NumberField name="saves" label="Saves" />
        <NumberField name="duration_seconds" label="Duration (s)" required min={1} />
      </div>

      {state.error && <ErrorNote message={state.error} />}
      {state.success && (
        <p className="rounded-soft border border-pos/30 bg-pos/[0.06] px-4 py-3 text-sm text-pos">
          Saved. Add another, or head to Today for fresh ideas.
        </p>
      )}

      <div className="flex items-center gap-2">
        <Submit />
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Done
        </Button>
      </div>
    </form>
  );
}

function NumberField({
  name,
  label,
  required,
  min = 0,
}: {
  name: string;
  label: string;
  required?: boolean;
  min?: number;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type="number"
        inputMode="numeric"
        min={min}
        defaultValue={required ? undefined : 0}
        required={required}
        className="font-mono"
      />
    </div>
  );
}
