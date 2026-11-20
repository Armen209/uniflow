import { NextResponse } from "next/server";

import {
  getAllUsers,
  createUser,
} from "@/lib/services/user.service";

import { requireRole } from "@/lib/permissions";



// GET: Retrieve all users (admin only)
export async function GET() {
  try {
    // 1. Check whether the user has admin permissions
    const { response } = await requireRole(["admin"]);

    if (response) {
      return response;
    }

    // 2. Retrieve users from MySQL
    const users = await getAllUsers();

    // 3. Return the users
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




export async function POST(request: Request) {
  try {
    // 1. Check admin permissions
    const { response } = await requireRole(["admin"]);

    if (response) {
      return response;
    }

    // 2. Read incoming JSON
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // 3. Validate request body
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

    const { full_name, email, password, role } =
      body as Record<string, unknown>;

    // 4. Check field types
    if (
      typeof full_name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof role !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required and must be strings" },
        { status: 400 }
      );
    }

    // 5. Normalize name and email
    const normalizedName = full_name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 6. Validate full name
    if (
      normalizedName.length < 2 ||
      normalizedName.length > 150
    ) {
      return NextResponse.json(
        { success: false, message: "Name must be between 2 and 150 characters" },
        { status: 400 }
      );
    }

    // 7. Validate email
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

    // 8. Validate password
    if (
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters and no more than 72 bytes",
        },
        { status: 400 }
      );
    }

    // 9. Validate role
    const validRoles = ["student", "professor", "admin"] as const;

    if (!validRoles.includes(role as typeof validRoles[number])) {
      return NextResponse.json(
        { success: false, message: "Invalid user role" },
        { status: 400 }
      );
    }

    // 10. Create user through the service
    const user = await createUser({
      full_name: normalizedName,
      email: normalizedEmail,
      password,
      role: role as typeof validRoles[number],
    });

    // 11. Return safe user information
    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: user,
      },
      { status: 201 }
    );

  } catch (error) {
    // 12. Handle duplicate email
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
      { success: false, message: "Failed to create user" },
      { status: 500 }
    );
  }
}
