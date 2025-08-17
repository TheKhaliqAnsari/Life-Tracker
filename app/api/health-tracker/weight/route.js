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
    
    const { weight, height, bmi } = await request.json();

    if (!weight || !height || !bmi) {
      return NextResponse.json(
        { error: "Weight, height, and BMI are required" },
        { status: 400 }
      );
    }

    const db = await getRawDB();

    const weightEntry = {
      userId: decoded.id,
      weight: parseFloat(weight),
      height: parseFloat(height),
      bmi: parseFloat(bmi),
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    };

    const result = await db.collection("weight_entries").insertOne(weightEntry);

    return NextResponse.json({
      message: "Weight entry added successfully",
      entry: { ...weightEntry, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Weight tracking POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 