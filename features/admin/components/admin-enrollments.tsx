
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAdminUsers,
  getAdminCourses,
  getAdminEnrollments,
  createAdminEnrollment,
  deleteAdminEnrollment,
  type AdminUser,
  type AdminCourse,
  type AdminEnrollment,
} from "@/features/admin/api/admin";

export function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<AdminEnrollment[]>([]);
  const [students, setStudents] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [newEnrollment, setNewEnrollment] = useState({
    student_id: "",
    course_id: "",
  });

  // Load enrollments, students, and courses
  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [enrollmentData, userData, courseData] = await Promise.all([
        getAdminEnrollments(),
        getAdminUsers(),
        getAdminCourses(),
      ]);

      setEnrollments(enrollmentData);
      setStudents(userData.filter((user) => user.role === "student"));
      setCourses(courseData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load enrollments."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Search and course filtering
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch =
        enrollment.student_name.toLowerCase().includes(searchTerm) ||
        enrollment.course_title.toLowerCase().includes(searchTerm);

      const matchesCourse =
        courseFilter === "all" ||
        enrollment.course_id === Number(courseFilter);

      return matchesSearch && matchesCourse;
    });
  }, [enrollments, search, courseFilter]);

  // Create enrollment
  async function handleCreateEnrollment(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!newEnrollment.student_id || !newEnrollment.course_id) {
      setCreateError("Please select both a student and a course.");
      return;
    }

    try {
      setCreating(true);
      setCreateError(null);

      await createAdminEnrollment({
        student_id: Number(newEnrollment.student_id),
        course_id: Number(newEnrollment.course_id),
      });

      setNewEnrollment({
        student_id: "",
        course_id: "",
      });

      setShowForm(false);

      await loadData();
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create enrollment."
      );
    } finally {
      setCreating(false);
    }
  }

  // Delete enrollment
  async function handleDelete(enrollment: AdminEnrollment) {
    const confirmed = window.confirm(
      `Remove ${enrollment.student_name} from ${enrollment.course_title}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(enrollment.id);
      setError(null);

      await deleteAdminEnrollment(enrollment.id);

      setEnrollments((current) =>
        current.filter((item) => item.id !== enrollment.id)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete enrollment."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const totalStudents = new Set(
    enrollments.map((enrollment) => enrollment.student_id)
  ).size;

  const totalCourses = new Set(
    enrollments.map((enrollment) => enrollment.course_id)
  ).size;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Enrollments
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage student registrations in university courses.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm((current) => !current);
            setCreateError(null);
          }}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {showForm ? "Cancel" : "+ Enroll Student"}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Enrollments</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {enrollments.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Enrolled Students</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {totalStudents}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Courses With Students</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {totalCourses}
          </p>
        </div>
      </div>

      {/* Create Enrollment Form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Enroll a Student
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select a student and the course they should join.
          </p>

          <form onSubmit={handleCreateEnrollment} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="student_id"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Student
                </label>

                <select
                  id="student_id"
                  value={newEnrollment.student_id}
                  onChange={(event) =>
                    setNewEnrollment((current) => ({
                      ...current,
                      student_id: event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select a student</option>

                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="course_id"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Course
                </label>

                <select
                  id="course_id"
                  value={newEnrollment.course_id}
                  onChange={(event) =>
                    setNewEnrollment((current) => ({
                      ...current,
                      course_id: event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select a course</option>

                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {students.length === 0 && (
              <p className="text-sm text-amber-600">
                No students found. Create a student account first.
              </p>
            )}

            {courses.length === 0 && (
              <p className="text-sm text-amber-600">
                No courses found. Create a course first.
              </p>
            )}

            {createError && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {createError}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating || students.length === 0 || courses.length === 0}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? "Enrolling..." : "Create Enrollment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search students or courses..."
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        <select
          value={courseFilter}
          onChange={(event) => setCourseFilter(event.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-primary"
        >
          <option value="all">All Courses</option>

          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-600 sm:flex-row sm:items-center sm:justify-between">
          <p>{error}</p>
          <button
            onClick={loadData}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Enrollments Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">
            Student Enrollments
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {filteredEnrollments.length} enrollment
            {filteredEnrollments.length === 1 ? "" : "s"} found
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading enrollments...
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-gray-700">
              No enrollments found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or enroll a student in a course.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Course</th>
                  <th className="px-6 py-4 font-semibold">Enrollment Date</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredEnrollments.map((enrollment) => (
                  <tr
                    key={enrollment.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {enrollment.student_name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Student ID: {enrollment.student_id}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">
                        {enrollment.course_title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Course ID: {enrollment.course_id}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(enrollment)}
                        disabled={deletingId === enrollment.id}
                        className="font-medium text-red-600 transition hover:text-red-800 disabled:opacity-50"
                      >
                        {deletingId === enrollment.id
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
