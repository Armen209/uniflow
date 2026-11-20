"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginFormValues } from "../schemas/login.schema";
import { loginUser } from "../api/login";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError("");

    try {
      const user = await loginUser(values);
      setUser(user);

      const dashboardRoutes = {
        student: "/student/dashboard",
        professor: "/professor/dashboard",
        admin: "/admin/dashboard",
      };

      router.replace(dashboardRoutes[user.role]);
      router.refresh();
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Email address"
        id="email"
        type="email"
        placeholder="Enter your email"
        autoComplete="email"
        {...register("email")}
        error={errors.email?.message}
      />

      <div className="space-y-2">
        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          {...register("password")}
          error={errors.password?.message}
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-error" role="alert">
          {serverError}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}