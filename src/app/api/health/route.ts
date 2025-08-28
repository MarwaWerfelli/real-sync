import { NextResponse } from "next/server";
import { ref, get } from "firebase/database";
import { database } from "@/lib/firebase";

export async function GET() {
  const startTime = Date.now();

  try {
    // Check Firebase connection
    const dbRef = ref(database, "health");
    await get(dbRef);

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        firebase: "connected",
        database: "accessible",
      },
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        services: {
          firebase: "disconnected",
          database: "inaccessible",
        },
      },
      { status: 503 }
    );
  }
}
