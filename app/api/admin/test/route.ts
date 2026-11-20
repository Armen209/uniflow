
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/permissions";

export async function GET() {
  const { user, response } = await requireRole(["admin"]);

  if (response) {
    return response;
  }

  return NextResponse.json({
    success: true,
    message: "Welcome to the admin area!",
    data: {
      id: user.id,
      full_name: user.full_name,
      role: user.role,
    },
  });
}
