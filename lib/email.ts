
import "server-only";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
) {
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    throw new Error("APP_URL is not configured");
  }

  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(
    resetToken
  )}`;

  const { data, error } = await resend.emails.send({
    from: "UniFlow <onboarding@resend.dev>",
    to: email,
    subject: "Reset your UniFlow password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Password Reset</h2>
        <p>We received a request to reset your UniFlow password.</p>
        <p>Click the button below to choose a new password:</p>
        <a
          href="${resetUrl}"
          style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;"
        >
          Reset Password
        </a>
        <p>This link expires in 15 minutes.</p>
        <p>If you did not request a password reset, you can ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error("Failed to send password reset email");
  }

  return data;
}
