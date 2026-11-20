
import { NextResponse } from "next/server";
import {
  getAllCourses,
  createCourse,
} from "@/lib/services/course.service";
import { requireRole } from "@/lib/permissions";

// Get all courses
export async function GET() {
  const { response } = await requireRole(["admin"]);

  if (response) {
    return response;
  }

  try {
    const courses = await getAllCourses();

    return NextResponse.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Get courses error:", error);

    return NextResponse.json(
      { message: "Failed to retrieve courses" },
      { status: 500 }
    );
  }
}



type CreateCourseBody = {
  title: string;
  description?: string | null;
  professor_id: number;
};

// Create a new course
export async function POST(request: Request) {
  const { response } = await requireRole(["admin"]);

  if (response) {
    return response;
  }

  try {
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { title, description, professor_id } =
      body as CreateCourseBody;

    // Validate title
    if (
      typeof title !== "string" ||
      title.trim().length < 2 ||
      title.trim().length > 150
    ) {
      return NextResponse.json(
        { message: "Title must be between 2 and 150 characters" },
        { status: 400 }
      );
    }

    // Validate description
    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return NextResponse.json(
        { message: "Description must be a string" },
        { status: 400 }
      );
    }

    // Validate professor ID
    if (
      !Number.isInteger(professor_id) ||
      professor_id <= 0
    ) {
      return NextResponse.json(
        { message: "A valid professor_id is required" },
        { status: 400 }
      );
    }

    const course = await createCourse({
      title: title.trim(),
      description: description?.trim() || null,
      professor_id,
    });

    if (!course) {
      return NextResponse.json(
        { message: "The selected user is not a professor" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Course created successfully",
        data: course,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create course error:", error);

    return NextResponse.json(
      { message: "Failed to create course" },
      { status: 500 }
    );
  }
}
