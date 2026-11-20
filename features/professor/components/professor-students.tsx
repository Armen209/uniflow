"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getProfessorStudents,
  type ProfessorStudent,
} from "@/features/professor/api/professor";

export function ProfessorStudents() {
  const [students, setStudents] = useState<ProfessorStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");

      const data = await getProfessorStudents();
      setStudents(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load students."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  // Group course enrollments by student.
  const groupedStudents = useMemo(() => {
    const studentMap = new Map<
      number,
      {
        id: number;
        name: string;
        email: string;
        courses: string[];
      }
    >();

    for (const student of students) {
      const existing = studentMap.get(student.student_id);

      if (existing) {
        if (!existing.courses.includes(student.course_title)) {
          existing.courses.push(student.course_title);
        }
      } else {
        studentMap.set(student.student_id, {
          id: student.student_id,
          name: student.student_name,
          email: student.student_email,
          courses: [student.course_title],
        });
      }
    }

    return Array.from(studentMap.values());
  }, [students]);

  const filteredStudents = groupedStudents.filter((student) => {
    const query = search.toLowerCase();

    return (
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.courses.some((course) =>
        course.toLowerCase().includes(query)
      )
    );
  });

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading students...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadStudents}
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
        <h1 className="text-2xl font-bold text-slate-900">My Students</h1>
        <p className="mt-1 text-sm text-slate-500">
          View students enrolled in your courses.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Students</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {groupedStudents.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Enrollments</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {students.length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, email, or course..."
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="font-medium text-slate-700">
            {groupedStudents.length === 0
              ? "No students enrolled yet."
              : "No students match your search."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Enrolled Courses</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {student.name}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {student.email}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {student.courses.map((course) => (
                          <span
                            key={course}
                            className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                          >
                            {course}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}