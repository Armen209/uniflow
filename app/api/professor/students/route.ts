
import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";

import { requireRole } from "@/lib/permissions";
import { getProfessorStudents } from "@/lib/services/enrollment.service";

export async function GET() {
  try {
    const { user, response } = await requireRole(["professor"]);

    if (response) {
      return response;
    }

    const students = await getProfessorStudents(user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Professor students retrieved successfully",
        data: students,
      },
      { status: 200 }
    );
  } catch (error) {
    unstable_rethrow(error);

    console.error("GET /api/professor/students error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve professor students",
      },
      { status: 500 }
    );
  }
}
