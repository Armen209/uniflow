import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Forgot your password?
          </h1>

          <p className="text-sm text-muted">
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </main>
  );
}
