
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

import {
  findUserByEmail,
  verifyPassword,
} from "@/lib/services/user.service";

export async function POST(request: Request) {
  try {
    // 1. Read incoming JSON
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // 2. Check request body
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

    const { email, password } = body as Record<string, unknown>;

    // 3. Validate field types
    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // 4. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !normalizedEmail ||
      normalizedEmail.length > 255 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
      !password ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 400 }
      );
    }

    // 5. Find user in MySQL
    const user = await findUserByEmail(normalizedEmail);

    // 6. Check password
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 7. Get session secret
    const sessionSecret = process.env.SESSION_SECRET;

    if (!sessionSecret) {
      throw new Error("SESSION_SECRET is not configured");
    }

    const secretKey = new TextEncoder().encode(sessionSecret);

    // 8. Create signed session token
    const token = await new SignJWT({
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(String(user.id))
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secretKey);

    // 9. Store token in an HttpOnly cookie
    const cookieStore = await cookies();

    cookieStore.set("uniflow_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    // 10. Return safe user information
    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}
