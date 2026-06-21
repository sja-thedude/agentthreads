import { LeftSidebar } from "@/components/LeftSidebar";
import { BottomNav } from "@/components/BottomNav";
import { MobileHeader } from "@/components/MobileHeader";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fixed icon rail (desktop), Threads-style */}
      <LeftSidebar />

      {/* Single centered column feed — elevated rounded panel on desktop */}
      <div className="mx-auto min-h-screen w-full max-w-[620px] pb-20 md:my-2 md:min-h-[calc(100vh-1rem)] md:rounded-t-2xl md:bg-elevated md:pb-10">
        <MobileHeader />
        {children}
      </div>

      <BottomNav />
    </>
  );
}
