import UserFormClient from "@/components/admin/user-form-client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/products");

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      displayName: true,
      position: true,
      role: true,
    },
  });
  if (!user) notFound();

  return (
    <UserFormClient
      mode="edit"
      user={{
        ...user,
        position: user.position === "PN" ? "PN" : "RN",
      }}
    />
  );
}
