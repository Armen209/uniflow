
"use client";

import { useEffect, useState } from "react";
import {
  getStudentAssignments,
  type StudentAssignment,
} from "../api/student";

function formatDate(value: string | null) {
  if (!value) return "No deadline";

  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

const statusStyles = {
  not_submitted: "bg-amber-50 text-amber-700 ring-amber-600/20",
  submitted: "bg-blue-50 text-blue-700 ring-blue-600/20",
  graded: "bg-green-50 text-green-700 ring-green-600/20",
};

const statusLabels = {
  not_submitted: "Not submitted",
  submitted: "Submitted",
  graded: "Graded",
};

export function StudentAssignments() {
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAssignments() {
      try {
        const result = await getStudentAssignments();
        setAssignments(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load assignments."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAssignments();
  }, []);

  const gradedCount = assignments.filter(
    (item) => item.submission_status === "graded"
  ).length;

  const pendingCount = assignments.filter(
    (item) => item.submission_status === "not_submitted"
  ).length;

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <p className="text-sm font-semibold text-primary">
          Academic
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Assignments
        </h1>
        <p className="mt-2 text-sm text-muted">
          Track your assignments, deadlines, submissions, and grades.
        </p>
      </div>

      {/* Summary cards */}
      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">
                Total assignments
              </p>
              <span className="rounded-xl bg-primary-light p-2 text-primary">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                  />
                </svg>
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-foreground">
              {assignments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">
                Pending
              </p>
              <span className="rounded-xl bg-amber-50 p-2 text-amber-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 7v5l3 2"
                  />
                </svg>
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-foreground">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">
                Graded
              </p>
              <span className="rounded-xl bg-green-50 p-2 text-green-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m5 12 4 4L19 6"
                  />
                </svg>
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-foreground">
              {gradedCount}
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted">
            Loading your assignments...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-medium text-error">
            Unable to load assignments
          </p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && assignments.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
              />
            </svg>
          </div>
          <h2 className="mt-4 font-semibold text-foreground">
            No assignments yet
          </h2>
          <p className="mt-2 text-sm text-muted">
            Your assignments will appear here when professors publish them.
          </p>
        </div>
      )}

      {/* Assignment list */}
      {!loading && !error && assignments.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                All Assignments
              </h2>
              <p className="mt-1 text-sm text-muted">
                Your coursework and submission progress
              </p>
            </div>
            <span className="rounded-full bg-primary-light px-3 py-1 text-sm font-semibold text-primary">
              {assignments.length} total
            </span>
          </div>

          <div className="space-y-4">
            {assignments.map((assignment) => (
              <article
                key={assignment.id}
                className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
              >
                {/* Title and status */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {assignment.course_title}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-foreground">
                      {assignment.title}
                    </h3>
                  </div>

                  <span
                    className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
                      statusStyles[assignment.submission_status]
                    }`}
                  >
                    {statusLabels[assignment.submission_status]}
                  </span>
                </div>

                {/* Description */}
                {assignment.description && (
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {assignment.description}
                  </p>
                )}

                {/* Deadline and maximum score */}
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path
                        strokeLinecap="round"
                        d="M16 3v4M8 3v4M3 11h18"
                      />
                    </svg>
                    <span>
                      Due: <strong className="font-medium text-foreground">
                        {formatDate(assignment.due_date)}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v18m9-9H3"
                      />
                    </svg>
                    <span>
                      Maximum score:{" "}
                      <strong className="font-medium text-foreground">
                        {assignment.max_score}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Grade */}
                {assignment.submission_status === "graded" && (
                  <div className="mt-5 rounded-xl border border-green-100 bg-green-50/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                      Your grade
                    </p>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-green-700">
                        {assignment.score ?? "—"}
                      </span>
                      <span className="text-sm text-green-700/70">
                        / {assignment.max_score}
                      </span>
                    </div>
                  </div>
                )}

                {/* Professor feedback */}
                {assignment.feedback && (
                  <div className="mt-4 rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-muted"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 10h8m-8 4h5m-9 6 3-3h11a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
                        />
                      </svg>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Professor feedback
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-foreground">
                      {assignment.feedback}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
