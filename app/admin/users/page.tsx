import UserListClient, {
  type UserListItem,
} from "@/components/admin/user-list-client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ toast?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/products");

  const { toast } = await searchParams;
  const records = await prisma.user.findMany({
    where: { username: { not: "admin" } },
    select: {
      id: true,
      username: true,
      displayName: true,
      position: true,
      role: true,
      lastLoginAt: true,
    },
    orderBy: [{ displayName: "asc" }, { username: "asc" }],
  });
  const users: UserListItem[] = records.map((user) => ({
    ...user,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  }));

  return (
    <UserListClient
      key={toast ?? "users"}
      users={users}
      currentUserId={session.user.id}
      successToast={
        toast === "created" ? "created" : toast === "updated" ? "updated" : undefined
      }
    />
  );
}
