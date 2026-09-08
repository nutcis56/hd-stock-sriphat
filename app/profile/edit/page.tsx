import ProfileFormClient from "@/components/profile/profile-form-client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ toast?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, { toast }] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true, displayName: true, isActive: true },
    }),
    searchParams,
  ]);
  if (!user?.isActive) notFound();

  return (
    <ProfileFormClient
      key={toast ?? "profile"}
      user={{ username: user.username, displayName: user.displayName }}
      updated={toast === "updated"}
    />
  );
}
