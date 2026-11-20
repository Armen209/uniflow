
import { NextResponse } from "next/server";

import { resetUserPassword } from "@/lib/services/user.service";

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body." },
        { status: 400 }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    // Use newPassword to match the frontend.
    const { token, newPassword } = body as Record<string, unknown>;

    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/i.test(token)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset link." },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string") {
      return NextResponse.json(
        { success: false, message: "Please enter a valid password." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long.",
        },
        { status: 400 }
      );
    }

    if (Buffer.byteLength(newPassword, "utf8") > 72) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is too long. Please choose a shorter password.",
        },
        { status: 400 }
      );
    }

    const passwordUpdated = await resetUserPassword(
      token,
      newPassword
    );

    if (!passwordUpdated) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset link." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Password has been reset successfully. Please log in with your new password.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      { success: false, message: "Password reset failed." },
      { status: 500 }
    );
  }
}
