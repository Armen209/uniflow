import { Card } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            UniFlow
          </h1>

          <p className="mt-2 text-sm text-muted">
            University Management System
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-muted">
            Sign in to continue to your account.
          </p>
        </div>

        <LoginForm />
      </Card>
    </main>
  );
}