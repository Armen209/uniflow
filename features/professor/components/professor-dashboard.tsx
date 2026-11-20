
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getProfessorAssignments,
  getProfessorCourses,
  getProfessorSessions,
  getProfessorStudents,
  getProfessorSubmissions,
  type ProfessorAssignment,
  type ProfessorCourse,
  type ProfessorSession,
  type ProfessorStudent,
  type ProfessorSubmission,
} from "@/features/professor/api/professor";

interface DashboardData {
  courses: ProfessorCourse[];
  students: ProfessorStudent[];
  assignments: ProfessorAssignment[];
  sessions: ProfessorSession[];
  submissions: ProfessorSubmission[];
}

function getSessionDate(session: ProfessorSession) {
  return new Date(
    `${session.session_date}T${session.start_time}`
  );
}

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

export function ProfessorDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [
        courses,
        students,
        assignments,
        sessions,
        submissions,
      ] = await Promise.all([
        getProfessorCourses(),
        getProfessorStudents(),
        getProfessorAssignments(),
        getProfessorSessions(),
        getProfessorSubmissions(),
      ]);

      setData({
        courses,
        students,
        assignments,
        sessions,
        submissions,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setNow(new Date());
    void loadDashboard();
  }, []);

  const statistics = useMemo(() => {
    if (!data) return null;

    const uniqueStudents = new Set(
      data.students.map((student) => student.student_id)
    );

    const pendingSubmissions = data.submissions.filter(
      (submission) => submission.graded_at === null
    );

    const upcomingSessions = now
      ? data.sessions
          .filter((session) => getSessionDate(session) >= now)
          .sort(
            (a, b) =>
              getSessionDate(a).getTime() -
              getSessionDate(b).getTime()
          )
      : [];

    const recentSubmissions = [...data.submissions]
      .sort(
        (a, b) =>
          new Date(b.submitted_at).getTime() -
          new Date(a.submitted_at).getTime()
      )
      .slice(0, 5);

    return {
      courseCount: data.courses.length,
      studentCount: uniqueStudents.size,
      assignmentCount: data.assignments.length,
      pendingCount: pendingSubmissions.length,
      upcomingSessions: upcomingSessions.slice(0, 5),
      recentSubmissions,
    };
  }, [data, now]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-muted">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !data || !statistics) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-700">
          {error || "Unable to load dashboard."}
        </p>
        <button
          onClick={loadDashboard}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Try again
        </button>
      </div>
    );
  }

  const cards = [
    {
      label: "My Courses",
      value: statistics.courseCount,
      description: "Courses you teach",
    },
    {
      label: "Total Students",
      value: statistics.studentCount,
      description: "Unique enrolled students",
    },
    {
      label: "Assignments",
      value: statistics.assignmentCount,
      description: "Assignments created",
    },
    {
      label: "Pending Grading",
      value: statistics.pendingCount,
      description: "Submissions to review",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Overview
        </h1>
        <p className="mt-1 text-sm text-muted">
          Here's what's happening with your courses.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-surface p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-muted">
              {card.label}
            </p>
            <p className="mt-3 text-3xl font-bold text-foreground">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-muted">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">
              Upcoming Classes
            </h2>
            <Link
              href="/professor/schedule"
              className="text-sm font-medium text-primary hover:underline"
            >
              View schedule
            </Link>
          </div>

          {statistics.upcomingSessions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No upcoming classes.
            </p>
          ) : (
            <div className="space-y-4">
              {statistics.upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {session.title}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {session.course_title}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {formatDate(session.session_date)} ·{" "}
                      {formatTime(session.start_time)} –{" "}
                      {formatTime(session.end_time)}
                    </p>
                  </div>
                  {session.location && (
                    <span className="shrink-0 rounded-md bg-background px-2 py-1 text-xs text-muted">
                      {session.location}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">
              Recent Submissions
            </h2>
            <Link
              href="/professor/submissions"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {statistics.recentSubmissions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No submissions yet.
            </p>
          ) : (
            <div className="space-y-4">
              {statistics.recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {submission.student_name}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {submission.assignment_title}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {submission.course_title} ·{" "}
                      {formatDate(submission.submitted_at)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                      submission.graded_at
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {submission.graded_at ? "Graded" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
