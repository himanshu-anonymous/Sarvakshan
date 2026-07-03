/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminAccount } from "./actions";
import styles from "./setup.module.css";

export default function SetupPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await createAdminAccount(formData);

        if (result.success) {
            router.push("/login");
        } else {
            setError(result.error ?? "Setup failed.");
            setLoading(false);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.logo}>S</div>
                <h1 className={styles.title}>Welcome to Sarvakshan</h1>
                <p className={styles.subtitle}>Create your admin account to get started</p>

                {/* Legacy Data Detection Banner */}
                <div className={styles.legacyNotice}>
                    <strong>💡 Upgrading from an older version?</strong>
                    <p>We've detected legacy SQLite data. Once your new Postgres database is connected, you can import your favorites by running the migration command in your terminal.</p>
                    <code>docker compose exec wwv node scripts/migrate-legacy.mjs</code>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <label className={styles.label} htmlFor="name">
                        Display Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className={styles.input}
                        placeholder="Admin"
                    />

                    <label className={styles.label} htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className={styles.input}
                        placeholder="admin@example.com"
                    />

                    <label className={styles.label} htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        className={styles.input}
                        placeholder="Min. 8 characters"
                    />

                    <label className={styles.label} htmlFor="confirm">
                        Confirm Password
                    </label>
                    <input
                        id="confirm"
                        name="confirm"
                        type="password"
                        required
                        minLength={8}
                        className={styles.input}
                    />

                    {error && <p className={styles.error}>{error}</p>}

                    <button type="submit" disabled={loading} className={styles.button}>
                        {loading ? "Creating..." : "Create Admin Account"}
                    </button>
                </form>
            </div>
        </div>
    );
}
