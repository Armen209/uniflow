
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    label: "Dashboard",
    href: "/student/dashboard",
  },
  {
    label: "Courses",
    href: "/student/courses",
  },
  {
    label: "Assignments",
    href: "/student/assignments",
  },
  {
    label: "Schedule",
    href: "/student/schedule",
  },
  {
    label: "Materials",
    href: "/student/materials",
  },
  {
    label: "Grades",
    href: "/student/grades",
  },
];

export function DashboardSidebar() {
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
          Menu
        </p>

        {navigation.map((item, index) => {
          const active = pathname === item.href;

          return (
            <div key={item.href}>
              {index === 1 && (
                <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-blue-300">
                  Academic
                </p>
              )}

              <Link
                href={item.href}
                className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-blue-100 hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-6 py-5">
        <p className="text-sm font-medium">Student Portal</p>
        <p className="mt-1 text-xs text-blue-200">UniFlow Account</p>
      </div>
    </aside>
  );
}
