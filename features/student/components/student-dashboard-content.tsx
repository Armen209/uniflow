
"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getStudentAssignments,
  getStudentCourses,
  getStudentSchedule,
  type StudentAssignment,
  type StudentCourse,
  type StudentClassSession,
} from "../api/student";

interface DashboardData {
  courses: StudentCourse[];
  assignments: StudentAssignment[];
  schedule: StudentClassSession[];
}

function formatDate(value: string) {
  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);

  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isUpcoming(session: StudentClassSession) {
  const date = session.session_date.slice(0, 10);
  const start = new Date(`${date}T${session.start_time}`);

  return start >= new Date();
}

export function StudentDashboardContent() {
  const [data, setData] = useState<DashboardData>({
    courses: [],
    assignments: [],
    schedule: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [courses, assignments, schedule] = await Promise.all([
        getStudentCourses(),
        getStudentAssignments(),
        getStudentSchedule(),
      ]);

      setData({ courses, assignments, schedule });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const upcomingSessions = data.schedule
    .filter(isUpcoming)
    .slice(0, 5);

  const pendingAssignments = data.assignments.filter(
    (assignment) => assignment.submission_status === "not_submitted"
  );

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-muted">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-error">{error}</p>

        <button
          onClick={loadDashboard}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Try again
        </button>
      </div>
    );
  }

  const stats = [
    {
      title: "My Courses",
      value: data.courses.length,
      description: "Enrolled courses",
    },
    {
      title: "Total Assignments",
      value: data.assignments.length,
      description: "Across your courses",
    },
    {
      title: "Pending Assignments",
      value: pendingAssignments.length,
      description: "Not submitted yet",
    },
    {
      title: "Upcoming Classes",
      value: upcomingSessions.length,
      description: "Scheduled sessions",
    },
  ];

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-medium text-primary">Student Portal</p>

        <h1 className="mt-2 text-3xl font-bold text-foreground">
          Dashboard
        </h1>

        <p className="mt-2 text-muted">
          Here's an overview of your academic activities.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Overview
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-xl border border-border bg-surface p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-muted">
                {stat.title}
              </p>

              <p className="mt-3 text-3xl font-bold text-foreground">
                {stat.value}
              </p>

              <p className="mt-2 text-sm text-muted">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-foreground">
            My Courses
          </h2>

          {data.courses.length === 0 ? (
            <p className="text-sm text-muted">
              You are not enrolled in any courses yet.
            </p>
          ) : (
            <div className="space-y-4">
              {data.courses.slice(0, 5).map((course) => (
                <div
                  key={course.id}
                  className="rounded-lg border border-border p-4"
                >
                  <h3 className="font-medium text-foreground">
                    {course.title}
                  </h3>

                  <p className="mt-1 text-sm text-muted">
                    Professor: {course.professor_name || "Not assigned"}
                  </p>

                  {course.description && (
                    <p className="mt-2 text-sm text-muted">
                      {course.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-foreground">
            Upcoming Classes
          </h2>

          {upcomingSessions.length === 0 ? (
            <p className="text-sm text-muted">
              No upcoming classes scheduled.
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-lg border border-border p-4"
                >
                  <h3 className="font-medium text-foreground">
                    {session.title}
                  </h3>

                  <p className="mt-1 text-sm text-muted">
                    {session.course_title}
                  </p>

                  <p className="mt-2 text-sm text-muted">
                    {formatDate(session.session_date)} ·{" "}
                    {formatTime(session.start_time)} –{" "}
                    {formatTime(session.end_time)}
                  </p>

                  <p className="mt-1 text-sm text-muted">
                    {session.location || "Location not specified"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-foreground">
          Assignments
        </h2>

        {data.assignments.length === 0 ? (
          <p className="text-sm text-muted">
            No assignments available yet.
          </p>
        ) : (
          <div className="space-y-3">
            {data.assignments.slice(0, 5).map((assignment) => (
              <div
                key={assignment.id}
                className="flex flex-col justify-between gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="font-medium text-foreground">
                    {assignment.title}
                  </h3>

                  <p className="mt-1 text-sm text-muted">
                    {assignment.course_title}
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Due:{" "}
                    {assignment.due_date
                      ? formatDate(assignment.due_date)
                      : "No deadline"}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                    assignment.submission_status === "graded"
                      ? "bg-green-50 text-green-700"
                      : assignment.submission_status === "submitted"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {assignment.submission_status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
