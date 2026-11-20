
"use client";

import { useEffect, useState } from "react";
import {
  getProfessorMaterials,
  type ProfessorMaterial,
} from "@/features/professor/api/professor";

export function ProfessorMaterials() {
  const [materials, setMaterials] = useState<ProfessorMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  async function loadMaterials() {
    try {
      setLoading(true);
      setError("");

      const data = await getProfessorMaterials();
      setMaterials(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load materials."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  const filteredMaterials = materials.filter((material) => {
    const query = search.toLowerCase();

    const matchesSearch =
      material.title.toLowerCase().includes(query) ||
      material.course_title.toLowerCase().includes(query) ||
      (material.description ?? "").toLowerCase().includes(query);

    const matchesType =
      selectedType === "all" || material.material_type === selectedType;

    return matchesSearch && matchesType;
  });

  function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function typeLabel(type: ProfessorMaterial["material_type"]) {
    const labels = {
      document: "Document",
      video: "Video",
      link: "Link",
      other: "Other",
    };

    return labels[type];
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading materials...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadMaterials}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Course Materials
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View and access learning materials for your courses.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Materials</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {materials.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Courses With Materials</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {new Set(materials.map((material) => material.course_id)).size}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search materials or courses..."
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
        />

        <select
          value={selectedType}
          onChange={(event) => setSelectedType(event.target.value)}
          className="rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
        >
          <option value="all">All types</option>
          <option value="document">Documents</option>
          <option value="video">Videos</option>
          <option value="link">Links</option>
          <option value="other">Other</option>
        </select>
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="font-medium text-slate-700">
            {materials.length === 0
              ? "No materials added yet."
              : "No materials match your search."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                    {material.course_title}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">
                    {material.title}
                  </h2>
                </div>

                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  {typeLabel(material.material_type)}
                </span>
              </div>

              {material.description && (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {material.description}
                </p>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-400">
                  Added {formatDate(material.created_at)}
                </span>

                {material.file_url ? (
                  <a
                    href={material.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                  >
                    Open Material ↗
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">
                    No file available
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
