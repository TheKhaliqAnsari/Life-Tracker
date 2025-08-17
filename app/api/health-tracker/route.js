import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRawDB } from "@/lib/mongodb";

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

    // Get user's health data
    const weightHistory = await db
      .collection("weight_entries")
      .find({ userId: decoded.id })
      .sort({ date: -1 })
      .limit(30)
      .toArray();

    const calorieHistory = await db
      .collection("meal_entries")
      .find({ userId: decoded.id })
      .sort({ date: -1 })
      .limit(30)
      .toArray();

    const exerciseHistory = await db
      .collection("exercise_entries")
      .find({ userId: decoded.id })
      .sort({ date: -1 })
      .limit(30)
      .toArray();

    return NextResponse.json({
      weightHistory,
      calorieHistory,
      exerciseHistory,
    });
  } catch (error) {
    console.error("Health tracker GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 