import { notFound } from "next/navigation";
import CollectionList from "@/components/admin/CollectionList";
import { isCollectionKey } from "@/content/schema";

export default async function CollectionPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  if (!isCollectionKey(collection)) notFound();
  return <CollectionList key={collection} collection={collection} />;
}
