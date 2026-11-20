import "server-only";

import pool from "@/lib/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface Submission extends RowDataPacket {
  id: number;
  assignment_id: number;
  student_id: number;
  content: string | null;
  file_url: string | null;
  score: string | null;
  feedback: string | null;
  submitted_at: Date;
  graded_at: Date | null;

  student_name: string;
  assignment_title: string;
  course_id: number;
  course_title: string;
  professor_id: number;
}

export async function isStudent(id: number): Promise<boolean> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM users WHERE id = ? AND role = 'student'",
    [id]
  );

  return rows.length > 0;
}

export async function getAssignmentDetails(id: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      assignments.id,
      assignments.title,
      assignments.max_score,
      courses.id AS course_id,
      courses.title AS course_title,
      courses.professor_id
    FROM assignments
    JOIN courses ON assignments.course_id = courses.id
    WHERE assignments.id = ?`,
    [id]
  );

  return rows[0] ?? null;
}

export async function getAllSubmissions(): Promise<Submission[]> {
  const [rows] = await pool.execute<Submission[]>(
    `SELECT
      submissions.*,
      users.full_name AS student_name,
      assignments.title AS assignment_title,
      courses.id AS course_id,
      courses.title AS course_title,
      courses.professor_id
    FROM submissions
    JOIN users ON submissions.student_id = users.id
    JOIN assignments ON submissions.assignment_id = assignments.id
    JOIN courses ON assignments.course_id = courses.id
    ORDER BY submissions.submitted_at DESC`
  );

  return rows;
}

export async function getStudentSubmissions(
  studentId: number
): Promise<Submission[]> {
  const [rows] = await pool.execute<Submission[]>(
    `SELECT
      submissions.*,
      users.full_name AS student_name,
      assignments.title AS assignment_title,
      courses.id AS course_id,
      courses.title AS course_title,
      courses.professor_id
    FROM submissions
    JOIN users ON submissions.student_id = users.id
    JOIN assignments ON submissions.assignment_id = assignments.id
    JOIN courses ON assignments.course_id = courses.id
    WHERE submissions.student_id = ?
    ORDER BY submissions.submitted_at DESC`,
    [studentId]
  );

  return rows;
}

export async function getProfessorSubmissions(
  professorId: number
): Promise<Submission[]> {
  const [rows] = await pool.execute<Submission[]>(
    `SELECT
      submissions.*,
      users.full_name AS student_name,
      assignments.title AS assignment_title,
      courses.id AS course_id,
      courses.title AS course_title,
      courses.professor_id
    FROM submissions
    JOIN users ON submissions.student_id = users.id
    JOIN assignments ON submissions.assignment_id = assignments.id
    JOIN courses ON assignments.course_id = courses.id
    WHERE courses.professor_id = ?
    ORDER BY submissions.submitted_at DESC`,
    [professorId]
  );

  return rows;
}

export async function createSubmission(data: {
  assignment_id: number;
  student_id: number;
  content?: string | null;
  file_url?: string | null;
}) {
  const studentExists = await isStudent(data.student_id);

  if (!studentExists) {
    return { error: "invalid_student" as const };
  }

  const assignment = await getAssignmentDetails(data.assignment_id);

  if (!assignment) {
    return { error: "assignment_not_found" as const };
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO submissions
        (assignment_id, student_id, content, file_url)
       VALUES (?, ?, ?, ?)`,
      [
        data.assignment_id,
        data.student_id,
        data.content ?? null,
        data.file_url ?? null,
      ]
    );

    return {
      id: result.insertId,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      return { error: "already_submitted" as const };
    }

    throw error;
  }
}

export async function findSubmissionById(
  id: number
): Promise<Submission | null> {
  const [rows] = await pool.execute<Submission[]>(
    `SELECT
      submissions.*,
      users.full_name AS student_name,
      assignments.title AS assignment_title,
      courses.id AS course_id,
      courses.title AS course_title,
      courses.professor_id
    FROM submissions
    JOIN users ON submissions.student_id = users.id
    JOIN assignments ON submissions.assignment_id = assignments.id
    JOIN courses ON assignments.course_id = courses.id
    WHERE submissions.id = ?
    LIMIT 1`,
    [id]
  );

  return rows[0] ?? null;
}

export async function updateSubmission(
  id: number,
  studentId: number,
  data: {
    content?: string | null;
    file_url?: string | null;
  }
) {
  const submission = await findSubmissionById(id);

  if (!submission) {
    return { error: "submission_not_found" as const };
  }

  if (submission.student_id !== studentId) {
    return { error: "forbidden" as const };
  }

  if (submission.score !== null || submission.graded_at !== null) {
    return { error: "already_graded" as const };
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE submissions
     SET content = ?, file_url = ?
     WHERE id = ? AND student_id = ?`,
    [
      data.content ?? submission.content,
      data.file_url ?? submission.file_url,
      id,
      studentId,
    ]
  );

  return {
    success: result.affectedRows > 0,
  };
}

export async function gradeSubmission(
  id: number,
  professorId: number,
  data: {
    score: number;
    feedback?: string | null;
  }
) {
  const submission = await findSubmissionById(id);

  if (!submission) {
    return { error: "submission_not_found" as const };
  }

  if (submission.professor_id !== professorId) {
    return { error: "forbidden" as const };
  }

  if (submission.graded_at !== null) {
    return { error: "already_graded" as const };
  }

  const assignment = await getAssignmentDetails(
    submission.assignment_id
  );

  if (!assignment) {
    return { error: "assignment_not_found" as const };
  }

  const maxScore = Number(assignment.max_score);

  if (
    !Number.isFinite(data.score) ||
    data.score < 0 ||
    data.score > maxScore
  ) {
    return { error: "invalid_score" as const };
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE submissions
     SET score = ?, feedback = ?, graded_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [data.score, data.feedback ?? null, id]
  );

  return {
    success: result.affectedRows > 0,
  };
}

export async function deleteSubmission(
  id: number,
  studentId: number
) {
  const submission = await findSubmissionById(id);

  if (!submission) {
    return { error: "submission_not_found" as const };
  }

  if (submission.student_id !== studentId) {
    return { error: "forbidden" as const };
  }

  if (submission.graded_at !== null) {
    return { error: "already_graded" as const };
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM submissions
     WHERE id = ? AND student_id = ?`,
    [id, studentId]
  );

  return {
    success: result.affectedRows > 0,
  };
}


