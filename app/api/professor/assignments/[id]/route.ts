import { NextResponse } from "next/server";

import { requireRole } from "@/lib/permissions";
import { updateProfessorAssignment } from "@/lib/services/assignment.service";
import { deleteProfessorAssignment } from "@/lib/services/assignment.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
    const assignmentId = Number(id);

    if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid assignment ID",
        },
        { status: 400 }
      );
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

    const result = await updateProfessorAssignment(
      user.id,
      assignmentId,
      {
        course_id,
        title: title.trim(),
        description,
        due_date,
        max_score,
      }
    );

    if ("error" in result) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment not found or course does not belong to you",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Assignment updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/professor/assignments/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update assignment",
      },
      { status: 500 }
    );
  }
}

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
    const assignmentId = Number(id);

    if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid assignment ID",
        },
        { status: 400 }
      );
    }

    const result = await deleteProfessorAssignment(
      user.id,
      assignmentId
    );

    if ("error" in result) {
      return NextResponse.json(
        {
          success: false,
          message: "Assignment not found or you do not own it",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Assignment deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/professor/assignments/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete assignment",
      },
      { status: 500 }
    );
  }
}