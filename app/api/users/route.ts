
import { NextResponse } from "next/server";

import {
  getAllUsers,
  createStudent,
} from "@/lib/services/user.service";

// GET: Retrieve all users
export async function GET() {
  try {
    const users = await getAllUsers();

    return NextResponse.json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error retrieving users:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve users",
      },
      { status: 500 }
    );
  }
}

// POST: Register a new student
export async function POST(request: Request) {
  try {
    // 1. Read incoming JSON
    const body: unknown = await request.json();

    // 2. Check that the request body is an object
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

    const { full_name, email, password } =
      body as Record<string, unknown>;

    // 3. Check field types
    if (
      typeof full_name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "All fields must be strings" },
        { status: 400 }
      );
    }

    // 4. Normalize name and email
    const normalizedName = full_name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 5. Validate full name
    if (
      normalizedName.length < 2 ||
      normalizedName.length > 150
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Name must be between 2 and 150 characters",
        },
        { status: 400 }
      );
    }

    // 6. Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      normalizedEmail.length > 255 ||
      !emailRegex.test(normalizedEmail)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      );
    }

    // 7. Validate password
    if (
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 8 characters and no more than 72 bytes",
        },
        { status: 400 }
      );
    }

    // 8. Create student through the service
    const user = await createStudent({
      full_name: normalizedName,
      email: normalizedEmail,
      password,
    });

    // 9. Return safe user information
    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle duplicate email
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 409 }
      );
    }

    console.error("Error creating user:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
      },
      { status: 500 }
    );
  }
}
