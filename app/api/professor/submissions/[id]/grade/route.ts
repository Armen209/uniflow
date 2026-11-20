import { NextResponse } from "next/server";
import { requireRole } from "@/lib/permissions";
import { gradeSubmission } from "@/lib/services/submission.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH: Grade a submission
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const { user, response } = await requireRole(["professor"]);

  if (response) return response;

  try {
    const { id } = await context.params;
    const submissionId = Number(id);

    if (!Number.isInteger(submissionId) || submissionId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid submission ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { score, feedback } = body;

    if (
      typeof score !== "number" ||
      (feedback !== undefined &&
        feedback !== null &&
        typeof feedback !== "string")
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid score or feedback" },
        { status: 400 }
      );
    }

    const result = await gradeSubmission(submissionId, user.id, {
      score,
      feedback,
    });

    if ("error" in result && result.error) {
      const errors: Record<string, { message: string; status: number }> = {
        submission_not_found: {
          message: "Submission not found",
          status: 404,
        },
        forbidden: {
          message: "You cannot grade this submission",
          status: 403,
        },
        already_graded: {
          message: "This submission has already been graded",
          status: 409,
        },
        assignment_not_found: {
          message: "Assignment not found",
          status: 404,
        },
        invalid_score: {
          message: "Score must be between 0 and the assignment's maximum score",
          status: 400,
        },
      };

      const error = errors[result.error];

      if (!error) {
        throw new Error("Unknown grading error");
      }

      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Submission graded successfully",
      data: result,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to grade submission" },
      { status: 500 }
    );
  }
}