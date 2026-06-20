"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { useT } from "@/lib/i18n";

export function EditProfile() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useUI();
  const t = useT();
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [website, setWebsite] = useState(profile?.website ?? "");
  const [saving, setSaving] = useState(false);

  if (!profile) return null;

  const inputClass =
    "w-full rounded-xl border border-border-strong bg-[var(--bg)] px-3.5 py-2.5 text-[15px] text-text outline-none transition-colors focus:border-[var(--brand)]";

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || profile!.display_name,
        bio: bio.trim(),
        website: website.trim() || null,
      })
      .eq("id", profile!.id);
    setSaving(false);
    if (error) {
      toast(t("common.somethingWrong"));
      return;
    }
    toast(t("edit.saved"));
    setOpen(false);
    await refreshProfile();
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-border-strong px-5 py-2 text-[15px] font-semibold transition-colors hover:bg-card-hover"
      >
        {t("profile.editProfile")}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} labelledBy="edit-title">
        <div className="border-b border-border px-4 py-3.5">
          <h2 id="edit-title" className="text-center text-[15px] font-bold">
            {t("edit.title")}
          </h2>
        </div>
        <div className="flex flex-col gap-4 p-5">
          <Field label={t("edit.displayName")}>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              className={inputClass}
            />
          </Field>
          <Field label={t("edit.bio")}>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>
          <Field label={t("edit.website")}>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="example.com"
              className={inputClass}
            />
          </Field>
          <button
            onClick={save}
            disabled={saving}
            className="mt-1 rounded-full bg-text px-5 py-2.5 font-semibold text-[var(--bg)] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? t("edit.saving") : t("edit.save")}
          </button>
        </div>
      </Modal>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
