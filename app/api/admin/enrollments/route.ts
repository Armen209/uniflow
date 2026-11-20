
import { NextResponse } from "next/server";

import { requireRole } from "@/lib/permissions";

import {
  getAllEnrollments,
  createEnrollment,
} from "@/lib/services/enrollment.service";

// GET - Get all enrollments
export async function GET() {
  const { response } = await requireRole(["admin"]);

  if (response) return response;

  try {
    const enrollments = await getAllEnrollments();

    return NextResponse.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.error("GET enrollments error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to retrieve enrollments" },
      { status: 500 }
    );
  }
}

// POST - Enroll a student in a course
export async function POST(request: Request) {
  const { response } = await requireRole(["admin"]);

  if (response) return response;

  try {
    const body: unknown = await request.json();

    // Validate request body
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

    // Validate student_id
    if (
      typeof data.student_id !== "number" ||
      !Number.isInteger(data.student_id) ||
      data.student_id <= 0
    ) {
      return NextResponse.json(
        { success: false, message: "student_id must be a positive integer" },
        { status: 400 }
      );
    }

    // Validate course_id
    if (
      typeof data.course_id !== "number" ||
      !Number.isInteger(data.course_id) ||
      data.course_id <= 0
    ) {
      return NextResponse.json(
        { success: false, message: "course_id must be a positive integer" },
        { status: 400 }
      );
    }

    const enrollment = await createEnrollment({
      student_id: data.student_id,
      course_id: data.course_id,
    });

    // Handle service errors
    if ("error" in enrollment) {
      if (enrollment.error === "invalid_student") {
        return NextResponse.json(
          { success: false, message: "Student not found or invalid role" },
          { status: 400 }
        );
      }

      if (enrollment.error === "course_not_found") {
        return NextResponse.json(
          { success: false, message: "Course not found" },
          { status: 404 }
        );
      }

      if (enrollment.error === "already_enrolled") {
        return NextResponse.json(
          { success: false, message: "Student is already enrolled in this course" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Student enrolled successfully",
        data: enrollment,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    console.error("POST enrollment error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create enrollment" },
      { status: 500 }
    );
  }
}
