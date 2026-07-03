/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { prisma } from "../src/lib/db";
import { hashSync } from "bcryptjs";

async function main() {
    const action = process.argv[2];

    if (action === "list") {
        const users = await prisma.user.findMany();
        if (users.length === 0) {
            console.log("No users found — visit /setup to create one.");
        } else {
            users.forEach((u) =>
                console.log(`  ${u.email} | ${u.name} | ${u.role} | ${u.createdAt}`)
            );
        }
    } else if (action === "reset") {
        const email = process.argv[3];
        const newPass = process.argv[4];
        if (!email || !newPass) {
            console.log("Usage: tsx scripts/manage-users.ts reset <email> <password>");
            return;
        }
        const hashed = hashSync(newPass, 12);
        await prisma.user.update({
            where: { email },
            data: { hashedPassword: hashed },
        });
        console.log(`Password reset for ${email}`);
    } else if (action === "delete-all") {
        await prisma.user.deleteMany();
        console.log("All users deleted — visit /setup to create a new admin.");
    } else {
        console.log("Usage: tsx scripts/manage-users.ts <list|reset|delete-all>");
    }

    await prisma.$disconnect();
}

main().catch(console.error);
