
"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  createProfessorAssignment,
  getProfessorAssignments,
  getProfessorCourses,
  type ProfessorAssignment,
  type ProfessorCourse,
} from "@/features/professor/api/professor";

export function ProfessorAssignments() {
  const [assignments, setAssignments] = useState<ProfessorAssignment[]>([]);
  const [courses, setCourses] = useState<ProfessorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState("100");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [assignmentData, courseData] = await Promise.all([
        getProfessorAssignments(),
        getProfessorCourses(),
      ]);

      setAssignments(assignmentData);
      setCourses(courseData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load assignments."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!courseId) {
      setFormError("Please select a course.");
      return;
    }

    if (Number(maxScore) <= 0 || !Number.isFinite(Number(maxScore))) {
      setFormError("Maximum score must be greater than zero.");
      return;
    }

    try {
      setSaving(true);

      await createProfessorAssignment({
        course_id: Number(courseId),
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate ? `${dueDate.replace("T", " ")}:00` : null,
        max_score: Number(maxScore),
      });

      setTitle("");
      setDescription("");
      setDueDate("");
      setMaxScore("100");
      setCourseId("");
      setShowForm(false);

      await loadData();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create assignment."
      );
    } finally {
      setSaving(false);
    }
  }

  function formatDate(value: string | null) {
    if (!value) return "No deadline";

    const date = new Date(value.replace(" ", "T"));

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading assignments...
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Assignments
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage assignments for your courses.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          disabled={courses.length === 0}
          className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {showForm ? "Cancel" : "+ Create Assignment"}
        </button>
      </div>

      {courses.length === 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          You need to have at least one course before creating an assignment.
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            New Assignment
          </h2>

          {formError && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {formError}
            </p>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Course
            </label>
            <select
              required
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Assignment Title
            </label>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter assignment title"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the assignment..."
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Deadline
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Maximum Score
              </label>
              <input
                required
                type="number"
                min="1"
                step="any"
                value={maxScore}
                onChange={(event) => setMaxScore(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Assignment"}
          </button>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Assignments</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {assignments.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Courses</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {courses.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Maximum Total Points</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {assignments.reduce(
              (total, assignment) => total + Number(assignment.max_score || 0),
              0
            )}
          </p>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="font-medium text-slate-700">
            No assignments created yet.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Create your first assignment using the button above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                    {assignment.course_title}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    {assignment.title}
                  </h2>
                  {assignment.description && (
                    <p className="mt-2 text-sm text-slate-600">
                      {assignment.description}
                    </p>
                  )}
                </div>

                <span className="h-fit rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                  {Number(assignment.max_score)} points
                </span>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
                Deadline: {formatDate(assignment.due_date)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
