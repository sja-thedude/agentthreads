import { LeftSidebar } from "@/components/LeftSidebar";
import { BottomNav } from "@/components/BottomNav";
import { MobileHeader } from "@/components/MobileHeader";
import { RightAuthPanel } from "@/components/RightAuthPanel";
import { DesktopLoginButton } from "@/components/LoginButton";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fixed icon rail (desktop) + top-right Log in pill */}
      <LeftSidebar />
      <DesktopLoginButton />

      <div className="flex justify-center">
        {/* Spacer reserves the fixed rail's width so content never sits under it */}
        <div aria-hidden className="hidden w-[76px] shrink-0 md:block" />

        {/* Single centered column feed — elevated rounded panel on desktop */}
        <div className="min-h-screen w-full max-w-[620px] pb-20 md:my-2 md:min-h-[calc(100vh-1rem)] md:rounded-t-2xl md:bg-elevated md:pb-10">
          <MobileHeader />
          {children}
        </div>

        {/* Right login section (desktop, signed-out) */}
        <RightAuthPanel />
      </div>

      <BottomNav />
    </>
  );
}
