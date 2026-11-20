
import type { LoginFormValues } from "../schemas/login.schema";

type LoginResponse = {
  success: boolean;
  message: string;
  data?: {
    id: number;
    full_name: string;
    email: string;
    role: "student" | "professor" | "admin";
  };
};

export async function loginUser(values: LoginFormValues) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify(values),
  });

  const result: LoginResponse = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "Login failed");
  }

  return result.data;
}
