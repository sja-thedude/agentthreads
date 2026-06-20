"use client";

import { Modal } from "@/components/Modal";
import { Composer } from "@/components/Composer";
import { PostCard } from "@/components/PostCard";
import { useUI } from "@/lib/ui";
import { useT } from "@/lib/i18n";

export function ComposeModal() {
  const { composerOpen, composerReplyTo, closeComposer } = useUI();
  const t = useT();
  const replyTo = composerReplyTo?.post ?? null;

  return (
    <Modal open={composerOpen} onClose={closeComposer} labelledBy="compose-title">
      <div className="border-b border-border px-4 py-3.5">
        <h2 id="compose-title" className="text-center text-[15px] font-bold">
          {replyTo ? t("composer.reply") : t("composer.newThread")}
        </h2>
      </div>

      {replyTo && (
        <div className="border-b border-border pt-2 opacity-80">
          <PostCard post={replyTo} emphasize />
        </div>
      )}

      <Composer replyTo={replyTo} onPosted={closeComposer} />
    </Modal>
  );
}
