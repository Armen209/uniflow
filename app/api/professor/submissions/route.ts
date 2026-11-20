
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/permissions";
import { getProfessorSubmissions } from "@/lib/services/submission.service";

// GET: Get submissions from the logged-in professor's courses
export async function GET() {
  const { user, response } = await requireRole(["professor"]);

  if (response) return response;

  try {
    const submissions = await getProfessorSubmissions(user.id);

    return NextResponse.json({
      success: true,
      message: "Submissions retrieved successfully",
      data: submissions,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to retrieve submissions" },
      { status: 500 }
    );
  }
}
