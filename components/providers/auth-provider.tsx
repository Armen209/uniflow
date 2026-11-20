"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useAuthStore, type AuthUser } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialized = useRef(false);

  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!response.ok) {
          clearUser();
          return;
        }

        const result: {
          success: boolean;
          data?: AuthUser;
        } = await response.json();

        if (result.success && result.data) {
          setUser(result.data);
        } else {
          clearUser();
        }
      } catch {
        clearUser();
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, [setUser, clearUser, setLoading]);

  return <>{children}</>;
}