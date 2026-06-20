"use client";

import { ThemeProvider } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { UIProvider } from "@/lib/ui";
import { ComposeModal } from "@/components/ComposeModal";
import { AuthModal } from "@/components/AuthModal";
import { Toaster } from "@/components/Toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <UIProvider>
            {children}
            <ComposeModal />
            <AuthModal />
            <Toaster />
          </UIProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
