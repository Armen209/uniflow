import { NextResponse } from "next/server";

import { requireRole } from "@/lib/permissions";
import { getProfessorCourses } from "@/lib/services/course.service";

export async function GET() {
  try {
    // Only professors can access this endpoint
    const { user, response } = await requireRole(["professor"]);

    if (response) {
      return response;
    }

    // Get courses assigned to the logged-in professor
    const courses = await getProfessorCourses(user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Professor courses retrieved successfully",
        data: courses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/professor/courses error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve professor courses",
      },
      { status: 500 }
    );
  }
}