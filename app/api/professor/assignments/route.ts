import { NextResponse } from "next/server";

import { requireRole } from "@/lib/permissions";
import { getProfessorAssignments } from "@/lib/services/assignment.service";
import { createProfessorAssignment } from "@/lib/services/assignment.service";

export async function GET() {
  try {
    const { user, response } = await requireRole(["professor"]);

    if (response) {
      return response;
    }

    const assignments = await getProfessorAssignments(user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Professor assignments retrieved successfully",
        data: assignments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/professor/assignments error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve professor assignments",
      },
      { status: 500 }
    );
  }
}

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
      description,
      due_date,
      max_score,
    } = body;

    if (
      !Number.isInteger(course_id) ||
      typeof title !== "string" ||
      !title.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid course_id and title are required",
        },
        { status: 400 }
      );
    }

    const assignment = await createProfessorAssignment(user.id, {
      course_id,
      title: title.trim(),
      description,
      due_date,
      max_score,
    });

    if ("error" in assignment) {
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
        message: "Assignment created successfully",
        data: assignment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/professor/assignments error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create assignment",
      },
      { status: 500 }
    );
  }
}