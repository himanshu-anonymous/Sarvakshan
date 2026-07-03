/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { isCloud } from "@/core/edition";
import { createClient } from "@supabase/supabase-js";

interface LoginResult {
    success: boolean;
    error?: string;
}

export async function loginAction(formData: FormData): Promise<LoginResult> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isDummyUrl = !supabaseUrl || supabaseUrl.includes("dummy") || supabaseUrl.includes("xyz.supabase.co");

    if (isCloud && !isDummyUrl) {
        // Use Supabase GoTrue
        const supabase = createClient(
            supabaseUrl,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        if (error) return { success: false, error: error.message };
        return { success: true };
    } else {
        try {
            await signIn("credentials", {
                email,
                password,
                redirect: false,
            });
            return { success: true };
        } catch (error) {
            if (error instanceof AuthError) {
                return {
                    success: false,
                    error: error.type === "CredentialsSignin"
                        ? "Invalid email or password."
                        : "Something went wrong.",
                };
            }
            throw error;
        }
    }
}
