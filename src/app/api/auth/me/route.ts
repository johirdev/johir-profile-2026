import type { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth";
import { handle, ok } from "@/server/security";

export const GET = handle(async (req: NextRequest) => ok(await requireAdmin(req)));
