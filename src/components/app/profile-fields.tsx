"use client";

import { FieldRow, Hint, Input, Label, Select } from "@/components/ui/field";
import type { CreatorProfileRow } from "@/lib/types/database";

/** Shared between onboarding and the profile page so the two never drift. */
export function ProfileFields({ profile }: { profile?: CreatorProfileRow | null }) {
  return (
    <div className="space-y-5">
      <FieldRow>
        <div>
          <Label htmlFor="display_name">Name</Label>
          <Input
            id="display_name"
            name="display_name"
            required
            defaultValue={profile?.display_name ?? ""}
            placeholder="Alex Moreno"
          />
        </div>
        <div>
          <Label htmlFor="niche">Niche</Label>
          <Input
            id="niche"
            name="niche"
            required
            defaultValue={profile?.niche ?? ""}
            placeholder="Home coffee brewing"
          />
          <Hint>Be specific. &ldquo;Home coffee brewing&rdquo; beats &ldquo;food&rdquo;.</Hint>
        </div>
      </FieldRow>

      <div>
        <Label htmlFor="main_platform">Main platform</Label>
        <Select
          id="main_platform"
          name="main_platform"
          defaultValue={profile?.main_platform ?? "tiktok"}
        >
          <option value="tiktok">TikTok</option>
          <option value="instagram">Instagram</option>
          <option value="both">Both, roughly evenly</option>
        </Select>
      </div>

      <FieldRow>
        <div>
          <Label htmlFor="tiktok_username">TikTok username</Label>
          <Input
            id="tiktok_username"
            name="tiktok_username"
            defaultValue={profile?.tiktok_username ?? ""}
            placeholder="@yourhandle"
          />
        </div>
        <div>
          <Label htmlFor="instagram_username">Instagram username</Label>
          <Input
            id="instagram_username"
            name="instagram_username"
            defaultValue={profile?.instagram_username ?? ""}
            placeholder="@yourhandle"
          />
        </div>
      </FieldRow>

      <FieldRow>
        <div>
          <Label htmlFor="audience_country">Audience country</Label>
          <Input
            id="audience_country"
            name="audience_country"
            defaultValue={profile?.audience_country ?? ""}
            placeholder="Türkiye"
          />
          <Hint>Where most of your viewers are, not where you are.</Hint>
        </div>
        <div>
          <Label htmlFor="content_language">Content language</Label>
          <Input
            id="content_language"
            name="content_language"
            required
            defaultValue={profile?.content_language ?? "en"}
            placeholder="English"
          />
          <Hint>Ideas and captions are written in this language.</Hint>
        </div>
      </FieldRow>
    </div>
  );
}
