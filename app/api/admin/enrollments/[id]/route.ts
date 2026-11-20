
import { NextResponse } from "next/server";

import { requireRole } from "@/lib/permissions";

import {
  findEnrollmentById,
  deleteEnrollment,
} from "@/lib/services/enrollment.service";

// GET - Get an enrollment by ID
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
      { success: false, message: "Invalid enrollment ID" },
      { status: 400 }
    );
  }

  try {
    const enrollment = await findEnrollmentById(id);

    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: "Enrollment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error("GET enrollment error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to retrieve enrollment" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an enrollment by ID
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
      { success: false, message: "Invalid enrollment ID" },
      { status: 400 }
    );
  }

  try {
    const result = await deleteEnrollment(id);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Enrollment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Enrollment deleted successfully",
    });
  } catch (error) {
    console.error("DELETE enrollment error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete enrollment" },
      { status: 500 }
    );
  }
}
