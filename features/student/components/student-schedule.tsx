
"use client";

import { useEffect, useState } from "react";
import {
  getStudentSchedule,
  type StudentClassSession,
} from "../api/student";

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  return {
    day: date.toLocaleDateString("en-US", { day: "2-digit" }),
    month: date.toLocaleDateString("en-US", { month: "short" }),
    weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
    full: date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);

  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

const sessionStyles = {
  lecture: "bg-blue-50 text-blue-700 ring-blue-600/20",
  seminar: "bg-purple-50 text-purple-700 ring-purple-600/20",
  lab: "bg-amber-50 text-amber-700 ring-amber-600/20",
  exam: "bg-red-50 text-red-700 ring-red-600/20",
};

const sessionLabels = {
  lecture: "Lecture",
  seminar: "Seminar",
  lab: "Laboratory",
  exam: "Exam",
};

function getSessionDateTime(session: StudentClassSession) {
  return new Date(
    `${session.session_date.slice(0, 10)}T${session.start_time}`
  );
}

export function StudentSchedule() {
  const [sessions, setSessions] = useState<StudentClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    async function loadSchedule() {
      setNow(new Date());

      try {
        const result = await getStudentSchedule();

        const sorted = [...result].sort(
          (a, b) =>
            getSessionDateTime(a).getTime() -
            getSessionDateTime(b).getTime()
        );

        setSessions(sorted);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your schedule."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSchedule();
  }, []);

  const upcomingSessions = now
    ? sessions.filter(
        (session) => getSessionDateTime(session) >= now
      )
    : [];

  const pastSessions = now
    ? sessions.filter(
        (session) => getSessionDateTime(session) < now
      )
    : [];

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <p className="text-sm font-semibold text-primary">Academic</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Class Schedule
        </h1>
        <p className="mt-2 text-sm text-muted">
          Keep track of your lectures, seminars, laboratories, and exams.
        </p>
      </div>

      {/* Summary cards */}
      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">Total classes</p>
            <p className="mt-3 text-3xl font-bold text-foreground">
              {sessions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">Upcoming classes</p>
            <p className="mt-3 text-3xl font-bold text-primary">
              {upcomingSessions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-medium text-muted">Completed classes</p>
            <p className="mt-3 text-3xl font-bold text-foreground">
              {pastSessions.length}
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted">
            Loading your schedule...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-medium text-error">
            Unable to load schedule
          </p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && sessions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path
                strokeLinecap="round"
                d="M16 3v4M8 3v4M3 11h18"
              />
            </svg>
          </div>
          <h2 className="mt-4 font-semibold text-foreground">
            No classes scheduled
          </h2>
          <p className="mt-2 text-sm text-muted">
            Your class schedule will appear here when sessions are published.
          </p>
        </div>
      )}

      {/* Sessions */}
      {!loading && !error && sessions.length > 0 && (
        <section className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              All Classes
            </h2>
            <p className="mt-1 text-sm text-muted">
              Your scheduled academic sessions
            </p>
          </div>

          <div className="space-y-4">
            {sessions.map((session) => {
              const date = formatDate(session.session_date);
              const isUpcoming =
                now !== null && getSessionDateTime(session) >= now;

              return (
                <article
                  key={session.id}
                  className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:p-6"
                >
                  {/* Date block */}
                  <div className="flex shrink-0 items-center gap-4 sm:w-28 sm:flex-col sm:items-center sm:gap-1 sm:rounded-xl sm:bg-background sm:py-4">
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-primary-light text-primary sm:h-auto sm:w-auto sm:bg-transparent">
                      <span className="text-2xl font-bold leading-none">
                        {date.day}
                      </span>
                      <span className="mt-1 text-xs font-semibold uppercase">
                        {date.month}
                      </span>
                    </div>
                    <span className="text-sm text-muted sm:text-xs">
                      {date.weekday}
                    </span>
                  </div>

                  {/* Session information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                          sessionStyles[session.session_type]
                        }`}
                      >
                        {sessionLabels[session.session_type]}
                      </span>

                      {isUpcoming && (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          Upcoming
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-foreground">
                      {session.title}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-primary">
                      {session.course_title}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm text-muted">
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4"
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
                        <span>
                          {formatTime(session.start_time)} –{" "}
                          {formatTime(session.end_time)}
                        </span>
                      </div>

                      {session.location && (
                        <div className="flex items-center gap-2">
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
                              d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
                            />
                            <circle cx="12" cy="10" r="2.5" />
                          </svg>
                          <span>{session.location}</span>
                        </div>
                      )}

                      {session.professor_name && (
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <circle cx="12" cy="8" r="4" />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 21v-2a7 7 0 0 1 14 0v2"
                            />
                          </svg>
                          <span>{session.professor_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
