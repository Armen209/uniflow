import type { ForgotPasswordFormValues } from "../schemas/forgot-password.schema";

type ForgotPasswordResponse = {
  success: boolean;
  message: string;
};

export async function requestPasswordReset(
  values: ForgotPasswordFormValues
) {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify(values),
  });

  const result: ForgotPasswordResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Password recovery failed");
  }

  return result;
}
