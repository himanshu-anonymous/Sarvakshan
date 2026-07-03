/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

const STORAGE_KEY = "wwv_approved_unverified_plugins";

/** Get the set of plugin IDs the user has approved despite being unverified. */
export function getApprovedUnverifiedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set<string>(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/** Mark a plugin as user-approved (won't show the warning again). */
export function approveUnverifiedPlugin(pluginId: string): void {
  const approved = getApprovedUnverifiedIds();
  approved.add(pluginId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...approved]));
}
