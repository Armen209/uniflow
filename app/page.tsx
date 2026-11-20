
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Layers3,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Course Management",
    description:
      "Keep courses, learning materials, and academic resources organized in one place.",
  },
  {
    icon: ClipboardCheck,
    title: "Assignments & Grades",
    description:
      "Create assignments, submit work, and follow academic performance with ease.",
  },
  {
    icon: CalendarDays,
    title: "Smart Scheduling",
    description:
      "Stay up to date with class schedules, upcoming sessions, and important deadlines.",
  },
  {
    icon: Users,
    title: "Connected Community",
    description:
      "Bring students, professors, and administrators together through one platform.",
  },
];

const roles = [
  {
    icon: GraduationCap,
    title: "For Students",
    description:
      "Access your courses, check grades, submit assignments, and stay organized.",
  },
  {
    icon: BookOpen,
    title: "For Professors",
    description:
      "Manage courses, share materials, create assignments, and evaluate submissions.",
  },
  {
    icon: ShieldCheck,
    title: "For Administrators",
    description:
      "Manage users, oversee courses, and keep university operations organized.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">
      {/* Navigation */}
      <header className="relative z-10 border-b border-slate-100 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <GraduationCap size={23} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Uni<span className="text-indigo-600">Flow</span>
            </span>
          </Link>

          <div className="hidden items-center gap-9 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              About
            </a>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700"
          >
            Sign in <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative isolate bg-[#101a38]">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[550px] w-[550px] rounded-full bg-indigo-600/25 blur-[120px]" />
          <div className="absolute -bottom-60 -left-40 h-[500px] w-[500px] rounded-full bg-blue-500/15 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:48px_48px]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
          <div className="max-w-2xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-sm font-medium text-indigo-200">
              <Sparkles size={15} />
              A smarter way to manage university life
            </div>

            <h1 className="text-5xl leading-[1.1] font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Your university life,
              <span className="mt-2 block bg-gradient-to-r from-indigo-300 via-blue-300 to-cyan-200 bg-clip-text text-transparent">
                all in one flow.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
              Meet UniFlow — a centralized university management platform
              that connects students, professors, and administrators.
              Everything you need for a more organized academic experience.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-indigo-500 px-7 py-4 font-semibold text-white shadow-xl shadow-indigo-950/30 transition hover:-translate-y-1 hover:bg-indigo-400"
              >
                Get started <ArrowRight size={18} />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Explore features
              </a>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-300" />
                One connected platform
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-300" />
                Built for education
              </span>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div className="absolute -inset-5 rounded-[2rem] bg-indigo-500/20 blur-3xl" />

            <div className="relative rounded-2xl border border-white/10 bg-[#18264a] p-3 shadow-2xl shadow-black/30 sm:p-5">
              <div className="flex items-center justify-between border-b border-white/10 px-2 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white">
                    <GraduationCap size={18} />
                  </div>
                  <span className="font-semibold text-white">UniFlow</span>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  Academic overview
                </span>
              </div>

              <div className="px-2 pt-6">
                <p className="text-sm text-slate-400">Welcome back</p>
                <h2 className="mt-1 text-2xl font-bold text-white">
                  Your dashboard
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Here&apos;s what&apos;s happening today.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { label: "My courses", value: "06", icon: BookOpen },
                  { label: "Assignments", value: "04", icon: ClipboardCheck },
                  { label: "Upcoming classes", value: "03", icon: CalendarDays },
                  { label: "Study progress", value: "86%", icon: Layers3 },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          {item.label}
                        </span>
                        <Icon size={17} className="text-indigo-300" />
                      </div>
                      <p className="mt-3 text-2xl font-bold text-white">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">Upcoming classes</h3>
                  <span className="text-xs text-indigo-300">View schedule</span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-200">
                      <span className="text-xs">NOV</span>
                      <span className="font-bold">22</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        JavaScript Fundamentals
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        10:00 AM · Room 301
                      </p>
                    </div>
                    <span className="rounded-lg bg-indigo-500/15 px-2 py-1 text-xs text-indigo-200">
                      Lecture
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-500/15 text-blue-200">
                      <span className="text-xs">NOV</span>
                      <span className="font-bold">22</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        Mathematics
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        01:00 PM · Room 204
                      </p>
                    </div>
                    <span className="rounded-lg bg-blue-500/15 px-2 py-1 text-xs text-blue-200">
                      Class
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-4">
                <Sparkles size={20} className="shrink-0 text-indigo-300" />
                <p className="text-xs leading-5 text-indigo-100">
                  Your academic life, organized and accessible from one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50 px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold tracking-[0.2em] text-indigo-600 uppercase">
              Everything connected
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything your academic life needs
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              UniFlow brings essential university activities together,
              making everyday academic tasks simpler and more organized.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                    <Icon size={23} />
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="about" className="bg-white px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <span className="text-sm font-bold tracking-[0.2em] text-indigo-600 uppercase">
              Designed for everyone
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              One platform. Three connected experiences.
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              Each university role gets the tools and information needed
              to make academic management easier.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {roles.map((role) => {
              const Icon = role.icon;

              return (
                <div
                  key={role.title}
                  className="rounded-2xl border border-slate-200 bg-white p-8 transition hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/5"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#101a38] text-indigo-300">
                    <Icon size={27} />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-900">
                    {role.title}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-600">
                    {role.description}
                  </p>
                  <Link
                    href="/login"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:gap-3"
                  >
                    Access your portal <ArrowRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="px-6 pb-24 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#101a38] px-7 py-16 text-center sm:px-12">
          <div className="absolute -right-20 -top-40 h-80 w-80 rounded-full bg-indigo-500/30 blur-[90px]" />
          <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-blue-500/20 blur-[90px]" />

          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-indigo-200">
              <GraduationCap size={29} />
            </div>
            <h2 className="mt-7 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Make your academic journey simpler.
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-300">
              Everything you need to stay connected, organized, and
              focused on what matters most.
            </p>
            <Link
              href="/login"
              className="mt-9 inline-flex items-center gap-3 rounded-xl bg-indigo-500 px-7 py-4 font-semibold text-white transition hover:-translate-y-1 hover:bg-indigo-400"
            >
              Enter UniFlow <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <GraduationCap size={18} />
            </div>
            <span className="font-bold text-slate-900">
              Uni<span className="text-indigo-600">Flow</span>
            </span>
          </Link>

          <p className="text-center text-sm text-slate-500">
            © © 2026 UniFlow. University management,
            made simpler.
          </p>

          <Link
            href="/login"
            className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
          >
            Sign in <span aria-hidden="true">→</span>
          </Link>
        </div>
      </footer>
    </main>
  );
}
