import { NextResponse } from "next/server";

import {
  findUserById,
  updateUser,
  deleteUser
} from "@/lib/services/user.service";

import { requireRole } from "@/lib/permissions";



// GET: Retrieve one user by ID (admin only)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check admin permissions
    const { response } = await requireRole(["admin"]);

    if (response) {
      return response;
    }

    // 2. Get the ID from the URL
    const { id } = await params;

    // 3. Validate the ID
    const userId = Number(id);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    // 4. Find the user in MySQL
    const user = await findUserById(userId);

    // 5. Check whether the user exists
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // 6. Return the user
    return NextResponse.json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error retrieving user:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve user",
      },
      { status: 500 }
    );
  }
}

// PUT: Update a user by ID (admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check admin permissions
    const { response } = await requireRole(["admin"]);

    if (response) {
      return response;
    }

    // 2. Get user ID from URL
    const { id } = await params;
    const userId = Number(id);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID" },
        { status: 400 }
      );
    }

    // 3. Check whether the user exists
    const existingUser = await findUserById(userId);

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 4. Read JSON body
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // 5. Validate body
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

    const { full_name, email, role, password } =
      body as Record<string, unknown>;

    if (
      typeof full_name !== "string" ||
      typeof email !== "string" ||
      typeof role !== "string" ||
      (password !== undefined && typeof password !== "string")
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing fields" },
        { status: 400 }
      );
    }

    // 6. Normalize input
    const normalizedName = full_name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 7. Validate name
    if (normalizedName.length < 2 || normalizedName.length > 150) {
      return NextResponse.json(
        { success: false, message: "Invalid name" },
        { status: 400 }
      );
    }

    // 8. Validate email
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

    // 9. Validate role
    const validRoles = ["student", "professor", "admin"] as const;

    if (!validRoles.includes(role as typeof validRoles[number])) {
      return NextResponse.json(
        { success: false, message: "Invalid user role" },
        { status: 400 }
      );
    }

    // 10. Validate optional password
    if (
      password !== undefined &&
      (password.length < 8 || Buffer.byteLength(password, "utf8") > 72)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid password length" },
        { status: 400 }
      );
    }

    // 11. Update user in MySQL
    await updateUser(userId, {
      full_name: normalizedName,
      email: normalizedEmail,
      role: role as typeof validRoles[number],
      ...(password !== undefined ? { password } : {}),
    });

    // 12. Retrieve updated user
    const updatedUser = await findUserById(userId);

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    // 13. Handle duplicate email
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

    console.error("Error updating user:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check admin permissions
    const { response, user } = await requireRole(["admin"]);

    if (response) {
      return response;
    }

    // 2. Get and validate user ID
    const { id } = await params;
    const userId = Number(id);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID" },
        { status: 400 }
      );
    }

    // 3. Prevent admins from deleting themselves
    if (user.id === userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot delete your own account",
        },
        { status: 400 }
      );
    }

    // 4. Check whether the user exists
    const existingUser = await findUserById(userId);

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 5. Delete the user
    const result = await deleteUser(userId);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 6. Return success
    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 }
    );
  }
}