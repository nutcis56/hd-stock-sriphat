import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";

const MAX_FAILED_LOGINS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  providers: [
    Credentials({
      name: "Username and password",
      credentials: {
        username: { label: "ชื่อผู้ใช้", type: "text" },
        password: { label: "รหัสผ่าน", type: "password" },
      },
      async authorize(credentials) {
        const username =
          typeof credentials?.username === "string"
            ? credentials.username.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!username || !password) return null;

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user || !user.isActive) return null;

        const now = new Date();
        if (user.lockedUntil && user.lockedUntil > now) return null;

        const passwordMatches = await compare(password, user.passwordHash);
        if (!passwordMatches) {
          const failedLoginCount = user.lockedUntil ? 1 : user.failedLoginCount + 1;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginCount,
              lockedUntil:
                failedLoginCount >= MAX_FAILED_LOGINS
                  ? new Date(now.getTime() + LOCK_DURATION_MS)
                  : null,
            },
          });
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginCount: 0,
            lockedUntil: null,
            lastLoginAt: now,
          },
        });

        return {
          id: user.id,
          name: user.displayName,
          username: user.username,
          role: user.role,
          position: user.position,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth: session, request }) {
      if (request.nextUrl.pathname === "/login") return true;
      return Boolean(session?.user);
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.position = user.position;
      }
      if (
        trigger === "update" &&
        typeof session?.user?.name === "string" &&
        session.user.name.trim()
      ) {
        token.name = session.user.name.trim();
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = String(token.id);
      session.user.username = String(token.username);
      session.user.role = token.role === "ADMIN" ? "ADMIN" : "USER";
      session.user.position =
        typeof token.position === "string" ? token.position : null;
      return session;
    },
  },
});
