
import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ProfessorSidebar } from "./professor-sidebar";

export function ProfessorShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <ProfessorSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          title="Professor Dashboard"
          subtitle="Manage your courses and students"
        />

        <main className="flex-1 p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
