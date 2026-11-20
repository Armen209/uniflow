
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export function DashboardHeader({
  title = "Student Dashboard",
  subtitle = "Manage your academic activities",
}: DashboardHeaderProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);

  async function handleLogout() {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      clearUser();

      router.replace("/login");
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  return (
    <header className="flex h-20 items-center justify-between border-b border-border bg-surface px-6 md:px-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>

      <div className="flex items-center gap-5">
        {user && (
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-foreground">
              {user.full_name}
            </p>
            <p className="text-xs text-muted">
              {user.email}
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          disabled={loading}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-background disabled:opacity-50"
        >
          {loading ? "Logging out..." : "Log out"}
        </button>
      </div>
    </header>
  );
}
