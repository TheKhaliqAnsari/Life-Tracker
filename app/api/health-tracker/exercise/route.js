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
    
    const { minutes, type, caloriesBurned } = await request.json();

    if (!minutes || !type || !caloriesBurned) {
      return NextResponse.json(
        { error: "Minutes, type, and calories burned are required" },
        { status: 400 }
      );
    }

    const db = await getRawDB();

    const exerciseEntry = {
      userId: decoded.id,
      minutes: parseInt(minutes),
      type: type,
      caloriesBurned: parseInt(caloriesBurned),
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    };

    const result = await db.collection("exercise_entries").insertOne(exerciseEntry);

    return NextResponse.json({
      message: "Exercise entry added successfully",
      entry: { ...exerciseEntry, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Exercise tracking POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 