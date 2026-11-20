"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../schemas/forgot-password.schema";

import { requestPasswordReset } from "../api/forgot-password";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setServerError("");
    setSuccessMessage("");

    try {
      const result = await requestPasswordReset(values);
      setSuccessMessage(result.message);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
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
        disabled={isSubmitting || !!successMessage}
      />

      {serverError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-error" role="alert">
          {serverError}
        </p>
      )}

      {successMessage && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700" role="status">
          {successMessage}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting || !!successMessage}
      >
        {isSubmitting ? "Sending..." : "Send reset link"}
      </Button>

      <div className="text-center">
        <Link
          href="/login"
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
