import "server-only";

import pool from "@/lib/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

// Material information returned from MySQL
export interface Material extends RowDataPacket {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  file_url: string | null;
  material_type: "document" | "video" | "link" | "other";
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

// Get all materials
export async function getAllMaterials() {
  const [rows] = await pool.query<Material[]>(
    `SELECT
      materials.id,
      materials.course_id,
      materials.title,
      materials.description,
      materials.file_url,
      materials.material_type,
      materials.created_at,
      courses.title AS course_title
    FROM materials
    JOIN courses ON materials.course_id = courses.id
    ORDER BY materials.created_at DESC`
  );

  return rows;
}

// Find a material by ID
export async function findMaterialById(id: number) {
  const [rows] = await pool.execute<Material[]>(
    `SELECT
      materials.id,
      materials.course_id,
      materials.title,
      materials.description,
      materials.file_url,
      materials.material_type,
      materials.created_at,
      courses.title AS course_title
    FROM materials
    JOIN courses ON materials.course_id = courses.id
    WHERE materials.id = ?
    LIMIT 1`,
    [id]
  );

  return rows[0] ?? null;
}

// Create a new material
export async function createMaterial(data: {
  course_id: number;
  title: string;
  description?: string | null;
  file_url?: string | null;
  material_type?: "document" | "video" | "link" | "other";
}) {
  // Check whether the course exists
  const courseExists = await isCourseExists(data.course_id);

  if (!courseExists) {
    return { error: "course_not_found" as const };
  }

  // Insert the new material
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO materials
      (course_id, title, description, file_url, material_type)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.course_id,
      data.title,
      data.description ?? null,
      data.file_url ?? null,
      data.material_type ?? "document",
    ]
  );

  return {
    id: result.insertId,
    ...data,
    description: data.description ?? null,
    file_url: data.file_url ?? null,
    material_type: data.material_type ?? "document",
  };
}

// Update an existing material
export async function updateMaterial(
  id: number,
  data: {
    course_id: number;
    title: string;
    description?: string | null;
    file_url?: string | null;
    material_type?: "document" | "video" | "link" | "other";
  }
) {
  // Check whether the material exists
  const existingMaterial = await findMaterialById(id);

  if (!existingMaterial) {
    return { error: "material_not_found" as const };
  }

  // Check whether the course exists
  const courseExists = await isCourseExists(data.course_id);

  if (!courseExists) {
    return { error: "course_not_found" as const };
  }

  // Update the material
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE materials
     SET course_id = ?,
         title = ?,
         description = ?,
         file_url = ?,
         material_type = ?
     WHERE id = ?`,
    [
      data.course_id,
      data.title,
      data.description ?? null,
      data.file_url ?? null,
      data.material_type ?? "document",
      id,
    ]
  );

  return result;
}

// Delete an existing material
export async function deleteMaterial(id: number) {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM materials
     WHERE id = ?`,
    [id]
  );

  return result;
}

// Get learning materials for a specific student
export async function getStudentMaterials(studentId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      materials.id,
      materials.course_id,
      materials.title,
      materials.description,
      materials.file_url,
      materials.material_type,
      materials.created_at,
      courses.title AS course_title

    FROM materials

    JOIN courses
      ON materials.course_id = courses.id

    JOIN enrollments
      ON courses.id = enrollments.course_id

    WHERE enrollments.student_id = ?

    ORDER BY materials.created_at DESC`,
    [studentId]
  );

  return rows;
}

// Get learning materials belonging to a professor's courses
export async function getProfessorMaterials(professorId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      materials.id,
      materials.course_id,
      materials.title,
      materials.description,
      materials.file_url,
      materials.material_type,
      materials.created_at,
      courses.title AS course_title
    FROM materials
    JOIN courses
      ON materials.course_id = courses.id
    WHERE courses.professor_id = ?
    ORDER BY materials.created_at DESC`,
    [professorId]
  );

  return rows;
}

// Create material for a professor's own course
export async function createProfessorMaterial(
  professorId: number,
  data: {
    course_id: number;
    title: string;
    description?: string | null;
    file_url?: string | null;
    material_type?: "document" | "video" | "link" | "other";
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

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO materials
      (course_id, title, description, file_url, material_type)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.course_id,
      data.title,
      data.description ?? null,
      data.file_url ?? null,
      data.material_type ?? "document",
    ]
  );

  return {
    id: result.insertId,
    ...data,
    description: data.description ?? null,
    file_url: data.file_url ?? null,
    material_type: data.material_type ?? "document",
  };
}

// Update a material belonging to a professor's course
export async function updateProfessorMaterial(
  professorId: number,
  materialId: number,
  data: {
    course_id: number;
    title: string;
    description?: string | null;
    file_url?: string | null;
    material_type?: "document" | "video" | "link" | "other";
  }
) {
  // Check whether the material belongs to this professor
  const [materials] = await pool.execute<RowDataPacket[]>(
    `SELECT materials.id
     FROM materials
     JOIN courses
       ON materials.course_id = courses.id
     WHERE materials.id = ?
       AND courses.professor_id = ?
     LIMIT 1`,
    [materialId, professorId]
  );

  if (materials.length === 0) {
    return { error: "material_not_found" as const };
  }

  // Check whether the new course also belongs to this professor
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
    `UPDATE materials
     SET course_id = ?,
         title = ?,
         description = ?,
         file_url = ?,
         material_type = ?
     WHERE id = ?`,
    [
      data.course_id,
      data.title,
      data.description ?? null,
      data.file_url ?? null,
      data.material_type ?? "document",
      materialId,
    ]
  );

  return result;
}

// Delete a material belonging to a professor's course
export async function deleteProfessorMaterial(
  professorId: number,
  materialId: number
) {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE materials
     FROM materials
     JOIN courses
       ON materials.course_id = courses.id
     WHERE materials.id = ?
       AND courses.professor_id = ?`,
    [materialId, professorId]
  );

  return result;
}