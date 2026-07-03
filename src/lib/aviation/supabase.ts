/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

/**
 * Aviation database operations — delegates to Prisma repository.
 * Function names preserved for backward compatibility with existing callers.
 */
import { getLatestFromDb, recordToDb } from "./repository";

export async function getLatestFromSupabase() {
    return getLatestFromDb();
}

export async function recordToSupabase(states: any[], timeSecs: number) {
    return recordToDb(states, timeSecs);
}
