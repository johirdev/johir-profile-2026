import type { z } from "zod";
export { clientIp, fail, handle, hashIp, isSameOrigin, looksMalicious, ok, rateLimit, readJson } from "@/server/security";

export const formatIssue = (err: z.ZodError) => err.issues[0]?.message ?? "Please check the form";
