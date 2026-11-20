export interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  role: "student" | "professor" | "admin";
  created_at: string;
  updated_at: string;
}

export interface AdminCourse {
  id: number;
  title: string;
  description: string | null;
  professor_id: number;
  professor_name: string | null;
  created_at: string;
}

export interface AdminEnrollment {
  id: number;
  student_id: number;
  course_id: number;
  enrolled_at: string;
  student_name: string;
  course_title: string;
}

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

async function fetchAdminData<T>(endpoint: string): Promise<T> {
  const response = await fetch(endpoint, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  const result: ApiResponse<T> = await response.json();

  if (!response.ok || result.success === false || result.data === undefined) {
    throw new Error(result.message || "Failed to load admin data.");
  }

  return result.data;
}

export function getAdminUsers() {
  return fetchAdminData<AdminUser[]>("/api/admin/users");
}

export function getAdminCourses() {
  return fetchAdminData<AdminCourse[]>("/api/admin/courses");
}

export function getAdminEnrollments() {
  return fetchAdminData<AdminEnrollment[]>("/api/admin/enrollments");
}


export async function createAdminUser(data: {
  full_name: string;
  email: string;
  password: string;
  role: "student" | "professor" | "admin";
}) {
  const response = await fetch("/api/admin/users", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to create user.");
  }

  return result.data as AdminUser;
}

export async function updateAdminUser(
  id: number,
  data: {
    full_name: string;
    email: string;
    role: "student" | "professor" | "admin";
    password?: string;
  }
) {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "PUT",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to update user.");
  }

  return result.data as AdminUser;
}

export async function deleteAdminUser(id: number) {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "DELETE",
    credentials: "same-origin",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to delete user.");
  }
}


export async function createAdminCourse(data: {
  title: string;
  description: string | null;
  professor_id: number;
}) {
  const response = await fetch("/api/admin/courses", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to create course.");
  }

  return result.data as AdminCourse;
}

export async function updateAdminCourse(
  id: number,
  data: {
    title: string;
    description: string | null;
    professor_id: number;
  }
) {
  const response = await fetch(`/api/admin/courses/${id}`, {
    method: "PUT",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to update course.");
  }

  return result.data as AdminCourse;
}

export async function deleteAdminCourse(id: number) {
  const response = await fetch(`/api/admin/courses/${id}`, {
    method: "DELETE",
    credentials: "same-origin",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to delete course.");
  }
}


export async function createAdminEnrollment(data: {
  student_id: number;
  course_id: number;
}) {
  const response = await fetch("/api/admin/enrollments", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to create enrollment.");
  }
}

export async function deleteAdminEnrollment(id: number) {
  const response = await fetch(`/api/admin/enrollments/${id}`, {
    method: "DELETE",
    credentials: "same-origin",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to delete enrollment.");
  }
}
