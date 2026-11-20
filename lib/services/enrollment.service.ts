import "server-only";

import pool from "@/lib/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

// Enrollment information returned from MySQL
export interface Enrollment extends RowDataPacket {
  id: number;
  student_id: number;
  course_id: number;
  enrolled_at: Date;
  student_name: string;
  course_title: string;
}

// Get courses enrolled by a specific student
export async function getStudentCourses(studentId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      courses.id,
      courses.title,
      courses.description,
      users.full_name AS professor_name,
      enrollments.enrolled_at
    FROM enrollments
    JOIN courses ON enrollments.course_id = courses.id
    LEFT JOIN users ON courses.professor_id = users.id
    WHERE enrollments.student_id = ?
    ORDER BY enrollments.enrolled_at DESC`,
    [studentId]
  );

  return rows;
}

// Get details of a specific course enrolled by a student
export async function getStudentCourseById(
  studentId: number,
  courseId: number
) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      courses.id,
      courses.title,
      courses.description,
      courses.professor_id,
      users.full_name AS professor_name,
      users.email AS professor_email,
      enrollments.id AS enrollment_id,
      enrollments.enrolled_at
    FROM enrollments
    JOIN courses ON enrollments.course_id = courses.id
    LEFT JOIN users ON courses.professor_id = users.id
    WHERE enrollments.student_id = ?
      AND enrollments.course_id = ?
    LIMIT 1`,
    [studentId, courseId]
  );

  return rows[0] ?? null;
}

// Check whether a user exists and has the student role
export async function isStudent(id: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id
     FROM users
     WHERE id = ? AND role = 'student'
     LIMIT 1`,
    [id]
  );

  return rows.length > 0;
}

// Get all enrollments
export async function getAllEnrollments() {
  const [rows] = await pool.query<Enrollment[]>(
    `SELECT
      enrollments.id,
      enrollments.student_id,
      enrollments.course_id,
      enrollments.enrolled_at,
      users.full_name AS student_name,
      courses.title AS course_title
    FROM enrollments
    JOIN users ON enrollments.student_id = users.id
    JOIN courses ON enrollments.course_id = courses.id
    ORDER BY enrollments.id DESC`
  );

  return rows;
}

// Find an enrollment by ID
export async function findEnrollmentById(id: number) {
  const [rows] = await pool.execute<Enrollment[]>(
    `SELECT
      enrollments.id,
      enrollments.student_id,
      enrollments.course_id,
      enrollments.enrolled_at,
      users.full_name AS student_name,
      courses.title AS course_title
    FROM enrollments
    JOIN users ON enrollments.student_id = users.id
    JOIN courses ON enrollments.course_id = courses.id
    WHERE enrollments.id = ?
    LIMIT 1`,
    [id]
  );

  return rows[0] ?? null;
}

// Create a new enrollment
export async function createEnrollment(data: {
  student_id: number;
  course_id: number;
}) {
  // Check whether the user is a student
  const validStudent = await isStudent(data.student_id);

  if (!validStudent) {
    return { error: "invalid_student" as const };
  }

  // Check whether the course exists
  const [courses] = await pool.execute<RowDataPacket[]>(
    `SELECT id
     FROM courses
     WHERE id = ?
     LIMIT 1`,
    [data.course_id]
  );

  if (courses.length === 0) {
    return { error: "course_not_found" as const };
  }

  // Check whether the student is already enrolled
  const [existing] = await pool.execute<RowDataPacket[]>(
    `SELECT id
     FROM enrollments
     WHERE student_id = ? AND course_id = ?
     LIMIT 1`,
    [data.student_id, data.course_id]
  );

  if (existing.length > 0) {
    return { error: "already_enrolled" as const };
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO enrollments (student_id, course_id)
       VALUES (?, ?)`,
      [data.student_id, data.course_id]
    );

    return {
      id: result.insertId,
      ...data,
    };
  } catch (error) {
    // Handle duplicate enrollment, including simultaneous requests
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      return { error: "already_enrolled" as const };
    }

    throw error;
  }
}

// Delete an existing enrollment
export async function deleteEnrollment(id: number) {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM enrollments
     WHERE id = ?`,
    [id]
  );

  return result;
}

// Get students enrolled in courses belonging to a professor
export async function getProfessorStudents(professorId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      users.id AS student_id,
      users.full_name AS student_name,
      users.email AS student_email,
      courses.id AS course_id,
      courses.title AS course_title,
      enrollments.enrolled_at
    FROM enrollments
    JOIN courses
      ON enrollments.course_id = courses.id
    JOIN users
      ON enrollments.student_id = users.id
    WHERE courses.professor_id = ?
      AND users.role = 'student'
    ORDER BY courses.title ASC, users.full_name ASC`,
    [professorId]
  );

  return rows;
}