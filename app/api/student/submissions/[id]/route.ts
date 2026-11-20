
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/permissions";
import {
  findSubmissionById,
  updateSubmission,
  deleteSubmission,
} from "@/lib/services/submission.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET: Get one submission belonging to the logged-in student
export async function GET(
  request: Request,
  context: RouteContext
) {
  const { user, response } = await requireRole(["student"]);

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

    const submission = await findSubmissionById(submissionId);

    if (!submission) {
      return NextResponse.json(
        { success: false, message: "Submission not found" },
        { status: 404 }
      );
    }

    if (submission.student_id !== user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Submission retrieved successfully",
      data: submission,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to retrieve submission" },
      { status: 500 }
    );
  }
}

// PUT: Update an ungraded submission
export async function PUT(
  request: Request,
  context: RouteContext
) {
  const { user, response } = await requireRole(["student"]);

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
    const { content, file_url } = body;

    if (
      (content !== undefined && content !== null && typeof content !== "string") ||
      (file_url !== undefined && file_url !== null && typeof file_url !== "string")
    ) {
      return NextResponse.json(
        { success: false, message: "Content and file_url must be strings" },
        { status: 400 }
      );
    }

    if (
      content === undefined &&
      file_url === undefined
    ) {
      return NextResponse.json(
        { success: false, message: "Provide content or file_url to update" },
        { status: 400 }
      );
    }

    if (
      content !== undefined &&
      file_url !== undefined &&
      !content?.trim() &&
      !file_url?.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Submission content or file_url is required" },
        { status: 400 }
      );
    }

    const result = await updateSubmission(
      submissionId,
      user.id,
      { content, file_url }
    );

    if ("error" in result && result.error) {
      const errors: Record<string, { message: string; status: number }> = {
        submission_not_found: {
          message: "Submission not found",
          status: 404,
        },
        forbidden: {
          message: "You cannot modify this submission",
          status: 403,
        },
        already_graded: {
          message: "You cannot modify a graded submission",
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

    return NextResponse.json({
      success: true,
      message: "Submission updated successfully",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update submission" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an ungraded submission
export async function DELETE(
  request: Request,
  context: RouteContext
) {
  const { user, response } = await requireRole(["student"]);

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

    const result = await deleteSubmission(submissionId, user.id);

    if ("error" in result && result.error) {
      const errors: Record<string, { message: string; status: number }> = {
        submission_not_found: {
          message: "Submission not found",
          status: 404,
        },
        forbidden: {
          message: "You cannot delete this submission",
          status: 403,
        },
        already_graded: {
          message: "You cannot delete a graded submission",
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

    return NextResponse.json({
      success: true,
      message: "Submission deleted successfully",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete submission" },
      { status: 500 }
    );
  }
}
