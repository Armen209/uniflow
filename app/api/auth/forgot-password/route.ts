
import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/email";

import {
  findUserByEmail,
  createPasswordResetToken,
} from "@/lib/services/user.service";

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { email } = body as Record<string, unknown>;

    if (typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "A valid email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
      !normalizedEmail ||
      normalizedEmail.length > 255 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return NextResponse.json(
        { success: false, message: "A valid email is required" },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(normalizedEmail);

    if (user) {
     const resetToken = await createPasswordResetToken(user.id);

     try {
       await sendPasswordResetEmail(user.email, resetToken);
     } catch (emailError) {
       console.error("Password reset email could not be sent:", emailError);
     }
        }

    return NextResponse.json(
      {
        success: true,
        message:
          "If an account exists with this email, password reset instructions will be sent.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      { success: false, message: "Password recovery request failed" },
      { status: 500 }
    );
  }
}
