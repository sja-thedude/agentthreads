"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { PostWithAuthor } from "@/lib/types";

type Toast = { id: number; message: string };

type ComposerTarget = { post: PostWithAuthor } | null;

type UIContextValue = {
  toasts: Toast[];
  toast: (message: string) => void;
  dismissToast: (id: number) => void;

  composerOpen: boolean;
  composerReplyTo: ComposerTarget;
  openComposer: (replyTo?: PostWithAuthor) => void;
  closeComposer: () => void;

  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
};

const UIContext = createContext<UIContextValue | null>(null);

let toastSeq = 0;

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerReplyTo, setComposerReplyTo] = useState<ComposerTarget>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message: string) => {
      const id = ++toastSeq;
      setToasts((t) => [...t, { id, message }]);
      setTimeout(() => dismissToast(id), 2800);
    },
    [dismissToast]
  );

  const openComposer = useCallback((replyTo?: PostWithAuthor) => {
    setComposerReplyTo(replyTo ? { post: replyTo } : null);
    setComposerOpen(true);
  }, []);
  const closeComposer = useCallback(() => {
    setComposerOpen(false);
    setComposerReplyTo(null);
  }, []);

  const openAuthModal = useCallback(() => setAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  const value = useMemo(
    () => ({
      toasts,
      toast,
      dismissToast,
      composerOpen,
      composerReplyTo,
      openComposer,
      closeComposer,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
    }),
    [
      toasts,
      toast,
      dismissToast,
      composerOpen,
      composerReplyTo,
      openComposer,
      closeComposer,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
    ]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}
