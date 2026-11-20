import { NextResponse } from "next/server";
import { requireRole } from "@/lib/permissions";
import {
  getAllMaterials,
  createMaterial,
} from "@/lib/services/material.service";

// GET: Get all materials (Admin only)
export async function GET() {
  try {
    await requireRole(["admin"]);

    const materials = await getAllMaterials();

    return NextResponse.json({
      success: true,
      data: materials,
    });
  } catch (error) {
    console.error("GET /api/admin/materials error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create a new material (Admin only)
export async function POST(request: Request) {
  try {
    await requireRole(["admin"]);

    const body = await request.json();

    // Validate request body
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const {
      course_id,
      title,
      description,
      file_url,
      material_type,
    } = body;

    // Validate course ID
    if (
      !Number.isInteger(course_id) ||
      course_id <= 0
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid course_id" },
        { status: 400 }
      );
    }

    // Validate title
    if (
      typeof title !== "string" ||
      title.trim().length < 2 ||
      title.trim().length > 200
    ) {
      return NextResponse.json(
        { success: false, message: "Title must be between 2 and 200 characters" },
        { status: 400 }
      );
    }

    // Validate description
    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid description" },
        { status: 400 }
      );
    }

    // Validate file URL
    if (
      file_url !== undefined &&
      file_url !== null &&
      (typeof file_url !== "string" || file_url.length > 500)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid file_url" },
        { status: 400 }
      );
    }

    // Validate material type
    const allowedTypes = ["document", "video", "link", "other"];

    if (
      material_type !== undefined &&
      !allowedTypes.includes(material_type)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid material_type" },
        { status: 400 }
      );
    }

    // Create material
    const result = await createMaterial({
      course_id,
      title: title.trim(),
      description,
      file_url,
      material_type,
    });

    if ("error" in result) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Material created successfully",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON" },
        { status: 400 }
      );
    }

    console.error("POST /api/admin/materials error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}