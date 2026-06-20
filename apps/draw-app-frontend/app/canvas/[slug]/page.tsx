import { RoomCanvas } from "@/app/components/RoomCanvas";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <RoomCanvas slug={slug} />;
}