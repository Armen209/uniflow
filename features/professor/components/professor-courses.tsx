
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getProfessorCourses,
  type ProfessorCourse,
} from "@/features/professor/api/professor";

export function ProfessorCourses() {
  const [courses, setCourses] = useState<ProfessorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCourses() {
    setLoading(true);
    setError("");

    try {
      const result = await getProfessorCourses();
      setCourses(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load courses."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-muted">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-700">{error}</p>
        <button
          onClick={loadCourses}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            My Courses
          </h1>
          <p className="mt-1 text-sm text-muted">
            View the courses you teach and their enrolled students.
          </p>
        </div>

        <span className="rounded-lg bg-primary-light px-4 py-2 text-sm font-semibold text-primary">
          {courses.length} {courses.length === 1 ? "Course" : "Courses"}
        </span>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-10 text-center">
          <h2 className="font-semibold text-foreground">
            No courses assigned
          </h2>
          <p className="mt-2 text-sm text-muted">
            You don't have any courses assigned to you yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course.id}
              className="rounded-xl border border-border bg-surface p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary-light text-lg font-bold text-primary">
                  {course.title.charAt(0).toUpperCase()}
                </div>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  Active
                </span>
              </div>

              <h2 className="text-lg font-semibold text-foreground">
                {course.title}
              </h2>

              <p className="mt-2 min-h-12 text-sm leading-6 text-muted">
                {course.description || "No description available."}
              </p>

              <div className="mt-5 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">
                    Enrolled students
                  </span>
                  <span className="text-lg font-semibold text-foreground">
                    {Number(course.student_count)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
