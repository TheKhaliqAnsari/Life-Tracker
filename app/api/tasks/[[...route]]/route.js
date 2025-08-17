import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB, User, TaskBoard, Task } from "@/lib/mongodb";

export const runtime = "nodejs";

async function getAuthUser() {
  const token = cookies().get("token")?.value || null;
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

function isValidISODate(s) {
  if (typeof s !== "string" || !s) return false;
  const d = new Date(s);
  return !isNaN(d.getTime());
}

export async function GET(_request, { params }) {
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

    // Get tasks for the board
    const tasks = await Task.find({ boardId }).sort({ order: 1, createdAt: 1 });
    
    const formattedTasks = tasks.map(task => ({
      id: task._id.toString(),
      boardId: task.boardId.toString(),
      title: task.title,
      description: task.description || undefined,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : undefined,
      createdAt: task.createdAt.toISOString()
    }));

    return NextResponse.json({ tasks: formattedTasks }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
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

  const boardId = String(body?.boardId ?? "").trim();
  const title = String(body?.title ?? "").trim();
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const priority = typeof body?.priority === "string" ? body.priority.trim() : "medium";
  let dueDate = typeof body?.dueDate === "string" ? body.dueDate.trim() : undefined;

  if (!boardId || !isValidObjectId(boardId)) {
    return NextResponse.json({ error: "Invalid board id" }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (priority && !["low", "medium", "high"].includes(priority)) {
    return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
  }
  if (dueDate && !isValidISODate(dueDate)) {
    return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 });
  }

  try {
    await connectDB();

    // Verify board ownership
    const board = await TaskBoard.findOne({ _id: boardId, userId: user.id });
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Get the highest order number for proper ordering
    const lastTask = await Task.findOne({ boardId }).sort({ order: -1 });
    const order = lastTask ? lastTask.order + 1 : 0;

    const task = new Task({
      boardId,
      title,
      description: description || undefined,
      status: "pending",
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      order
    });

    await task.save();
    console.log(`Task created successfully: ${title} for board: ${boardId}`);

    return NextResponse.json({ 
      task: {
        id: task._id.toString(),
        boardId: task.boardId.toString(),
        title: task.title,
        description: task.description || undefined,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : undefined,
        createdAt: task.createdAt.toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const segments = Array.isArray(params?.route) ? params.route : [];
  const taskId = segments[0];
  
  if (!taskId || !isValidObjectId(taskId)) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    await connectDB();

    // Find task and verify ownership through board
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const board = await TaskBoard.findOne({ _id: task.boardId, userId: user.id });
    if (!board) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update fields if provided
    const updateData = {};
    
    if (typeof body.title === "string") {
      updateData.title = body.title.trim();
    }
    if (typeof body.description === "string") {
      updateData.description = body.description.trim() || undefined;
    }
    if (typeof body.status === "string") {
      const s = body.status.trim();
      if (s !== "pending" && s !== "completed") {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updateData.status = s;
    }
    if (typeof body.priority === "string") {
      const p = body.priority.trim();
      if (!["low", "medium", "high"].includes(p)) {
        return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
      }
      updateData.priority = p;
    }
    if (typeof body.dueDate === "string" || body.dueDate === null) {
      if (typeof body.dueDate === "string" && body.dueDate && !isValidISODate(body.dueDate)) {
        return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 });
      }
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : undefined;
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true });
    console.log(`Task updated successfully: ${taskId}`);

    return NextResponse.json({ 
      task: {
        id: updatedTask._id.toString(),
        boardId: updatedTask.boardId.toString(),
        title: updatedTask.title,
        description: updatedTask.description || undefined,
        status: updatedTask.status,
        priority: updatedTask.priority,
        dueDate: updatedTask.dueDate ? updatedTask.dueDate.toISOString().split('T')[0] : undefined,
        createdAt: updatedTask.createdAt.toISOString()
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const segments = Array.isArray(params?.route) ? params.route : [];
  const taskId = segments[0];
  
  if (!taskId || !isValidObjectId(taskId)) {
    return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
  }

  try {
    await connectDB();

    // Find task and verify ownership through board
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const board = await TaskBoard.findOne({ _id: task.boardId, userId: user.id });
    if (!board) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Task.findByIdAndDelete(taskId);
    console.log(`Task deleted successfully: ${taskId}`);

    return NextResponse.json({ message: "Task deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const segments = Array.isArray(params?.route) ? params.route : [];
  if (segments[0] !== "reorder") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ids = Array.isArray(body?.ids) ? body.ids.map(String) : null;
  if (!ids || ids.length === 0) {
    return NextResponse.json({ error: "ids array is required" }, { status: 400 });
  }
  if (!ids.every(isValidObjectId)) {
    return NextResponse.json({ error: "Invalid task id in ids" }, { status: 400 });
  }

  try {
    await connectDB();

    // Verify all tasks belong to user's boards
    const tasks = await Task.find({ _id: { $in: ids } });
    const boardIds = [...new Set(tasks.map(t => t.boardId.toString()))];
    
    const boards = await TaskBoard.find({ _id: { $in: boardIds }, userId: user.id });
    if (boards.length !== boardIds.length) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update order for each task
    const updatePromises = ids.map((id, index) => 
      Task.findByIdAndUpdate(id, { order: index })
    );
    
    await Promise.all(updatePromises);
    console.log(`Tasks reordered successfully: ${ids.length} tasks`);

    return NextResponse.json({ message: "Reordered" }, { status: 200 });
  } catch (error) {
    console.error("Error reordering tasks:", error);
    return NextResponse.json({ error: "Failed to reorder tasks" }, { status: 500 });
  }
} 