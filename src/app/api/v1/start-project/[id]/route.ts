// app/api/start-project/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  getStartProject,
  deleteStartProject,
} from "@/app/services/startaProject.service";
import { verifyTokenAndRole } from "@/app/lib/tokenRoleAccess";


type Context = {
  params: Promise<{ id: string }>;
};

function authErrorResponse(message: string) {
  const status = message.toLowerCase().startsWith("forbidden") ? 403 : 401;
  return NextResponse.json({ success: false, message }, { status });
}

// ── GET ─────────────────────────────
export async function GET(req: NextRequest, { params }: Context) {
  try {
    const auth = verifyTokenAndRole(req, ["admin", "superadmin"]);
    if (!auth.success) return authErrorResponse(auth.message);

    const { id } = await params;
    const doc = await getStartProject(id);

    if (!doc) {
      return NextResponse.json(
        { success: false, message: "Project request not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: doc }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// ── DELETE ─────────────────────────────
export async function DELETE(req: NextRequest, { params }: Context) {
  try {
    const auth = verifyTokenAndRole(req, ["admin", "superadmin"]);
    if (!auth.success) return authErrorResponse(auth.message);

    const { id } = await params;
    const removed = await deleteStartProject(id);

    if (!removed) {
      return NextResponse.json(
        { success: false, message: "Project request not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Deleted successfully", data: removed },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
