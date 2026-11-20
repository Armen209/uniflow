
import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AdminSidebar } from "./admin-sidebar";

export function AdminShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          title="Admin Dashboard"
          subtitle="Manage your university platform"
        />

        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
