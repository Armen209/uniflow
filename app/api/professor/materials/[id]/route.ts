
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/permissions";
import {
  updateProfessorMaterial,
  deleteProfessorMaterial,
} from "@/lib/services/material.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PUT: Update a material belonging to the professor
export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const { user, response } = await requireRole(["professor"]);

    if (response) {
      return response;
    }

    const { id } = await context.params;
    const materialId = Number(id);

    if (!Number.isInteger(materialId) || materialId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid material ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

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

    const result = await updateProfessorMaterial(
      user.id,
      materialId,
      {
        course_id,
        title: title.trim(),
        description,
        file_url,
        material_type,
      }
    );

    if ("error" in result) {
      if (result.error === "material_not_found") {
        return NextResponse.json(
          {
            success: false,
            message: "Material not found or you do not own this material",
          },
          { status: 404 }
        );
      }

      if (result.error === "course_not_found") {
        return NextResponse.json(
          {
            success: false,
            message: "Course not found or you do not own this course",
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Material updated successfully",
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON" },
        { status: 400 }
      );
    }

    console.error("PUT /api/professor/materials/[id] error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a material belonging to the professor
export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { user, response } = await requireRole(["professor"]);

    if (response) {
      return response;
    }

    const { id } = await context.params;
    const materialId = Number(id);

    if (!Number.isInteger(materialId) || materialId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid material ID" },
        { status: 400 }
      );
    }

    const result = await deleteProfessorMaterial(
      user.id,
      materialId
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Material not found or you do not own this material",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Material deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/professor/materials/[id] error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
