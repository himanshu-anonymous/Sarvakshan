/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compareSync } from "bcryptjs";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";
import { isDemo, isCloud, getDemoAdminSecret, DEMO_ADMIN_ROLE } from "@/core/edition";
import { authConfig } from "@/lib/auth.config";
import { SupabaseAdapter } from "@auth/supabase-adapter";

// Extract local credentials logic to a helper
const localCredentialsProvider = Credentials({
    credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        // Demo edition: virtual admin login (no DB user required)
        const adminSecret = getDemoAdminSecret();
        const secretMatch = adminSecret
            && password.length === adminSecret.length
            && timingSafeEqual(Buffer.from(password), Buffer.from(adminSecret));
        if (isDemo && secretMatch && email === "admin") {
            return {
                id: "demo-admin",
                name: "Demo Admin",
                email: "admin",
                role: DEMO_ADMIN_ROLE,
            };
        }

        const user = await prisma.user.findFirst({
            where: { email }, // Note: in real cloud with RLS this would fetch tenant user if tenantId added
        });
        if (!user) return null;

        const isValid = compareSync(password, user.hashedPassword);
        if (!isValid) return null;

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    session: { strategy: "jwt" },
    adapter: isCloud ? SupabaseAdapter({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || "http://dummy.supabase.co",
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy",
    }) as any : undefined,
    providers: [localCredentialsProvider],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as { role?: string }).role ?? "user";
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as { role?: string }).role = token.role as string;
            }
            return session;
        },
    },
});
