
import { NextResponse } from "next/server";

import { requireRole } from "@/lib/permissions";

import {
  getProfessorClassSessions,
  createProfessorClassSession,
} from "@/lib/services/class-session.service";

// GET /api/professor/sessions
export async function GET() {
  try {
    const { user, response } = await requireRole(["professor"]);

    if (response) {
      return response;
    }

    const sessions = await getProfessorClassSessions(user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Professor class sessions retrieved successfully",
        data: sessions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/professor/sessions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve professor class sessions",
      },
      { status: 500 }
    );
  }
}

// POST /api/professor/sessions
export async function POST(request: Request) {
  try {
    const { user, response } = await requireRole(["professor"]);

    if (response) {
      return response;
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
      !validTypes.includes(session_type)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid session_type",
        },
        { status: 400 }
      );
    }

    const session = await createProfessorClassSession(user.id, {
      course_id,
      title: title.trim(),
      session_date,
      start_time,
      end_time,
      location,
      session_type,
    });

    if ("error" in session) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found or you do not own this course",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Class session created successfully",
        data: session,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/professor/sessions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create class session",
      },
      { status: 500 }
    );
  }
}
