"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getStudentAssignments,
  type StudentAssignment,
} from "@/features/student/api/student";

function formatScore(score: number | string) {
  const numericScore = Number(score);

  if (!Number.isFinite(numericScore)) {
    return "0";
  }

  return Number.isInteger(numericScore)
    ? numericScore.toString()
    : numericScore.toFixed(1);
}

function formatDate(date: string | null) {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function StudentGrades() {
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGrades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getStudentAssignments();
      setAssignments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load your grades."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGrades();
  }, [loadGrades]);

  const gradedAssignments = useMemo(
    () =>
      assignments.filter(
        (assignment) =>
          assignment.submission_status === "graded" &&
          assignment.score !== null
      ),
    [assignments]
  );

    const totalEarned = gradedAssignments.reduce(
      (total, assignment) => total + Number(assignment.score),
      0
    );
    
    const totalPossible = gradedAssignments.reduce(
      (total, assignment) => total + Number(assignment.max_score),
      0
    );

  const averagePercentage =
    totalPossible > 0 ? (totalEarned / totalPossible) * 100 : null;

  const courseCount = new Set(
    gradedAssignments.map((assignment) => assignment.course_id)
  ).size;

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return gradedAssignments;

    return gradedAssignments.filter(
      (assignment) =>
        assignment.title.toLowerCase().includes(query) ||
        assignment.course_title.toLowerCase().includes(query) ||
        assignment.feedback?.toLowerCase().includes(query)
    );
  }, [gradedAssignments, search]);

  if (loading) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">
            Loading your grades...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
        <p className="font-medium text-red-700">{error}</p>
        <button
          onClick={loadGrades}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Grades</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track your academic performance and review professors' feedback.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Graded assignments
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {gradedAssignments.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Overall percentage
          </p>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {averagePercentage === null
              ? "—"
              : `${averagePercentage.toFixed(1)}%`}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Based on graded assignment points
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Courses with grades
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {courseCount}
          </p>
        </div>
      </div>

      {/* Points overview */}
      {gradedAssignments.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Earned points
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Total points from graded assignments
              </p>
            </div>

            <p className="text-lg font-bold text-slate-900">
              {formatScore(totalEarned)}
              <span className="font-medium text-slate-400">
                {" "}
                / {formatScore(totalPossible)}
              </span>
            </p>
          </div>

          {totalPossible > 0 && (
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, (totalEarned / totalPossible) * 100)
                  )}%`,
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by assignment, course, or feedback..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
        />
      </div>

      {/* Grade list */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Assignment results
          </h2>
          <span className="text-sm text-slate-500">
            {filteredAssignments.length}{" "}
            {filteredAssignments.length === 1 ? "result" : "results"}
          </span>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="text-4xl">🎓</div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              {gradedAssignments.length === 0
                ? "No grades available yet"
                : "No grades found"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {gradedAssignments.length === 0
                ? "Your graded assignments will appear here once your professors evaluate your work."
                : "Try searching with a different assignment or course name."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => {
              const percentage =
                Number(assignment.max_score) > 0
                  ? (Number(assignment.score) / Number(assignment.max_score)) * 100
                  : null;
              return (
                <article
                  key={assignment.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                        {assignment.course_title}
                      </p>

                      <h3 className="mt-2 text-base font-semibold text-slate-900">
                        {assignment.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Graded on {formatDate(assignment.graded_at)}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-xl bg-indigo-50 px-5 py-3 text-center">
                      <p className="text-2xl font-bold text-indigo-700">
                        {formatScore(assignment.score!)}
                        <span className="text-base font-medium text-indigo-400">
                          {" "}
                          / {formatScore(assignment.max_score)}
                        </span>
                      </p>
                      <p className="mt-1 text-xs font-medium text-indigo-600">
                        {percentage === null
                          ? "Score"
                          : `${percentage.toFixed(1)}%`}
                      </p>
                    </div>
                  </div>

                  {assignment.description && (
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {assignment.description}
                    </p>
                  )}

                  {assignment.feedback && (
                    <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Professor's feedback
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {assignment.feedback}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}