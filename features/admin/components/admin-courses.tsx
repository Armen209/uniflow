
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAdminCourses,
  getAdminUsers,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
  type AdminCourse,
  type AdminUser,
} from "@/features/admin/api/admin";

type CourseFormData = {
  title: string;
  description: string;
  professor_id: string;
};

const emptyForm: CourseFormData = {
  title: "",
  description: "",
  professor_id: "",
};

export function AdminCourses() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [professors, setProfessors] = useState<AdminUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);

  const [formData, setFormData] = useState<CourseFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [courseData, userData] = await Promise.all([
        getAdminCourses(),
        getAdminUsers(),
      ]);

      setCourses(courseData);
      setProfessors(userData.filter((user) => user.role === "professor"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load courses."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredCourses = useMemo(() => {
    const query = search.toLowerCase();

    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        (course.professor_name ?? "").toLowerCase().includes(query)
    );
  }, [courses, search]);

  function openCreateForm() {
    setEditingCourse(null);
    setFormData(emptyForm);
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(course: AdminCourse) {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description ?? "",
      professor_id: String(course.professor_id),
    });
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingCourse(null);
    setFormData(emptyForm);
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.professor_id) {
      setFormError("Please select a professor.");
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      const data = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        professor_id: Number(formData.professor_id),
      };

      if (editingCourse) {
        const updatedCourse = await updateAdminCourse(
          editingCourse.id,
          data
        );

        setCourses((current) =>
          current.map((course) =>
            course.id === updatedCourse.id ? updatedCourse : course
          )
        );
      } else {
        const createdCourse = await createAdminCourse(data);

        setCourses((current) => [createdCourse, ...current]);
      }

      closeForm();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save course."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(course: AdminCourse) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${course.title}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(course.id);

      await deleteAdminCourse(course.id);

      setCourses((current) =>
        current.filter((item) => item.id !== course.id)
      );

      if (editingCourse?.id === course.id) {
        closeForm();
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to delete course."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <p className="text-muted">Loading courses...</p>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Courses Management
          </h1>
          <p className="mt-2 text-muted">
            Create courses and assign professors.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          + Create Course
        </button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm text-muted">Total Courses</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {courses.length}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm text-muted">Available Professors</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {professors.length}
          </p>
        </div>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-6 text-lg font-semibold text-foreground">
            {editingCourse ? "Edit Course" : "Create New Course"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Course Title
              </label>

              <input
                type="text"
                required
                minLength={2}
                maxLength={150}
                value={formData.title}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    title: event.target.value,
                  })
                }
                placeholder="e.g. Introduction to Programming"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Description
              </label>

              <textarea
                rows={4}
                value={formData.description}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    description: event.target.value,
                  })
                }
                placeholder="Describe the course..."
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Assign Professor
              </label>

              <select
                required
                value={formData.professor_id}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    professor_id: event.target.value,
                  })
                }
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="">Select a professor</option>

                {professors.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.full_name} ({professor.email})
                  </option>
                ))}
              </select>

              {professors.length === 0 && (
                <p className="mt-2 text-sm text-amber-600">
                  No professors available. Create a professor account first.
                </p>
              )}
            </div>

            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving || professors.length === 0}
                className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingCourse
                    ? "Save Changes"
                    : "Create Course"}
              </button>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-foreground hover:bg-background"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search courses or professors..."
        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
      />

      {/* Courses Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">All Courses</h2>
          <span className="text-sm text-muted">
            {filteredCourses.length} courses
          </span>
        </div>

        {filteredCourses.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            No courses found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-background text-muted">
                <tr>
                  <th className="px-5 py-4 font-medium">Course</th>
                  <th className="px-5 py-4 font-medium">Description</th>
                  <th className="px-5 py-4 font-medium">Professor</th>
                  <th className="px-5 py-4 font-medium">Created</th>
                  <th className="px-5 py-4 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="border-t border-border">
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-foreground">
                      {course.title}
                    </td>

                    <td className="max-w-xs px-5 py-4 text-muted">
                      <span className="line-clamp-2">
                        {course.description || "No description"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {course.professor_name || "Not assigned"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {new Date(course.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditForm(course)}
                          className="text-sm font-medium text-primary hover:opacity-70"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(course)}
                          disabled={deletingId === course.id}
                          className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          {deletingId === course.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
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
