import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB, User, TaskBoard, Task } from "@/lib/mongodb";

export const runtime = "nodejs";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || null;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  
  try {
    await connectDB();
    const user = await User.findById(decoded.id);
    return user ? { id: user._id.toString(), username: user.username } : null;
  } catch (error) {
    console.error("Error getting auth user:", error);
    return null;
  }
}

function isValidObjectId(id) {
  return typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
}

export async function GET(request, { params }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const segments = Array.isArray(params?.route) ? params.route : [];
  const boardId = segments[0];

  try {
    await connectDB();

    if (boardId) {
      // Get specific board
      if (!isValidObjectId(boardId)) {
        return NextResponse.json({ error: "Invalid board id" }, { status: 400 });
      }

      const board = await TaskBoard.findOne({ _id: boardId, userId: user.id });
      if (!board) {
        return NextResponse.json({ error: "Board not found" }, { status: 404 });
      }

      return NextResponse.json({ 
        board: {
          id: board._id.toString(),
          userId: board.userId.toString(),
          name: board.name,
          createdAt: board.createdAt.toISOString()
        }
      }, { status: 200 });
    } else {
      // Get all boards for user
      const boards = await TaskBoard.find({ userId: user.id }).sort({ createdAt: -1 });
      
      const formattedBoards = boards.map(board => ({
        id: board._id.toString(),
        userId: board.userId.toString(),
        name: board.name,
        createdAt: board.createdAt.toISOString()
      }));

      return NextResponse.json({ boards: formattedBoards }, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching boards:", error);
    return NextResponse.json({ error: "Failed to fetch boards" }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = String(body?.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Board name is required" }, { status: 400 });
  }

  try {
    await connectDB();

    const board = new TaskBoard({
      userId: user.id,
      name
    });

    await board.save();
    console.log(`Board created successfully: ${name} for user: ${user.username}`);

    return NextResponse.json({ 
      board: {
        id: board._id.toString(),
        userId: board.userId.toString(),
        name: board.name,
        createdAt: board.createdAt.toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating board:", error);
    return NextResponse.json({ error: "Failed to create board" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const segments = Array.isArray(params?.route) ? params.route : [];
  const boardId = segments[0];
  
  if (!boardId || !isValidObjectId(boardId)) {
    return NextResponse.json({ error: "Invalid board id" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = String(body?.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Board name is required" }, { status: 400 });
  }

  try {
    await connectDB();

    const board = await TaskBoard.findOneAndUpdate(
      { _id: boardId, userId: user.id },
      { name },
      { new: true }
    );

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    console.log(`Board updated successfully: ${boardId} -> ${name}`);

    return NextResponse.json({ 
      board: {
        id: board._id.toString(),
        userId: board.userId.toString(),
        name: board.name,
        createdAt: board.createdAt.toISOString()
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating board:", error);
    return NextResponse.json({ error: "Failed to update board" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const segments = Array.isArray(params?.route) ? params.route : [];
  const boardId = segments[0];
  
  if (!boardId || !isValidObjectId(boardId)) {
    return NextResponse.json({ error: "Invalid board id" }, { status: 400 });
  }

  try {
    await connectDB();

    // Verify board ownership
    const board = await TaskBoard.findOne({ _id: boardId, userId: user.id });
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Delete all tasks associated with the board
    await Task.deleteMany({ boardId });
    
    // Delete the board
    await TaskBoard.deleteOne({ _id: boardId });

    console.log(`Board deleted successfully: ${boardId}`);

    return NextResponse.json({ message: "Board deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting board:", error);
    return NextResponse.json({ error: "Failed to delete board" }, { status: 500 });
  }
} 