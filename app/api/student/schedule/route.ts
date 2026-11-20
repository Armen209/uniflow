import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { requireRole } from "@/lib/permissions";
import { getStudentClassSessions } from "@/lib/services/class-session.service";

export async function GET() {
  try {
    const { user, response } = await requireRole(["student"]);

    if (response) {
      return response;
    }

    const schedule = await getStudentClassSessions(user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Student schedule retrieved successfully",
        data: schedule,
      },
      { status: 200 }
    );
  } catch (error) {
  unstable_rethrow(error);

  console.error("GET /api/student/schedule error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve student schedule",
      },
      { status: 500 }
    );
  }
}