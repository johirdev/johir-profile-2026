import "server-only";
import { revalidatePath } from "next/cache";

/** Every public page reads admin-managed content, so refresh the whole site tree. */
export function refreshSite() {
  revalidatePath("/", "layout");
}
