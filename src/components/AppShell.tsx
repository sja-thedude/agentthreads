import { LeftSidebar } from "@/components/LeftSidebar";
import { BottomNav } from "@/components/BottomNav";
import { MobileHeader } from "@/components/MobileHeader";
import { RightAuthPanel } from "@/components/RightAuthPanel";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fixed icon rail (tablet/desktop). Desktop login lives in the right panel. */}
      <LeftSidebar />

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
