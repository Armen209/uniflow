
import "server-only";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import { findUserById } from "@/lib/services/user.service";

export async function getCurrentUser() {
  // 1. Read the session cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("uniflow_session")?.value;

  if (!token) {
    return null;
  }

  // 2. Get the session secret
  const sessionSecret = process.env.SESSION_SECRET;

  if (!sessionSecret) {
    throw new Error("SESSION_SECRET is not configured");
  }

  const secretKey = new TextEncoder().encode(sessionSecret);

  // 3. Verify the token
  let userId: number;

  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    const subject = payload.sub;

    if (!subject || !/^[1-9]\d*$/.test(subject)) {
      return null;
    }

    userId = Number(subject);

    if (!Number.isSafeInteger(userId)) {
      return null;
    }
  } catch {
    // Invalid, expired, or modified token
    return null;
  }

  // 4. Retrieve the current user from MySQL
  const user = await findUserById(userId);

  // 5. Return null if the account no longer exists
  if (!user) {
    return null;
  }

  return user;
}
