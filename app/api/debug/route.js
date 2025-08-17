import { NextResponse } from "next/server";
import { connectDB, User, TaskBoard, Task } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    
    const userCount = await User.countDocuments();
    const boardCount = await TaskBoard.countDocuments();
    const taskCount = await Task.countDocuments();
    
    // Get recent users (without sensitive data)
    const recentUsers = await User.find({}, 'username createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      hasJWTSecret: !!process.env.JWT_SECRET,
      database: {
        type: 'MongoDB',
        connected: true,
        userCount,
        boardCount,
        taskCount
      },
      recentUsers: recentUsers.map(user => ({
        id: user._id.toString(),
        username: user.username,
        createdAt: user.createdAt.toISOString()
      }))
    };
    
    console.log("Debug info:", debugInfo);
    
    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({ 
      error: error.message,
      timestamp: new Date().toISOString(),
      database: {
        type: 'MongoDB',
        connected: false,
        error: error.message
      }
    }, { status: 500 });
  }
} 