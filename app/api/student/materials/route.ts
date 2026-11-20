
import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";

import { requireRole } from "@/lib/permissions";
import { getStudentMaterials } from "@/lib/services/material.service";

export async function GET() {
  try {
    // Only students can access this endpoint
    const { user, response } = await requireRole(["student"]);

    if (response) {
      return response;
    }

    // Retrieve materials from the student's enrolled courses
    const materials = await getStudentMaterials(user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Student materials retrieved successfully",
        data: materials,
      },
      { status: 200 }
    );
  } catch (error) {
    unstable_rethrow(error);

    console.error("GET /api/student/materials error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve student materials",
      },
      { status: 500 }
    );
  }
}
