
"use client";

import { useEffect, useState } from "react";
import {
  getStudentCourses,
  type StudentCourse,
} from "../api/student";

export function StudentCourses() {
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        const result = await getStudentCourses();
        setCourses(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load courses."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">Academic</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">
          My Courses
        </h1>
        <p className="mt-2 text-muted">
          View the courses you are currently enrolled in.
        </p>
      </div>

      {loading && (
        <p className="text-sm text-muted">Loading your courses...</p>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="rounded-xl border border-border bg-surface p-10 text-center">
          <h2 className="font-semibold text-foreground">
            No courses yet
          </h2>
          <p className="mt-2 text-sm text-muted">
            You are not enrolled in any courses at the moment.
          </p>
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              You are enrolled in {courses.length}{" "}
              {courses.length === 1 ? "course" : "courses"}.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course.id}
                className="rounded-xl border border-border bg-surface p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-light text-lg font-bold text-primary">
                  {course.title.charAt(0).toUpperCase()}
                </div>

                <h2 className="text-lg font-semibold text-foreground">
                  {course.title}
                </h2>

                <p className="mt-2 min-h-10 text-sm leading-6 text-muted">
                  {course.description || "No course description available."}
                </p>

                <div className="mt-5 border-t border-border pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Professor
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {course.professor_name || "Not assigned"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
