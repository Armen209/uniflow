
import "server-only";

import pool from "@/lib/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

// Class Session information returned from MySQL
export interface ClassSession extends RowDataPacket {
  id: number;
  course_id: number;
  title: string;
  session_date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  session_type: "lecture" | "seminar" | "lab" | "exam";
  created_at: Date;
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

// Get all class sessions
export async function getAllClassSessions() {
  const [rows] = await pool.query<ClassSession[]>(
    `SELECT
      class_sessions.id,
      class_sessions.course_id,
      class_sessions.title,
      class_sessions.session_date,
      class_sessions.start_time,
      class_sessions.end_time,
      class_sessions.location,
      class_sessions.session_type,
      class_sessions.created_at,
      courses.title AS course_title
    FROM class_sessions
    JOIN courses ON class_sessions.course_id = courses.id
    ORDER BY class_sessions.session_date ASC,
             class_sessions.start_time ASC`
  );

  return rows;
}

// Find a class session by ID
export async function findClassSessionById(id: number) {
  const [rows] = await pool.execute<ClassSession[]>(
    `SELECT
      class_sessions.id,
      class_sessions.course_id,
      class_sessions.title,
      class_sessions.session_date,
      class_sessions.start_time,
      class_sessions.end_time,
      class_sessions.location,
      class_sessions.session_type,
      class_sessions.created_at,
      courses.title AS course_title
    FROM class_sessions
    JOIN courses ON class_sessions.course_id = courses.id
    WHERE class_sessions.id = ?
    LIMIT 1`,
    [id]
  );

  return rows[0] ?? null;
}

// Create a new class session
export async function createClassSession(data: {
  course_id: number;
  title: string;
  session_date: string;
  start_time: string;
  end_time: string;
  location?: string | null;
  session_type?: "lecture" | "seminar" | "lab" | "exam";
}) {
  const courseExists = await isCourseExists(data.course_id);

  if (!courseExists) {
    return { error: "course_not_found" as const };
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO class_sessions
      (course_id, title, session_date, start_time, end_time, location, session_type)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.course_id,
      data.title,
      data.session_date,
      data.start_time,
      data.end_time,
      data.location ?? null,
      data.session_type ?? "lecture",
    ]
  );

  return {
    id: result.insertId,
    ...data,
    location: data.location ?? null,
    session_type: data.session_type ?? "lecture",
  };
}

// Update an existing class session
export async function updateClassSession(
  id: number,
  data: {
    course_id: number;
    title: string;
    session_date: string;
    start_time: string;
    end_time: string;
    location?: string | null;
    session_type?: "lecture" | "seminar" | "lab" | "exam";
  }
) {
  const existingSession = await findClassSessionById(id);

  if (!existingSession) {
    return { error: "session_not_found" as const };
  }

  const courseExists = await isCourseExists(data.course_id);

  if (!courseExists) {
    return { error: "course_not_found" as const };
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE class_sessions
     SET course_id = ?,
         title = ?,
         session_date = ?,
         start_time = ?,
         end_time = ?,
         location = ?,
         session_type = ?
     WHERE id = ?`,
    [
      data.course_id,
      data.title,
      data.session_date,
      data.start_time,
      data.end_time,
      data.location ?? null,
      data.session_type ?? "lecture",
      id,
    ]
  );

  return result;
}

// Delete an existing class session
export async function deleteClassSession(id: number) {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM class_sessions
     WHERE id = ?`,
    [id]
  );

  return result;
}

// Get class sessions for a specific student
export async function getStudentClassSessions(studentId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      class_sessions.id,
      class_sessions.course_id,
      class_sessions.title,
      class_sessions.session_date,
      class_sessions.start_time,
      class_sessions.end_time,
      class_sessions.location,
      class_sessions.session_type,
      class_sessions.created_at,
      courses.title AS course_title,
      users.full_name AS professor_name
    FROM class_sessions
    JOIN courses
      ON class_sessions.course_id = courses.id
    JOIN enrollments
      ON courses.id = enrollments.course_id
    LEFT JOIN users
      ON courses.professor_id = users.id
    WHERE enrollments.student_id = ?
    ORDER BY class_sessions.session_date ASC,
             class_sessions.start_time ASC`,
    [studentId]
  );

  return rows;
}

// Get class sessions for courses belonging to a professor
export async function getProfessorClassSessions(professorId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      class_sessions.id,
      class_sessions.course_id,
      class_sessions.title,
      class_sessions.session_date,
      class_sessions.start_time,
      class_sessions.end_time,
      class_sessions.location,
      class_sessions.session_type,
      class_sessions.created_at,
      courses.title AS course_title
    FROM class_sessions
    JOIN courses
      ON class_sessions.course_id = courses.id
    WHERE courses.professor_id = ?
    ORDER BY class_sessions.session_date ASC,
             class_sessions.start_time ASC`,
    [professorId]
  );

  return rows;
}

// Create a class session for a course owned by a professor
export async function createProfessorClassSession(
  professorId: number,
  data: {
    course_id: number;
    title: string;
    session_date: string;
    start_time: string;
    end_time: string;
    location?: string | null;
    session_type?: "lecture" | "seminar" | "lab" | "exam";
  }
) {
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
    `INSERT INTO class_sessions (
      course_id,
      title,
      session_date,
      start_time,
      end_time,
      location,
      session_type
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.course_id,
      data.title,
      data.session_date,
      data.start_time,
      data.end_time,
      data.location ?? null,
      data.session_type ?? "lecture",
    ]
  );

  return {
    id: result.insertId,
    ...data,
    location: data.location ?? null,
    session_type: data.session_type ?? "lecture",
  };
}


// Update a class session belonging to a professor
export async function updateProfessorClassSession(
  professorId: number,
  sessionId: number,
  data: {
    course_id: number;
    title: string;
    session_date: string;
    start_time: string;
    end_time: string;
    location?: string | null;
    session_type?: "lecture" | "seminar" | "lab" | "exam";
  }
) {
  // Check whether the session belongs to this professor
  const [sessions] = await pool.execute<RowDataPacket[]>(
    `SELECT class_sessions.id
     FROM class_sessions
     JOIN courses
       ON class_sessions.course_id = courses.id
     WHERE class_sessions.id = ?
       AND courses.professor_id = ?
     LIMIT 1`,
    [sessionId, professorId]
  );

  if (sessions.length === 0) {
    return { error: "session_not_found" as const };
  }

  // Check whether the new course belongs to this professor
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
    `UPDATE class_sessions
     SET course_id = ?,
         title = ?,
         session_date = ?,
         start_time = ?,
         end_time = ?,
         location = ?,
         session_type = ?
     WHERE id = ?`,
    [
      data.course_id,
      data.title,
      data.session_date,
      data.start_time,
      data.end_time,
      data.location ?? null,
      data.session_type ?? "lecture",
      sessionId,
    ]
  );

  return result;
}

// Delete a class session belonging to a professor
export async function deleteProfessorClassSession(
  professorId: number,
  sessionId: number
) {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE class_sessions
     FROM class_sessions
     JOIN courses
       ON class_sessions.course_id = courses.id
     WHERE class_sessions.id = ?
       AND courses.professor_id = ?`,
    [sessionId, professorId]
  );

  return result;
}
