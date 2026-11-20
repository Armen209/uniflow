
"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  getProfessorSubmissions,
  getProfessorAssignments,
  gradeProfessorSubmission,
  type ProfessorSubmission,
  type ProfessorAssignment,
} from "@/features/professor/api/professor";

export function ProfessorSubmissions() {
  const [submissions, setSubmissions] = useState<ProfessorSubmission[]>([]);
  const [assignments, setAssignments] = useState<ProfessorAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [formError, setFormError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [submissionData, assignmentData] = await Promise.all([
        getProfessorSubmissions(),
        getProfessorAssignments(),
      ]);

      setSubmissions(submissionData);
      setAssignments(assignmentData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load submissions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const pendingSubmissions = submissions.filter(
    (submission) => !submission.graded_at
  );

  const gradedSubmissions = submissions.filter(
    (submission) => Boolean(submission.graded_at)
  );

  function getMaxScore(assignmentId: number) {
    const assignment = assignments.find(
      (item) => item.id === assignmentId
    );

    return assignment ? Number(assignment.max_score) : null;
  }

  function openGradingForm(submission: ProfessorSubmission) {
    setSelectedId(submission.id);
    setScore("");
    setFeedback("");
    setFormError("");
  }

  async function handleGrade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (selectedId === null) return;

    const submission = submissions.find(
      (item) => item.id === selectedId
    );

    if (!submission) {
      setFormError("Submission not found.");
      return;
    }

    const maxScore = getMaxScore(submission.assignment_id);
    const numericScore = Number(score);

    if (
      score.trim() === "" ||
      !Number.isFinite(numericScore) ||
      numericScore < 0
    ) {
      setFormError("Please enter a valid score.");
      return;
    }

    if (maxScore !== null && numericScore > maxScore) {
      setFormError(`Score cannot exceed ${maxScore}.`);
      return;
    }

    try {
      setSaving(true);

      await gradeProfessorSubmission(selectedId, {
        score: numericScore,
        feedback: feedback.trim() || null,
      });

      setSelectedId(null);
      setScore("");
      setFeedback("");

      await loadData();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to grade submission."
      );
    } finally {
      setSaving(false);
    }
  }

  function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading submissions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Submissions & Grading
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review student work and provide grades and feedback.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Submissions</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {submissions.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Awaiting Grading</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {pendingSubmissions.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Graded</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {gradedSubmissions.length}
          </p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="font-medium text-slate-700">
            No student submissions yet.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Submissions will appear here when students submit their assignments.
          </p>
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Awaiting Grading ({pendingSubmissions.length})
            </h2>

            {pendingSubmissions.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                All submissions have been graded.
              </div>
            ) : (
              pendingSubmissions.map((submission) => {
                const maxScore = getMaxScore(submission.assignment_id);
                const isSelected = selectedId === submission.id;

                return (
                  <div
                    key={submission.id}
                    className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                          {submission.course_title}
                        </p>
                        <h3 className="mt-1 font-semibold text-slate-900">
                          {submission.assignment_title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-600">
                          Student: {submission.student_name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Submitted: {formatDate(submission.submitted_at)}
                        </p>
                      </div>

                      <span className="h-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                        Pending
                      </span>
                    </div>

                    {submission.content && (
                      <div className="rounded-lg bg-slate-50 p-4">
                        <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                          Student's Answer
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-slate-700">
                          {submission.content}
                        </p>
                      </div>
                    )}

                    {submission.file_url && (
                      <a
                        href={submission.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Open submitted file →
                      </a>
                    )}

                    {isSelected ? (
                      <form
                        onSubmit={handleGrade}
                        className="space-y-4 border-t border-slate-100 pt-4"
                      >
                        {formError && (
                          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {formError}
                          </p>
                        )}

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            Score {maxScore !== null && `(Maximum: ${maxScore})`}
                          </label>
                          <input
                            required
                            type="number"
                            min="0"
                            max={maxScore ?? undefined}
                            step="any"
                            value={score}
                            onChange={(event) => setScore(event.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 sm:max-w-xs"
                            placeholder="Enter score"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">
                            Feedback
                          </label>
                          <textarea
                            rows={3}
                            value={feedback}
                            onChange={(event) => setFeedback(event.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                            placeholder="Write feedback for the student..."
                          />
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {saving ? "Saving..." : "Submit Grade"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedId(null);
                              setFormError("");
                            }}
                            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => openGradingForm(submission)}
                        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                      >
                        Grade Submission
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Graded Submissions ({gradedSubmissions.length})
            </h2>

            {gradedSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                      {submission.course_title}
                    </p>
                    <h3 className="mt-1 font-semibold text-slate-900">
                      {submission.assignment_title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      Student: {submission.student_name}
                    </p>
                    {submission.feedback && (
                      <p className="mt-2 text-sm text-slate-500">
                        Feedback: {submission.feedback}
                      </p>
                    )}
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xl font-bold text-green-600">
                      {Number(submission.score)}
                      {(() => {
                        const max = getMaxScore(submission.assignment_id);
                        return max !== null ? ` / ${max}` : "";
                      })()}
                    </p>
                    <p className="text-xs text-slate-400">Graded</p>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
