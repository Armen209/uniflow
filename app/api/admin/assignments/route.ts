
import { NextResponse } from "next/server";

import { requireRole } from "@/lib/permissions";

import {
  getAllAssignments,
  createAssignment,
} from "@/lib/services/assignment.service";

// GET - Get all assignments
export async function GET() {
  const { response } = await requireRole(["admin"]);

  if (response) return response;

  try {
    const assignments = await getAllAssignments();

    return NextResponse.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error("GET assignments error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to retrieve assignments" },
      { status: 500 }
    );
  }
}

// POST - Create a new assignment
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

    // Validate title
    if (
      typeof data.title !== "string" ||
      data.title.trim().length < 2 ||
      data.title.trim().length > 200
    ) {
      return NextResponse.json(
        { success: false, message: "Title must be between 2 and 200 characters" },
        { status: 400 }
      );
    }

    // Validate description
    if (
      data.description !== undefined &&
      data.description !== null &&
      typeof data.description !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Description must be a string or null" },
        { status: 400 }
      );
    }

    // Validate due_date
    if (
      data.due_date !== undefined &&
      data.due_date !== null &&
      typeof data.due_date !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "due_date must be a string or null" },
        { status: 400 }
      );
    }

    // Validate max_score
    if (
      data.max_score !== undefined &&
      (typeof data.max_score !== "number" ||
        !Number.isFinite(data.max_score) ||
        data.max_score <= 0 ||
        data.max_score > 999.99)
    ) {
      return NextResponse.json(
        { success: false, message: "max_score must be between 0 and 999.99" },
        { status: 400 }
      );
    }

    const assignment = await createAssignment({
      course_id: data.course_id,
      title: data.title.trim(),
      description: data.description as string | null | undefined,
      due_date: data.due_date as string | null | undefined,
      max_score: data.max_score as number | undefined,
    });

    if ("error" in assignment) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Assignment created successfully",
        data: assignment,
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

    console.error("POST assignment error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create assignment" },
      { status: 500 }
    );
  }
}
