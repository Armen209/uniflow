
export interface StudentCourse {
  id: number;
  title: string;
  description: string | null;
  professor_name: string | null;
  enrolled_at: string;
}

export interface StudentAssignment {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  max_score: number;
  course_title: string;
  submission_id: number | null;
  submission_content: string | null;
  submitted_at: string | null;
  score: number | null;
  feedback: string | null;
  graded_at: string | null;
  submission_status: "not_submitted" | "submitted" | "graded";
}

export interface StudentClassSession {
  id: number;
  course_id: number;
  title: string;
  session_date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  session_type: "lecture" | "seminar" | "lab" | "exam";
  course_title: string;
  professor_name: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface StudentMaterial {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  file_url: string | null;
  material_type: "document" | "video" | "link" | "other";
  created_at: string;
  course_title: string;
}

async function fetchStudentData<T>(endpoint: string): Promise<T> {
  const response = await fetch(endpoint, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  const result: ApiResponse<T> = await response.json();

  if (!response.ok || !result.success || result.data === undefined) {
    throw new Error(result.message || "Failed to load student data.");
  }

  return result.data;
}

export function getStudentCourses() {
  return fetchStudentData<StudentCourse[]>("/api/student/courses");
}

export function getStudentAssignments() {
  return fetchStudentData<StudentAssignment[]>("/api/student/assignments");
}

export function getStudentSchedule() {
  return fetchStudentData<StudentClassSession[]>("/api/student/schedule");
}

export function getStudentMaterials() {
  return fetchStudentData<StudentMaterial[]>("/api/student/materials");
}