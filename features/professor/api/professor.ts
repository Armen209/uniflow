
export interface ProfessorCourse {
  id: number;
  title: string;
  description: string | null;
  professor_id: number;
  created_at: string;
  student_count: number | string;
}

export interface ProfessorStudent {
  student_id: number;
  student_name: string;
  student_email: string;
  course_id: number;
  course_title: string;
  enrolled_at: string;
}

export interface ProfessorAssignment {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  max_score: number | string;
  created_at: string;
  updated_at: string;
  course_title: string;
}

export interface ProfessorSession {
  id: number;
  course_id: number;
  title: string;
  session_date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  session_type: "lecture" | "seminar" | "lab" | "exam";
  created_at: string;
  course_title: string;
}

export interface ProfessorSubmission {
  id: number;
  assignment_id: number;
  student_id: number;
  content: string | null;
  file_url: string | null;
  submitted_at: string;
  score: number | string | null;
  feedback: string | null;
  graded_at: string | null;
  student_name: string;
  assignment_title: string;
  course_id: number;
  course_title: string;
  professor_id: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ProfessorMaterial {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  file_url: string;
  material_type: "document" | "video" | "link" | "other";
  created_at: string;
  course_title: string;
}

async function fetchProfessorData<T>(endpoint: string): Promise<T> {
  const response = await fetch(endpoint, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  const result: ApiResponse<T> = await response.json();

  if (!response.ok || !result.success || result.data === undefined) {
    throw new Error(result.message || "Failed to load professor data.");
  }

  return result.data;
}

export function getProfessorCourses() {
  return fetchProfessorData<ProfessorCourse[]>("/api/professor/courses");
}

export function getProfessorStudents() {
  return fetchProfessorData<ProfessorStudent[]>("/api/professor/students");
}

export function getProfessorAssignments() {
  return fetchProfessorData<ProfessorAssignment[]>("/api/professor/assignments");
}

export function getProfessorSessions() {
  return fetchProfessorData<ProfessorSession[]>("/api/professor/sessions");
}

export function getProfessorSubmissions() {
  return fetchProfessorData<ProfessorSubmission[]>("/api/professor/submissions");
}

export async function createProfessorAssignment(input: {
  course_id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  max_score: number;
}): Promise<void> {
  const response = await fetch("/api/professor/assignments", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const result: ApiResponse<ProfessorAssignment> =
    await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to create assignment.");
  }
}

export async function createProfessorSession(input: {
  course_id: number;
  title: string;
  session_date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  session_type: "lecture" | "seminar" | "lab" | "exam";
}): Promise<void> {
  const response = await fetch("/api/professor/sessions", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const result: ApiResponse<ProfessorSession> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to create class session.");
  }
}

export function getProfessorMaterials() {
  return fetchProfessorData<ProfessorMaterial[]>("/api/professor/materials");
}

export async function gradeProfessorSubmission(
  submissionId: number,
  input: {
    score: number;
    feedback: string | null;
  }
): Promise<void> {
  const response = await fetch(
    `/api/professor/submissions/${submissionId}/grade`,
    {
      method: "PATCH",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  const result: ApiResponse<ProfessorSubmission> =
    await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to grade submission.");
  }
}