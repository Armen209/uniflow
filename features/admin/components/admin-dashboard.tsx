
"use client";

import { useEffect, useState } from "react";
import {
  getAdminCourses,
  getAdminEnrollments,
  getAdminUsers,
  type AdminCourse,
  type AdminEnrollment,
  type AdminUser,
} from "@/features/admin/api/admin";

export function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const [usersData, coursesData, enrollmentsData] =
          await Promise.all([
            getAdminUsers(),
            getAdminCourses(),
            getAdminEnrollments(),
          ]);

        if (cancelled) return;

        setUsers(usersData);
        setCourses(coursesData);
        setEnrollments(enrollmentsData);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard data."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const students = users.filter(
    (user) => user.role === "student"
  ).length;

  const professors = users.filter(
    (user) => user.role === "professor"
  ).length;

  // Recently added users
  const recentUsers = [...users]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  // Recently created enrollments
  const recentEnrollments = [...enrollments]
    .sort(
      (a, b) =>
        new Date(b.enrolled_at).getTime() -
        new Date(a.enrolled_at).getTime()
    )
    .slice(0, 5);

  const stats = [
    { label: "Total Users", value: users.length },
    { label: "Students", value: students },
    { label: "Professors", value: professors },
    { label: "Courses", value: courses.length },
    { label: "Enrollments", value: enrollments.length },
  ];

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-muted">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="font-medium text-red-600">{error}</p>

        <button
          onClick={() => setReloadKey((key) => key + 1)}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, Administrator
        </h1>

        <p className="mt-2 text-muted">
          Here's an overview of your university platform.
        </p>
      </div>

      {/* Statistics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-surface p-5 shadow-sm"
          >
            <p className="text-sm text-muted">{stat.label}</p>

            <p className="mt-3 text-3xl font-bold text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* Recently Added Users */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">
          Recently Added Users
        </h2>

        {recentUsers.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No users found.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Created</th>
                </tr>
              </thead>

              <tbody>
                {recentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-4 font-medium text-foreground">
                      {user.full_name}
                    </td>

                    <td className="py-4 text-muted">
                      {user.email}
                    </td>

                    <td className="py-4">
                      <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium capitalize text-primary">
                        {user.role}
                      </span>
                    </td>

                    <td className="py-4 text-muted">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Courses Overview */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">
          Courses Overview
        </h2>

        {courses.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No courses have been created yet.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.slice(0, 6).map((course) => (
              <div
                key={course.id}
                className="rounded-lg border border-border p-4"
              >
                <h3 className="font-semibold text-foreground">
                  {course.title}
                </h3>

                <p className="mt-2 text-sm text-muted">
                  Professor: {course.professor_name || "Not assigned"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Enrollments */}
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">
          Recent Enrollments
        </h2>

        {recentEnrollments.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No enrollments found.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="pb-3 font-medium">Student</th>
                  <th className="pb-3 font-medium">Course</th>
                  <th className="pb-3 font-medium">Enrolled</th>
                </tr>
              </thead>

              <tbody>
                {recentEnrollments.map((enrollment) => (
                  <tr
                    key={enrollment.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-4 font-medium text-foreground">
                      {enrollment.student_name}
                    </td>

                    <td className="py-4 text-muted">
                      {enrollment.course_title}
                    </td>

                    <td className="py-4 text-muted">
                      {new Date(
                        enrollment.enrolled_at
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
