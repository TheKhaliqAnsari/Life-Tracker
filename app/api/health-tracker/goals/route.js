import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRawDB } from "@/lib/mongodb";

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { verifyToken } = await import("@/lib/auth");
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    
    const { type, currentValue, targetValue } = await request.json();

    if (!type || currentValue === undefined || targetValue === undefined) {
      return NextResponse.json(
        { error: "Goal type, current value, and target value are required" },
        { status: 400 }
      );
    }

    const db = await getRawDB();

    const goalEntry = {
      userId: decoded.userId,
      type: type,
      currentValue: parseFloat(currentValue),
      targetValue: parseFloat(targetValue),
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    };

    // Update existing goal or insert new one
    const result = await db.collection("health_goals").updateOne(
      { userId: decoded.userId, type: type },
      { $set: goalEntry },
      { upsert: true }
    );

    return NextResponse.json({
      message: "Health goal set successfully",
      goal: goalEntry,
    });
  } catch (error) {
    console.error("Health goals POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { verifyToken } = await import("@/lib/auth");
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    
    const db = await getRawDB();

    const goals = await db
      .collection("health_goals")
      .find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ goals });
  } catch (error) {
    console.error("Health goals GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 