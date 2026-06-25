import crypto from "crypto";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { verifyInitData, verifyLoginWidget, type TgUser } from "./telegram";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user || user.isBlocked) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
    CredentialsProvider({
      id: "telegram",
      name: "Telegram",
      credentials: {
        initData: { label: "initData", type: "text" },
        widget: { label: "widget", type: "text" },
      },
      async authorize(credentials) {
        let tg: TgUser | null = null;
        if (credentials?.initData) {
          tg = verifyInitData(credentials.initData);
        } else if (credentials?.widget) {
          try {
            tg = verifyLoginWidget(JSON.parse(credentials.widget));
          } catch {
            tg = null;
          }
        }
        if (!tg?.id) return null;

        const telegramId = String(tg.id);
        let user = await prisma.user.findUnique({ where: { telegramId } });
        if (!user) {
          const name =
            [tg.first_name, tg.last_name].filter(Boolean).join(" ") ||
            tg.username ||
            "Telegram";
          user = await prisma.user.create({
            data: {
              telegramId,
              name,
              email: `tg_${telegramId}@telegram.local`,
              password: await bcrypt.hash(crypto.randomUUID(), 10),
              role: "CUSTOMER",
            },
          });
        }
        if (user.isBlocked) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CUSTOMER" | "SUPPLIER" | "ADMIN";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
