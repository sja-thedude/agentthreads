import { LeftSidebar } from "@/components/LeftSidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { BottomNav } from "@/components/BottomNav";
import { MobileHeader } from "@/components/MobileHeader";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1300px] justify-center">
      <LeftSidebar />

      <main className="min-h-screen w-full max-w-[640px] flex-1 border-x border-border pb-20 md:pb-0">
        <MobileHeader />
        {children}
      </main>

      <RightSidebar />

      <BottomNav />
    </div>
  );
}
