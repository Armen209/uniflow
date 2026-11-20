
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/permissions";
import {
  getProfessorMaterials,
  createProfessorMaterial,
} from "@/lib/services/material.service";

// GET: Get materials belonging to the professor's courses
export async function GET() {
  try {
    const { user, response } = await requireRole(["professor"]);

    if (response) {
      return response;
    }

    const materials = await getProfessorMaterials(user.id);

    return NextResponse.json({
      success: true,
      message: "Professor materials retrieved successfully",
      data: materials,
    });
  } catch (error) {
    console.error("GET /api/professor/materials error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create material for one of the professor's courses
export async function POST(request: Request) {
  try {
    const { user, response } = await requireRole(["professor"]);

    if (response) {
      return response;
    }

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
    if (!Number.isInteger(course_id) || course_id <= 0) {
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
        {
          success: false,
          message: "Title must be between 2 and 200 characters",
        },
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

    const result = await createProfessorMaterial(user.id, {
      course_id,
      title: title.trim(),
      description,
      file_url,
      material_type,
    });

    if ("error" in result) {
      return NextResponse.json(
        {
          success: false,
          message: "Course not found or you do not own this course",
        },
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

    console.error("POST /api/professor/materials error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
