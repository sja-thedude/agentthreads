import { LeftSidebar } from "@/components/LeftSidebar";
import { BottomNav } from "@/components/BottomNav";
import { MobileHeader } from "@/components/MobileHeader";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fixed icon rail (desktop), Threads-style */}
      <LeftSidebar />

      {/* Single centered column feed */}
      <div className="mx-auto min-h-screen w-full max-w-[620px] px-0 pb-20 md:pb-10">
        <MobileHeader />
        {children}
      </div>

      <BottomNav />
    </>
  );
}
