
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ClipboardList,
  Clock,
  CalendarDays,
  ArrowRight,
  GraduationCap,
  MapPin,
  Sparkles,
} from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";

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
  const user = useAuthStore((state) => state.user);

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

  const stats = [
    {
      title: "My Courses",
      value: data.courses.length,
      description: "Enrolled courses",
      icon: BookOpen,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Assignments",
      value: data.assignments.length,
      description: "Total assignments",
      icon: ClipboardList,
      color: "bg-sky-50 text-sky-600",
    },
    {
      title: "Pending Tasks",
      value: pendingAssignments.length,
      description: "Awaiting submission",
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Upcoming Classes",
      value: upcomingSessions.length,
      description: "Scheduled sessions",
      icon: CalendarDays,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-36 rounded-2xl bg-slate-200/70" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-2xl bg-slate-200/70"
            />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-72 rounded-2xl bg-slate-200/70" />
          <div className="h-72 rounded-2xl bg-slate-200/70" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-error">{error}</p>
        <button
          onClick={loadDashboard}
          className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          Try again
        </button>
      </div>
    );
  }

  const firstName = user?.full_name?.split(" ")[0] || "Student";

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-7 text-white shadow-lg shadow-indigo-200/50 md:p-9">
        <div className="relative z-10 max-w-xl">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-indigo-100">
            <Sparkles size={16} />
            Student Portal
          </div>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Welcome back, {firstName}!
          </h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-indigo-100 md:text-base">
            Stay on top of your academic journey. Here's what's happening
            with your courses and assignments.
          </p>

          <Link
            href="/student/assignments"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
          >
            View assignments
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-28 right-32 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-foreground">
            Academic Overview
          </h2>
          <p className="mt-1 text-sm text-muted">
            A quick look at your academic progress.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted">
                    {stat.title}
                  </p>

                  <div className={`rounded-xl p-2.5 ${stat.color}`}>
                    <Icon size={20} />
                  </div>
                </div>

                <p className="mt-5 text-3xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-muted">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Courses and schedule */}
      <section className="grid gap-6 xl:grid-cols-2">
        {/* Courses */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                My Courses
              </h2>
              <p className="mt-1 text-sm text-muted">
                Your enrolled courses
              </p>
            </div>

            <Link
              href="/student/courses"
              className="flex items-center gap-1 text-xs font-semibold text-primary transition hover:text-primary-hover"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {data.courses.length === 0 ? (
            <div className="rounded-xl bg-background px-4 py-10 text-center">
              <BookOpen className="mx-auto text-muted" size={30} />
              <p className="mt-3 text-sm font-medium text-foreground">
                No courses yet
              </p>
              <p className="mt-1 text-xs text-muted">
                Your enrolled courses will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.courses.slice(0, 5).map((course, index) => (
                <div
                  key={course.id}
                  className="flex gap-4 rounded-xl border border-border p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <BookOpen size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      {course.title}
                    </h3>

                    <p className="mt-1 text-xs text-muted">
                      {course.professor_name || "Professor not assigned"}
                    </p>

                    {course.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">
                        {course.description}
                      </p>
                    )}
                  </div>

                  <span className="text-xs font-medium text-slate-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming classes */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Upcoming Classes
              </h2>
              <p className="mt-1 text-sm text-muted">
                Your next scheduled sessions
              </p>
            </div>

            <Link
              href="/student/schedule"
              className="flex items-center gap-1 text-xs font-semibold text-primary transition hover:text-primary-hover"
            >
              View schedule <ArrowRight size={14} />
            </Link>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="rounded-xl bg-background px-4 py-10 text-center">
              <CalendarDays className="mx-auto text-muted" size={30} />
              <p className="mt-3 text-sm font-medium text-foreground">
                No upcoming classes
              </p>
              <p className="mt-1 text-xs text-muted">
                Your schedule is currently clear.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex gap-4">
                  <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-50 px-2 py-3 text-center">
                    <span className="text-[10px] font-bold uppercase text-indigo-500">
                      {new Date(
                        `${session.session_date.slice(0, 10)}T00:00:00`
                      ).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="mt-1 text-xl font-bold text-indigo-700">
                      {new Date(
                        `${session.session_date.slice(0, 10)}T00:00:00`
                      ).getDate()}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 border-b border-border pb-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      {session.title}
                    </h3>

                    <p className="mt-1 text-xs text-muted">
                      {session.course_title}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {formatTime(session.start_time)} –{" "}
                        {formatTime(session.end_time)}
                      </span>

                      <span className="flex items-center gap-1">
                        <MapPin size={13} />
                        {session.location || "Location not specified"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Assignments */}
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Recent Assignments
            </h2>
            <p className="mt-1 text-sm text-muted">
              Keep track of your coursework and deadlines.
            </p>
          </div>

          <Link
            href="/student/assignments"
            className="flex items-center gap-1 text-xs font-semibold text-primary transition hover:text-primary-hover"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {data.assignments.length === 0 ? (
          <div className="rounded-xl bg-background px-4 py-10 text-center">
            <ClipboardList className="mx-auto text-muted" size={30} />
            <p className="mt-3 text-sm font-medium text-foreground">
              No assignments available
            </p>
            <p className="mt-1 text-xs text-muted">
              New assignments will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.assignments.slice(0, 5).map((assignment) => {
              const statusStyles = {
                graded: "bg-emerald-50 text-emerald-700",
                submitted: "bg-sky-50 text-sky-700",
                not_submitted: "bg-amber-50 text-amber-700",
              };

              const status =
                assignment.submission_status as keyof typeof statusStyles;

              return (
                <div
                  key={assignment.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-border p-4 transition hover:border-indigo-200 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600">
                      <ClipboardList size={18} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">
                        {assignment.title}
                      </h3>

                      <p className="mt-1 text-xs text-muted">
                        {assignment.course_title}
                      </p>

                      <p className="mt-2 text-xs text-muted">
                        Due:{" "}
                        {assignment.due_date
                          ? formatDate(assignment.due_date)
                          : "No deadline"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize ${
                      statusStyles[status] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {assignment.submission_status.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom information */}
      <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-5 py-4 text-xs text-indigo-700">
        <GraduationCap size={17} />
        <p>
          Stay organized, keep track of your deadlines, and make the most
          of your academic journey.
        </p>
      </div>
    </div>
  );
}
