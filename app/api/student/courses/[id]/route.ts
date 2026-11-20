import { NextResponse } from "next/server";
import { requireRole } from "@/lib/permissions";
import { getStudentCourseById } from "@/lib/services/enrollment.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET: Get details of a course enrolled by the logged-in student
export async function GET(
  request: Request,
  context: RouteContext
) {
  const { user, response } = await requireRole(["student"]);

  if (response) return response;

  try {
    const { id } = await context.params;
    const courseId = Number(id);

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid course ID" },
        { status: 400 }
      );
    }

    const course = await getStudentCourseById(user.id, courseId);

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found or you are not enrolled in this course",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course details retrieved successfully",
      data: course,
    });
  }  catch (error) {
  console.error("GET STUDENT COURSE ERROR:", error);

  return NextResponse.json(
    {
      success: false,
      message: "Failed to retrieve course details",
    },
    { status: 500 }
  );
}
}

