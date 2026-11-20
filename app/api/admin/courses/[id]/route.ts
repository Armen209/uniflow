
import { NextResponse } from "next/server";
import {
  findCourseById,
  updateCourse,
  deleteCourse
} from "@/lib/services/course.service";


import { requireRole } from "@/lib/permissions";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// Get one course by ID
export async function GET(
  request: Request,
  context: RouteContext
) {
  const { response } = await requireRole(["admin"]);

  if (response) {
    return response;
  }

  try {
    const { id } = await context.params;
    const courseId = Number(id);

    if (!Number.isSafeInteger(courseId) || courseId <= 0) {
      return NextResponse.json(
        { message: "Invalid course ID" },
        { status: 400 }
      );
    }

    const course = await findCourseById(courseId);

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Get course error:", error);

    return NextResponse.json(
      { message: "Failed to retrieve course" },
      { status: 500 }
    );
  }
}



type UpdateCourseBody = {
  title: string;
  description: string | null;
  professor_id: number;
};

// Update an existing course
export async function PUT(
  request: Request,
  context: RouteContext
) {
  const { response } = await requireRole(["admin"]);

  if (response) {
    return response;
  }

  try {
    const { id } = await context.params;
    const courseId = Number(id);

    if (!Number.isSafeInteger(courseId) || courseId <= 0) {
      return NextResponse.json(
        { message: "Invalid course ID" },
        { status: 400 }
      );
    }

    // Check whether the course exists
    const existingCourse = await findCourseById(courseId);

    if (!existingCourse) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { title, description, professor_id } =
      body as UpdateCourseBody;

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
      !("description" in body) ||
      (description !== null && typeof description !== "string")
    ) {
      return NextResponse.json(
        { message: "Description must be a string or null" },
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

    const result = await updateCourse(courseId, {
      title: title.trim(),
      description: description?.trim() || null,
      professor_id,
    });

    if (!result) {
      return NextResponse.json(
        { message: "The selected user is not a professor" },
        { status: 400 }
      );
    }

    const updatedCourse = await findCourseById(courseId);

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Update course error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update course" },
      { status: 500 }
    );
  }
}



 // Delete an existing course
export async function DELETE(
  request: Request,
  context: RouteContext
) {
  const { response } = await requireRole(["admin"]);

  if (response) {
    return response;
  }

  try {
    const { id } = await context.params;
    const courseId = Number(id);

    if (!Number.isSafeInteger(courseId) || courseId <= 0) {
      return NextResponse.json(
        { message: "Invalid course ID" },
        { status: 400 }
      );
    }

    // Check whether the course exists
    const existingCourse = await findCourseById(courseId);

    if (!existingCourse) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    const result = await deleteCourse(courseId);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Course could not be deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);

    return NextResponse.json(
      { message: "Failed to delete course" },
      { status: 500 }
    );
  }
}
