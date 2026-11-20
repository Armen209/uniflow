
import { NextResponse } from "next/server";

import { requireRole } from "@/lib/permissions";

import {
  findClassSessionById,
  updateClassSession,
  deleteClassSession,
} from "@/lib/services/class-session.service";

// GET - Get a class session by ID
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
      { success: false, message: "Invalid class session ID" },
      { status: 400 }
    );
  }

  try {
    const session = await findClassSessionById(id);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Class session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("GET class session error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to retrieve class session" },
      { status: 500 }
    );
  }
}

// PUT - Update a class session
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
      { success: false, message: "Invalid class session ID" },
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

    if (
      typeof data.title !== "string" ||
      data.title.trim().length < 2 ||
      data.title.trim().length > 150
    ) {
      return NextResponse.json(
        { success: false, message: "Title must be between 2 and 150 characters" },
        { status: 400 }
      );
    }

    if (
      typeof data.session_date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.session_date)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid session_date. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const timePattern = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

    if (
      typeof data.start_time !== "string" ||
      !timePattern.test(data.start_time)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid start_time. Use HH:MM or HH:MM:SS" },
        { status: 400 }
      );
    }

    if (
      typeof data.end_time !== "string" ||
      !timePattern.test(data.end_time)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid end_time. Use HH:MM or HH:MM:SS" },
        { status: 400 }
      );
    }

    if (data.end_time <= data.start_time) {
      return NextResponse.json(
        { success: false, message: "end_time must be later than start_time" },
        { status: 400 }
      );
    }

    if (
      data.location !== undefined &&
      data.location !== null &&
      typeof data.location !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "location must be a string or null" },
        { status: 400 }
      );
    }

    const allowedTypes = ["lecture", "seminar", "lab", "exam"];

    if (
      data.session_type !== undefined &&
      (typeof data.session_type !== "string" ||
        !allowedTypes.includes(data.session_type))
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid session_type" },
        { status: 400 }
      );
    }

    const session = await updateClassSession(id, {
      course_id: data.course_id,
      title: data.title.trim(),
      session_date: data.session_date,
      start_time: data.start_time,
      end_time: data.end_time,
      location: data.location as string | null | undefined,
      session_type: data.session_type as
        | "lecture"
        | "seminar"
        | "lab"
        | "exam"
        | undefined,
    });

    if ("error" in session) {
      if (session.error === "session_not_found") {
        return NextResponse.json(
          { success: false, message: "Class session not found" },
          { status: 404 }
        );
      }

      if (session.error === "course_not_found") {
        return NextResponse.json(
          { success: false, message: "Course not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Class session updated successfully",
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    console.error("PUT class session error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update class session" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a class session
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
      { success: false, message: "Invalid class session ID" },
      { status: 400 }
    );
  }

  try {
    const result = await deleteClassSession(id);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Class session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Class session deleted successfully",
    });
  } catch (error) {
    console.error("DELETE class session error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete class session" },
      { status: 500 }
    );
  }
}
