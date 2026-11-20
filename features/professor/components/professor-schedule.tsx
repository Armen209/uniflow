
"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  createProfessorSession,
  getProfessorSessions,
  getProfessorCourses,
  type ProfessorSession,
  type ProfessorCourse,
} from "@/features/professor/api/professor";

export function ProfessorSchedule() {
  const [sessions, setSessions] = useState<ProfessorSession[]>([]);
  const [courses, setCourses] = useState<ProfessorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [sessionType, setSessionType] =
    useState<ProfessorSession["session_type"]>("lecture");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [sessionData, courseData] = await Promise.all([
        getProfessorSessions(),
        getProfessorCourses(),
      ]);

      setSessions(sessionData);
      setCourses(courseData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load schedule."
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

    if (endTime <= startTime) {
      setFormError("End time must be later than start time.");
      return;
    }

    try {
      setSaving(true);

      await createProfessorSession({
        course_id: Number(courseId),
        title: title.trim(),
        session_date: date,
        start_time: startTime,
        end_time: endTime,
        location: location.trim() || null,
        session_type: sessionType,
      });

      setTitle("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setLocation("");
      setCourseId("");
      setSessionType("lecture");
      setShowForm(false);

      await loadData();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create session."
      );
    } finally {
      setSaving(false);
    }
  }

  function formatDate(value: string) {
    const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatTime(value: string) {
    return value.slice(0, 5);
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading schedule...
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

  const sortedSessions = [...sessions].sort((a, b) => {
    const first = `${a.session_date} ${a.start_time}`;
    const second = `${b.session_date} ${b.start_time}`;
    return first.localeCompare(second);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Class Schedule
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage lectures, seminars, labs, and exams.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          disabled={courses.length === 0}
          className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {showForm ? "Cancel" : "+ Add Class Session"}
        </button>
      </div>

      {courses.length === 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          You need at least one course before adding a class session.
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            New Class Session
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
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
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
              Session Title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Programming"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Date
              </label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Session Type
              </label>
              <select
                value={sessionType}
                onChange={(e) =>
                  setSessionType(
                    e.target.value as ProfessorSession["session_type"]
                  )
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
              >
                <option value="lecture">Lecture</option>
                <option value="seminar">Seminar</option>
                <option value="lab">Lab</option>
                <option value="exam">Exam</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Start Time
              </label>
              <input
                required
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                End Time
              </label>
              <input
                required
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Room 204"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Session"}
          </button>
        </form>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">Total Class Sessions</p>
        <p className="mt-2 text-3xl font-bold text-slate-900">
          {sessions.length}
        </p>
      </div>

      {sortedSessions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="font-medium text-slate-700">
            No class sessions scheduled yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedSessions.map((session) => (
            <div
              key={session.id}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                    {session.course_title}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    {session.title}
                  </h2>
                </div>

                <span className="h-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium capitalize text-indigo-700">
                  {session.session_type}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
                <span>{formatDate(session.session_date)}</span>
                <span>
                  {formatTime(session.start_time)} – {formatTime(session.end_time)}
                </span>
                {session.location && <span>{session.location}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
