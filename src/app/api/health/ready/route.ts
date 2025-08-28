import { NextResponse } from "next/server";
import { ref, get } from "firebase/database";
import { database } from "@/lib/firebase";

export async function GET() {
  const startTime = Date.now();
  const checks = {
    firebase: false,
    database: false,
    memory: false,
    timestamp: new Date().toISOString(),
  };

  try {
    // Check Firebase connection
    try {
      const dbRef = ref(database, "health");
      await get(dbRef);
      checks.firebase = true;
      checks.database = true;
    } catch (firebaseError) {
      console.error("Firebase health check failed:", firebaseError);
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    };

    // Consider healthy if memory usage is reasonable
    checks.memory = memUsageMB.heapUsed < 500; // Less than 500MB

    const responseTime = Date.now() - startTime;
    const isHealthy = checks.firebase && checks.database && checks.memory;

    if (isHealthy) {
      return NextResponse.json({
        status: "ready",
        timestamp: checks.timestamp,
        responseTime: `${responseTime}ms`,
        checks,
        memory: memUsageMB,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
      });
    } else {
      return NextResponse.json(
        {
          status: "not_ready",
          timestamp: checks.timestamp,
          responseTime: `${responseTime}ms`,
          checks,
          memory: memUsageMB,
          issues: Object.entries(checks)
            .filter(([key, value]) => key !== "timestamp" && !value)
            .map(([key]) => key),
        },
        { status: 503 }
      );
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "error",
        timestamp: checks.timestamp,
        responseTime: `${responseTime}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        checks,
      },
      { status: 500 }
    );
  }
}
