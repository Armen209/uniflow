
import { NextResponse } from "next/server";

import { requireRole } from "@/lib/permissions";

import {
  updateProfessorClassSession,
  deleteProfessorClassSession,
} from "@/lib/services/class-session.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PUT /api/professor/sessions/[id]
export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { user, response } = await requireRole(["professor"]);

    if (response) {
      return response;
    }

    const { id } = await params;
    const sessionId = Number(id);

    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid session ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      course_id,
      title,
      session_date,
      start_time,
      end_time,
      location,
      session_type,
    } = body;

    if (
      !Number.isInteger(course_id) ||
      typeof title !== "string" ||
      !title.trim() ||
      typeof session_date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(session_date) ||
      typeof start_time !== "string" ||
      !/^\d{2}:\d{2}(:\d{2})?$/.test(start_time) ||
      typeof end_time !== "string" ||
      !/^\d{2}:\d{2}(:\d{2})?$/.test(end_time)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid course_id, title, session_date, start_time and end_time are required",
        },
        { status: 400 }
      );
    }

    if (end_time <= start_time) {
      return NextResponse.json(
        {
          success: false,
          message: "end_time must be later than start_time",
        },
        { status: 400 }
      );
    }

    if (
      location !== undefined &&
      location !== null &&
      typeof location !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "location must be a string or null",
        },
        { status: 400 }
      );
    }

    const validTypes = ["lecture", "seminar", "lab", "exam"];

    if (
      session_type !== undefined &&
      (typeof session_type !== "string" ||
        !validTypes.includes(session_type))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid session_type",
        },
        { status: 400 }
      );
    }

    const result = await updateProfessorClassSession(
      user.id,
      sessionId,
      {
        course_id,
        title: title.trim(),
        session_date,
        start_time,
        end_time,
        location,
        session_type,
      }
    );

    if ("error" in result) {
      return NextResponse.json(
        {
          success: false,
          message:
            result.error === "session_not_found"
              ? "Session not found or you do not own this session"
              : "Course not found or you do not own this course",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Class session updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/professor/sessions/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update class session",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/professor/sessions/[id]
export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { user, response } = await requireRole(["professor"]);

    if (response) {
      return response;
    }

    const { id } = await params;
    const sessionId = Number(id);

    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid session ID",
        },
        { status: 400 }
      );
    }

    const result = await deleteProfessorClassSession(
      user.id,
      sessionId
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Session not found or you do not own this session",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Class session deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/professor/sessions/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete class session",
      },
      { status: 500 }
    );
  }
}
