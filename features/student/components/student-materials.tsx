"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getStudentMaterials,
  type StudentMaterial,
} from "@/features/student/api/student";

const materialTypeLabels: Record<StudentMaterial["material_type"], string> = {
  document: "Document",
  video: "Video",
  link: "External link",
  other: "Other",
};

const materialTypeStyles: Record<StudentMaterial["material_type"], string> = {
  document: "bg-blue-50 text-blue-700",
  video: "bg-purple-50 text-purple-700",
  link: "bg-emerald-50 text-emerald-700",
  other: "bg-slate-100 text-slate-700",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function StudentMaterials() {
  const [materials, setMaterials] = useState<StudentMaterial[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadMaterials() {
    try {
      setLoading(true);
      setError(null);

      const data = await getStudentMaterials();
      setMaterials(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load learning materials."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  const filteredMaterials = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return materials;

    return materials.filter(
      (material) =>
        material.title.toLowerCase().includes(query) ||
        material.course_title.toLowerCase().includes(query) ||
        material.description?.toLowerCase().includes(query)
    );
  }, [materials, search]);

  const groupedMaterials = useMemo(() => {
    return filteredMaterials.reduce<Record<string, StudentMaterial[]>>(
      (groups, material) => {
        if (!groups[material.course_title]) {
          groups[material.course_title] = [];
        }

        groups[material.course_title].push(material);
        return groups;
      },
      {}
    );
  }, [filteredMaterials]);

  if (loading) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">
            Loading learning materials...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
        <p className="font-medium text-red-700">{error}</p>
        <button
          onClick={loadMaterials}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Learning Materials
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Access documents, videos, and other resources from your courses.
        </p>
      </div>

      {/* Summary and search */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Available materials
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {materials.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Courses with materials
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {new Set(materials.map((material) => material.course_id)).size}
          </p>
        </div>
      </div>

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
          ⌕
        </span>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search materials or courses..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
        />
      </div>

      {/* Materials */}
      {filteredMaterials.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="text-4xl">📚</div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            {materials.length === 0
              ? "No materials available yet"
              : "No materials found"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {materials.length === 0
              ? "Your professors haven't shared any learning materials yet."
              : "Try searching with a different title or course name."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMaterials).map(([courseTitle, items]) => (
            <section key={courseTitle}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {courseTitle}
                </h2>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {items.length} {items.length === 1 ? "resource" : "resources"}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {items.map((material) => (
                  <article
                    key={material.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                          {material.material_type === "document"
                            ? "📄"
                            : material.material_type === "video"
                              ? "🎥"
                              : material.material_type === "link"
                                ? "🔗"
                                : "📁"}
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            materialTypeStyles[material.material_type]
                          }`}
                        >
                          {materialTypeLabels[material.material_type]}
                        </span>
                      </div>

                      <h3 className="mt-4 font-semibold text-slate-900">
                        {material.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {material.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <span className="text-xs text-slate-400">
                        Added {formatDate(material.created_at)}
                      </span>

                      {material.file_url ? (
                        <a
                          href={material.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                        >
                          Open resource
                          <span aria-hidden="true">↗</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">
                          No resource attached
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}