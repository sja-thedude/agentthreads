import { LeftSidebar } from "@/components/LeftSidebar";
import { BottomNav } from "@/components/BottomNav";
import { MobileHeader } from "@/components/MobileHeader";
import { RightAuthPanel } from "@/components/RightAuthPanel";
import { DesktopLoginButton } from "@/components/LoginButton";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fixed icon rail. Top-right Log in pill for the tablet range; at lg+ the
          right-hand login section takes over. */}
      <LeftSidebar />
      <DesktopLoginButton />

      <div className="flex justify-center">
        {/* Spacer reserves the fixed rail's width so content never sits under it */}
        <div aria-hidden className="hidden w-[76px] shrink-0 sm:block" />

        {/* Single centered black column feed */}
        <div className="min-h-screen w-full max-w-[620px] pb-20 sm:border-x sm:border-border sm:pb-6">
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
