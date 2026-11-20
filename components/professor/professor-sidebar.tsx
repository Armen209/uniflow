
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Dashboard", href: "/professor/dashboard" },
  { label: "Courses", href: "/professor/courses" },
  { label: "Students", href: "/professor/students" },
  { label: "Assignments", href: "/professor/assignments" },
  { label: "Schedule", href: "/professor/schedule" },
  { label: "Materials", href: "/professor/materials" },
  { label: "Submissions", href: "/professor/submissions" },
];

export function ProfessorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-[#172554] text-white">
      <div className="border-b border-white/10 px-6 py-6">
        <h1 className="text-2xl font-bold tracking-tight">UniFlow</h1>
        <p className="mt-1 text-xs text-blue-200">
          University Management System
        </p>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-blue-300">
          Professor Menu
        </p>

        {navigation.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium transition ${
                active
                  ? "bg-white/15 text-white"
                  : "text-blue-100 hover:bg-white/10"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-6 py-5">
        <p className="text-sm font-medium">Professor Portal</p>
        <p className="mt-1 text-xs text-blue-200">UniFlow Account</p>
      </div>
    </aside>
  );
}
