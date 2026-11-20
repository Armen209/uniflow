
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Users", href: "/admin/users" },
  { label: "Courses", href: "/admin/courses" },
  { label: "Enrollments", href: "/admin/enrollments" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col bg-sidebar text-white">
      <div className="border-b border-white/10 px-6 py-6">
        <h1 className="text-2xl font-bold tracking-tight">
          UniFlow
        </h1>
        <p className="mt-1 text-sm text-blue-200">
          Administration
        </p>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-primary text-white"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-6 py-5">
        <p className="text-sm font-medium">Admin Portal</p>
        <p className="mt-1 text-xs text-blue-200">
          University Management
        </p>
      </div>
    </aside>
  );
}
