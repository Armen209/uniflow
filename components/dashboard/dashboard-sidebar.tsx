
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CalendarDays,
  FolderOpen,
  GraduationCap,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    href: "/student/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Courses",
    href: "/student/courses",
    icon: BookOpen,
  },
  {
    label: "Assignments",
    href: "/student/assignments",
    icon: ClipboardList,
  },
  {
    label: "Schedule",
    href: "/student/schedule",
    icon: CalendarDays,
  },
  {
    label: "Materials",
    href: "/student/materials",
    icon: FolderOpen,
  },
  {
    label: "Grades",
    href: "/student/grades",
    icon: GraduationCap,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-sidebar text-white">
      {/* Brand */}
      <div className="border-b border-white/10 px-6 py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <GraduationCap size={23} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight">
              UniFlow
            </h1>
            <p className="mt-0.5 text-[11px] text-blue-200">
              University Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-7">
        <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300/70">
          Main Menu
        </p>

        {navigation.map((item, index) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          const Icon = item.icon;

          return (
            <div key={item.href}>
              {index === 1 && (
                <p className="mb-4 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300/70">
                  Academic
                </p>
              )}

              <Link
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-white text-indigo-950 shadow-lg shadow-black/10"
                    : "text-blue-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.3 : 1.8}
                  className={
                    active
                      ? "text-primary"
                      : "text-blue-200/70 group-hover:text-white"
                  }
                />

                <span>{item.label}</span>

                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-5">
        <div className="rounded-xl bg-white/10 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-400/20">
              <GraduationCap size={18} />
            </div>

            <div>
              <p className="text-xs font-semibold text-white">
                Student Portal
              </p>
              <p className="mt-1 text-[10px] text-blue-200">
                UniFlow Account
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
