
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import type { User } from "@/lib/services/user.service";

// Check whether the user is logged in
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      ),
    };
  }

  return {
    user,
    response: null,
  };
}

// Check whether the logged-in user has the required role
export async function requireRole(allowedRoles: User["role"][]) {
  const auth = await requireAuth();

  // User is not logged in
  if (auth.response) {
    return auth;
  }

  // User is logged in, but doesn't have permission
  if (!allowedRoles.includes(auth.user.role)) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          message: "Forbidden. You don't have permission.",
        },
        { status: 403 }
      ),
    };
  }

  return auth;
}
