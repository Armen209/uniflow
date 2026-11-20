
import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Authenticated user retrieved successfully",
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    unstable_rethrow(error);

    console.error("Authentication error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify session",
      },
      { status: 500 }
    );
  }
}
