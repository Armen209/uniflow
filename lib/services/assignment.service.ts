
import "server-only";

import pool from "@/lib/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

// Assignment information returned from MySQL
export interface Assignment extends RowDataPacket {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  due_date: Date | null;
  max_score: number;
  created_at: Date;
  updated_at: Date;
  course_title: string;
}

// Check whether a course exists
export async function isCourseExists(id: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id
     FROM courses
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows.length > 0;
}

// Get all assignments
export async function getAllAssignments() {
  const [rows] = await pool.query<Assignment[]>(
    `SELECT
      assignments.id,
      assignments.course_id,
      assignments.title,
      assignments.description,
      assignments.due_date,
      assignments.max_score,
      assignments.created_at,
      assignments.updated_at,
      courses.title AS course_title
    FROM assignments
    JOIN courses ON assignments.course_id = courses.id
    ORDER BY assignments.id DESC`
  );

  return rows;
}

// Find an assignment by ID
export async function findAssignmentById(id: number) {
  const [rows] = await pool.execute<Assignment[]>(
    `SELECT
      assignments.id,
      assignments.course_id,
      assignments.title,
      assignments.description,
      assignments.due_date,
      assignments.max_score,
      assignments.created_at,
      assignments.updated_at,
      courses.title AS course_title
    FROM assignments
    JOIN courses ON assignments.course_id = courses.id
    WHERE assignments.id = ?
    LIMIT 1`,
    [id]
  );

  return rows[0] ?? null;
}



// Create a new assignment
export async function createAssignment(data: {
  course_id: number;
  title: string;
  description?: string | null;
  due_date?: string | null;
  max_score?: number;
}) {
  // Check whether the course exists
  const validCourse = await isCourseExists(data.course_id);

  if (!validCourse) {
    return { error: "course_not_found" as const };
  }

  // Insert the assignment
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO assignments (
      course_id,
      title,
      description,
      due_date,
      max_score
    )
    VALUES (?, ?, ?, ?, ?)`,
    [
      data.course_id,
      data.title,
      data.description ?? null,
      data.due_date ?? null,
      data.max_score ?? 100,
    ]
  );

  return {
    id: result.insertId,
    ...data,
    description: data.description ?? null,
    due_date: data.due_date ?? null,
    max_score: data.max_score ?? 100,
  };
}


// Update an existing assignment
export async function updateAssignment(
  id: number,
  data: {
    course_id: number;
    title: string;
    description?: string | null;
    due_date?: string | null;
    max_score?: number;
  }
) {
  // Check whether the assignment exists
  const existingAssignment = await findAssignmentById(id);

  if (!existingAssignment) {
    return { error: "assignment_not_found" as const };
  }

  // Check whether the new course exists
  const validCourse = await isCourseExists(data.course_id);

  if (!validCourse) {
    return { error: "course_not_found" as const };
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE assignments
     SET
       course_id = ?,
       title = ?,
       description = ?,
       due_date = ?,
       max_score = ?
     WHERE id = ?`,
    [
      data.course_id,
      data.title,
      data.description ?? null,
      data.due_date ?? null,
      data.max_score ?? 100,
      id,
    ]
  );

  return result;
}


 // Delete an existing assignment
export async function deleteAssignment(id: number) {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM assignments
     WHERE id = ?`,
    [id]
  );

  return result;
}

// Get assignments for a specific student
export async function getStudentAssignments(studentId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      assignments.id,
      assignments.course_id,
      assignments.title,
      assignments.description,
      assignments.due_date,
      assignments.max_score,
      assignments.created_at,
      assignments.updated_at,
      courses.title AS course_title,

      submissions.id AS submission_id,
      submissions.content AS submission_content,
      submissions.submitted_at,
      submissions.score,
      submissions.feedback,
      submissions.graded_at,

      CASE
        WHEN submissions.id IS NULL THEN 'not_submitted'
        WHEN submissions.graded_at IS NOT NULL THEN 'graded'
        ELSE 'submitted'
      END AS submission_status

    FROM assignments

    JOIN courses
      ON assignments.course_id = courses.id

    JOIN enrollments
      ON courses.id = enrollments.course_id

    LEFT JOIN submissions
      ON assignments.id = submissions.assignment_id
      AND submissions.student_id = ?

    WHERE enrollments.student_id = ?

    ORDER BY assignments.due_date ASC`,
    [studentId, studentId]
  );

  return rows;
}

// Get assignments for courses belonging to a professor
export async function getProfessorAssignments(professorId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      assignments.id,
      assignments.course_id,
      assignments.title,
      assignments.description,
      assignments.due_date,
      assignments.max_score,
      assignments.created_at,
      assignments.updated_at,
      courses.title AS course_title
    FROM assignments
    JOIN courses
      ON assignments.course_id = courses.id
    WHERE courses.professor_id = ?
    ORDER BY assignments.due_date ASC`,
    [professorId]
  );

  return rows;
}

// Create an assignment for a course owned by a professor
export async function createProfessorAssignment(
  professorId: number,
  data: {
    course_id: number;
    title: string;
    description?: string | null;
    due_date?: string | null;
    max_score?: number;
  }
) {
  // Check whether the course belongs to this professor
  const [courses] = await pool.execute<RowDataPacket[]>(
    `SELECT id
     FROM courses
     WHERE id = ? AND professor_id = ?
     LIMIT 1`,
    [data.course_id, professorId]
  );

  if (courses.length === 0) {
    return { error: "course_not_found" as const };
  }

  // Insert the assignment
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO assignments (
      course_id,
      title,
      description,
      due_date,
      max_score
    )
    VALUES (?, ?, ?, ?, ?)`,
    [
      data.course_id,
      data.title,
      data.description ?? null,
      data.due_date ?? null,
      data.max_score ?? 100,
    ]
  );

  return {
    id: result.insertId,
    ...data,
    description: data.description ?? null,
    due_date: data.due_date ?? null,
    max_score: data.max_score ?? 100,
  };
}

// Update an assignment belonging to a professor
export async function updateProfessorAssignment(
  professorId: number,
  assignmentId: number,
  data: {
    course_id: number;
    title: string;
    description?: string | null;
    due_date?: string | null;
    max_score?: number;
  }
) {
  // Check whether the assignment belongs to this professor
  const [assignments] = await pool.execute<RowDataPacket[]>(
    `SELECT assignments.id
     FROM assignments
     JOIN courses
       ON assignments.course_id = courses.id
     WHERE assignments.id = ?
       AND courses.professor_id = ?
     LIMIT 1`,
    [assignmentId, professorId]
  );

  if (assignments.length === 0) {
    return { error: "assignment_not_found" as const };
  }

  // Check whether the destination course belongs to this professor
  const [courses] = await pool.execute<RowDataPacket[]>(
    `SELECT id
     FROM courses
     WHERE id = ? AND professor_id = ?
     LIMIT 1`,
    [data.course_id, professorId]
  );

  if (courses.length === 0) {
    return { error: "course_not_found" as const };
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE assignments
     SET
       course_id = ?,
       title = ?,
       description = ?,
       due_date = ?,
       max_score = ?
     WHERE id = ?`,
    [
      data.course_id,
      data.title,
      data.description ?? null,
      data.due_date ?? null,
      data.max_score ?? 100,
      assignmentId,
    ]
  );

  return result;
}


// Delete an assignment belonging to a professor
export async function deleteProfessorAssignment(
  professorId: number,
  assignmentId: number
) {
  // Check whether the assignment belongs to this professor
  const [assignments] = await pool.execute<RowDataPacket[]>(
    `SELECT assignments.id
     FROM assignments
     JOIN courses
       ON assignments.course_id = courses.id
     WHERE assignments.id = ?
       AND courses.professor_id = ?
     LIMIT 1`,
    [assignmentId, professorId]
  );

  if (assignments.length === 0) {
    return { error: "assignment_not_found" as const };
  }

  // Delete the assignment
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM assignments
     WHERE id = ?`,
    [assignmentId]
  );

  return result;
}