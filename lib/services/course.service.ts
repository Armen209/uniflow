
import "server-only";

import pool from "@/lib/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

// Course information returned from MySQL
export interface Course extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  professor_id: number;
  created_at: Date;
}

// Check whether a user exists and has the professor role
export async function isProfessor(id: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id
     FROM users
     WHERE id = ? AND role = 'professor'
     LIMIT 1`,
    [id]
  );

  return rows.length > 0;
}

// Get all courses
export async function getAllCourses() {
  const [rows] = await pool.query<Course[]>(
    `SELECT
      courses.id,
      courses.title,
      courses.description,
      courses.professor_id,
      courses.created_at,
      users.full_name AS professor_name
    FROM courses
    JOIN users ON courses.professor_id = users.id
    ORDER BY courses.id DESC`
  );

  return rows;
}

// Find a course by ID
export async function findCourseById(id: number) {
  const [rows] = await pool.execute<Course[]>(
    `SELECT
      courses.id,
      courses.title,
      courses.description,
      courses.professor_id,
      courses.created_at,
      users.full_name AS professor_name
    FROM courses
    JOIN users ON courses.professor_id = users.id
    WHERE courses.id = ?
    LIMIT 1`,
    [id]
  );

  return rows[0] ?? null;
}

// Create a new course
export async function createCourse(data: {
  title: string;
  description?: string | null;
  professor_id: number;
}) {
  // Make sure the assigned user is a professor
  const validProfessor = await isProfessor(data.professor_id);

  if (!validProfessor) {
    return null;
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO courses (title, description, professor_id)
     VALUES (?, ?, ?)`,
    [
      data.title,
      data.description ?? null,
      data.professor_id,
    ]
  );

  return {
    id: result.insertId,
    ...data,
    description: data.description ?? null,
  };
}

// Update an existing course
export async function updateCourse(
  id: number,
  data: {
    title: string;
    description?: string | null;
    professor_id: number;
  }
) {
  // Make sure the assigned user is a professor
  const validProfessor = await isProfessor(data.professor_id);

  if (!validProfessor) {
    return null;
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE courses
     SET title = ?, description = ?, professor_id = ?
     WHERE id = ?`,
    [
      data.title,
      data.description ?? null,
      data.professor_id,
      id,
    ]
  );

  return result;
}


// Delete an existing course
export async function deleteCourse(id: number) {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM courses WHERE id = ?`,
    [id]
  );

  return result;
}

// Get courses assigned to a specific professor
export async function getProfessorCourses(professorId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      courses.id,
      courses.title,
      courses.description,
      courses.professor_id,
      courses.created_at,

      COUNT(enrollments.id) AS student_count

    FROM courses

    LEFT JOIN enrollments
      ON courses.id = enrollments.course_id

    WHERE courses.professor_id = ?

    GROUP BY
      courses.id,
      courses.title,
      courses.description,
      courses.professor_id,
      courses.created_at

    ORDER BY courses.id DESC`,
    [professorId]
  );

  return rows;
}

