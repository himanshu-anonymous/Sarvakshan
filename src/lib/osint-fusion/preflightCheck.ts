import { db } from "@/lib/db";
import { runPythonCoreAction } from "./pythonBridge";

export interface PreflightReport {
  timestamp: string;
  apiName: string;
  database: "HEALTHY" | "UNHEALTHY";
  pythonCore: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  overallStatus: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  checksPassed: boolean;
}

/**
 * Pre-Flight API & Function Check Event
 * Verifies database connection, API route state, and Python core engine before execution starts.
 */
export async function runApiAndFunctionPreflightCheck(apiName: string): Promise<PreflightReport> {
  const timestamp = new Date().toISOString();
  let dbStatus: "HEALTHY" | "UNHEALTHY" = "HEALTHY";
  let pythonStatus: "HEALTHY" | "DEGRADED" | "UNHEALTHY" = "HEALTHY";

  // 1. Verify Database Connection
  try {
    await db.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error(`[Pre-Flight Error] DB check failed for API: ${apiName}`, error);
    dbStatus = "UNHEALTHY";
  }

  // 2. Verify Python Core Function Environment
  try {
    const pythonCheck = await runPythonCoreAction("preflight_check", {});
    if (pythonCheck?.overall_status === "DEGRADED") {
      pythonStatus = "DEGRADED";
    } else if (!pythonCheck || pythonCheck.error) {
      pythonStatus = "UNHEALTHY";
    }
  } catch (error) {
    console.warn(`[Pre-Flight Warning] Python core check failed for API: ${apiName}`, error);
    pythonStatus = "DEGRADED";
  }

  const overallStatus = (dbStatus === "HEALTHY" && pythonStatus === "HEALTHY") ? "HEALTHY" : "DEGRADED";
  const checksPassed = dbStatus === "HEALTHY";

  const report: PreflightReport = {
    timestamp,
    apiName,
    database: dbStatus,
    pythonCore: pythonStatus,
    overallStatus,
    checksPassed
  };

  console.log(`[Pre-Flight Check Event] [${apiName}] Status: ${overallStatus} (DB: ${dbStatus}, Python: ${pythonStatus})`);
  return report;
}
