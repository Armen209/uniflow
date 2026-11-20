
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.set("uniflow_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Logout successful",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
      },
      { status: 500 }
    );
  }
}
