
import type { ReactNode } from "react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";

export function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />

        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
