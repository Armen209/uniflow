
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/permissions";
import {
  getStudentSubmissions,
  createSubmission,
} from "@/lib/services/submission.service";

// GET: Get all submissions belonging to the logged-in student
export async function GET() {
  const { user, response } = await requireRole(["student"]);

  if (response) return response;

  try {
    const submissions = await getStudentSubmissions(user.id);

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

// POST: Submit an assignment
export async function POST(request: Request) {
  const { user, response } = await requireRole(["student"]);

  if (response) return response;

  try {
    const body = await request.json();
    const { assignment_id, content, file_url } = body;

    if (!Number.isInteger(assignment_id) || assignment_id <= 0) {
      return NextResponse.json(
        { success: false, message: "A valid assignment_id is required" },
        { status: 400 }
      );
    }

    if (
      (content !== undefined &&
        content !== null &&
        typeof content !== "string") ||
      (file_url !== undefined &&
        file_url !== null &&
        typeof file_url !== "string")
    ) {
      return NextResponse.json(
        { success: false, message: "Content and file_url must be strings" },
        { status: 400 }
      );
    }

    if (!content?.trim() && !file_url?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Submission content or file_url is required",
        },
        { status: 400 }
      );
    }

    const result = await createSubmission({
      assignment_id,
      student_id: user.id,
      content,
      file_url,
    });

    if ("error" in result && result.error) {
      const errors: Record<
        string,
        { message: string; status: number }
      > = {
        invalid_student: {
          message: "Invalid student",
          status: 403,
        },
        assignment_not_found: {
          message: "Assignment not found",
          status: 404,
        },
        already_submitted: {
          message: "You have already submitted this assignment",
          status: 409,
        },
      };

      const error = errors[result.error];

      if (!error) {
        return NextResponse.json(
          { success: false, message: "Unexpected submission error" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Assignment submitted successfully",
        data: result,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to submit assignment" },
      { status: 500 }
    );
  }
}
