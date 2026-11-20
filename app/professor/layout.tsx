
import type { ReactNode } from "react";
import { ProfessorShell } from "@/components/professor/professor-shell";

export default function ProfessorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ProfessorShell>{children}</ProfessorShell>;
}
