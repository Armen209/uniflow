import { NextResponse } from "next/server";

import { requireRole } from "@/lib/permissions";
import { getStudentAssignments } from "@/lib/services/assignment.service";

export async function GET() {
  try {
    // Check whether the user has the student role
    const { user, response } = await requireRole(["student"]);

    // If authentication or authorization fails, return the error
    if (response) {
      return response;
    }

    // Get assignments for the authenticated student
    const assignments = await getStudentAssignments(user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Student assignments retrieved successfully",
        data: assignments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/student/assignments error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve student assignments",
      },
      { status: 500 }
    );
  }
}