import { NextResponse } from "next/server";
import { requireRole } from "@/lib/permissions";
import { getStudentCourses } from "@/lib/services/enrollment.service";

// GET: Get courses enrolled by the logged-in student
export async function GET() {
  const { user, response } = await requireRole(["student"]);

  if (response) return response;

  try {
    const courses = await getStudentCourses(user.id);

    return NextResponse.json({
      success: true,
      message: "Enrolled courses retrieved successfully",
      data: courses,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve enrolled courses",
      },
      { status: 500 }
    );
  }
}