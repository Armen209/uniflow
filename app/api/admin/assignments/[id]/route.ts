
import { NextResponse } from "next/server";

import { requireRole } from "@/lib/permissions";

import {
  findAssignmentById,
  updateAssignment,
  deleteAssignment,
} from "@/lib/services/assignment.service";

// GET - Get an assignment by ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { response } = await requireRole(["admin"]);

  if (response) return response;

  const { id: idParam } = await context.params;
  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { success: false, message: "Invalid assignment ID" },
      { status: 400 }
    );
  }

  try {
    const assignment = await findAssignmentById(id);

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("GET assignment error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to retrieve assignment" },
      { status: 500 }
    );
  }
}

// PUT - Update an assignment
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { response } = await requireRole(["admin"]);

  if (response) return response;

  const { id: idParam } = await context.params;
  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { success: false, message: "Invalid assignment ID" },
      { status: 400 }
    );
  }

  try {
    const body: unknown = await request.json();

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
        { success: false, message: "Invalid course_id" },
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

    const assignment = await updateAssignment(id, {
      course_id: data.course_id,
      title: data.title.trim(),
      description: data.description as string | null | undefined,
      due_date: data.due_date as string | null | undefined,
      max_score: data.max_score as number | undefined,
    });

    if ("error" in assignment) {
      if (assignment.error === "assignment_not_found") {
        return NextResponse.json(
          { success: false, message: "Assignment not found" },
          { status: 404 }
        );
      }

      if (assignment.error === "course_not_found") {
        return NextResponse.json(
          { success: false, message: "Course not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Assignment updated successfully",
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    console.error("PUT assignment error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update assignment" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an assignment
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { response } = await requireRole(["admin"]);

  if (response) return response;

  const { id: idParam } = await context.params;
  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { success: false, message: "Invalid assignment ID" },
      { status: 400 }
    );
  }

  try {
    const result = await deleteAssignment(id);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("DELETE assignment error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}
