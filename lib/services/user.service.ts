import "server-only";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import pool from "@/lib/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

// User information returned from MySQL
export interface User extends RowDataPacket {
  id: number;
  full_name: string;
  email: string;
  role: "student" | "professor" | "admin";
  created_at: Date;
  updated_at: Date;
}

// Find user by ID
export async function findUserById(id: number) {
  const [rows] = await pool.execute<User[]>(
    `SELECT
      id,
      full_name,
      email,
      role,
      created_at,
      updated_at
    FROM users
    WHERE id = ?
    LIMIT 1`,
    [id]
  );

  return rows[0] ?? null;
}

// Get all users
export async function getAllUsers() {
  const [rows] = await pool.query<User[]>(
    `SELECT
      id,
      full_name,
      email,
      role,
      created_at,
      updated_at
    FROM users
    ORDER BY id DESC`
  );

  return rows;
}

// Create a new student
export async function createStudent(data: {
  full_name: string;
  email: string;
  password: string;
}) {
  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 12);

  // Insert into database
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO users (full_name, email, password_hash)
     VALUES (?, ?, ?)`,
    [data.full_name, data.email, passwordHash]
  );

  return {
    id: result.insertId,
    full_name: data.full_name,
    email: data.email,
    role: "student" as const,
  };
}


interface UserWithPassword extends RowDataPacket {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: "student" | "professor" | "admin";
}

// Find user by email
export async function findUserByEmail(email: string) {
  const [rows] = await pool.execute<UserWithPassword[]>(
    `SELECT
      id,
      full_name,
      email,
      password_hash,
      role
    FROM users
    WHERE email = ?
    LIMIT 1`,
    [email]
  );

  return rows[0] ?? null;
}

// Verify user password
export async function verifyPassword(
  password: string,
  passwordHash: string
) {
  return bcrypt.compare(password, passwordHash);
}



// Create a user with a selected role
export async function createUser(data: {
  full_name: string;
  email: string;
  password: string;
  role: "student" | "professor" | "admin";
}) {
  // 1. Hash the password
  const passwordHash = await bcrypt.hash(data.password, 12);

  // 2. Insert the user into MySQL
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES (?, ?, ?, ?)`,
    [
      data.full_name,
      data.email,
      passwordHash,
      data.role,
    ]
  );

  // 3. Return safe user information
  return {
    id: result.insertId,
    full_name: data.full_name,
    email: data.email,
    role: data.role,
  };
}

// Update an existing user
export async function updateUser(
  id: number,
  data: {
    full_name: string;
    email: string;
    role: "student" | "professor" | "admin";
    password?: string;
  }
) {
  // 1. Update the password only if a new one was provided
  if (data.password) {
    const passwordHash = await bcrypt.hash(data.password, 12);

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE users
       SET full_name = ?, email = ?, role = ?, password_hash = ?
       WHERE id = ?`,
      [
        data.full_name,
        data.email,
        data.role,
        passwordHash,
        id,
      ]
    );

    return result;
  }

  // 2. Otherwise, keep the existing password
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE users
     SET full_name = ?, email = ?, role = ?
     WHERE id = ?`,
    [
      data.full_name,
      data.email,
      data.role,
      id,
    ]
  );

  return result;
}

// Delete an existing user
export async function deleteUser(id: number) {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM users WHERE id = ?`,
    [id]
  );

  return result;
}

// Create a password reset token
export async function createPasswordResetToken(userId: number) {
  // Generate a secure random token
  const token = crypto.randomBytes(32).toString("hex");

  // Store only the SHA-256 hash
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // Token expires in 15 minutes
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Invalidate previous unused tokens for this user
  await pool.execute(
    `UPDATE password_reset_tokens
     SET used_at = NOW()
     WHERE user_id = ?
       AND used_at IS NULL`,
    [userId]
  );

  // Save the new token hash
  await pool.execute(
    `INSERT INTO password_reset_tokens
     (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [userId, tokenHash, expiresAt]
  );

  // Return the original token for the reset link
  return token;
}

// Reset a user's password
export async function resetUserPassword(
  token: string,
  newPassword: string
) {
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const passwordHash = await bcrypt.hash(newPassword, 12);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT id, user_id
       FROM password_reset_tokens
       WHERE token_hash = ?
         AND expires_at > NOW()
         AND used_at IS NULL
       LIMIT 1
       FOR UPDATE`,
      [tokenHash]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return false;
    }

    const resetToken = rows[0];

    await connection.execute(
      `UPDATE users
       SET password_hash = ?
       WHERE id = ?`,
      [passwordHash, resetToken.user_id]
    );

    await connection.execute(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE id = ?`,
      [resetToken.id]
    );

    // Invalidate any other outstanding reset tokens
    await connection.execute(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE user_id = ?
         AND used_at IS NULL`,
      [resetToken.user_id]
    );

    await connection.commit();

    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}