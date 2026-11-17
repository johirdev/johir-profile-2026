import { notFound } from "next/navigation";
import RecordEditor from "@/components/admin/RecordEditor";
import { isCollectionKey } from "@/content/schema";

export default async function RecordPage({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await params;
  if (!isCollectionKey(collection) || !(id === "new" || /^[0-9a-f]{24}$/i.test(id))) notFound();
  return <RecordEditor key={`${collection}/${id}`} collection={collection} id={id} />;
}
