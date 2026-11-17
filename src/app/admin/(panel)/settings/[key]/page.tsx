import { notFound } from "next/navigation";
import SettingsEditor from "@/components/admin/SettingsEditor";
import { isSettingKey } from "@/content/schema";

export default async function SettingsPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isSettingKey(key)) notFound();
  return <SettingsEditor key={key} settingKey={key} />;
}
