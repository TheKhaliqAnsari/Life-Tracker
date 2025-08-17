"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { arrayMove } from "@dnd-kit/sortable";
import { useToast } from "@/components/Toast";

const COLUMNS = [
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
];

function groupTasks(tasks) {
  return {
    pending: tasks.filter((t) => t.status === "pending"),
    completed: tasks.filter((t) => t.status === "completed"),
  };
}

// Priority Chip Component
function PriorityChip({ priority, size = "md" }) {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5"
  };

  const priorityConfig = {
    high: {
      bg: "bg-red-500/20",
      text: "text-red-300",
      border: "border-red-500/30",
      icon: "🔥"
    },
    medium: {
      bg: "bg-yellow-500/20",
      text: "text-yellow-300",
      border: "border-yellow-500/30",
      icon: "⚡"
    },
    low: {
      bg: "bg-green-500/20",
      text: "text-green-300",
      border: "border-green-500/30",
      icon: "🌿"
    }
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium capitalize ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}>
      <span className="text-[10px]">{config.icon}</span>
      {priority}
    </span>
  );
}

// Enhanced Task Card Component
function SortableTaskCard({ task, onToggle, onDelete, onInlineSave, view }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    cursor: "grab",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState(task.priority || "medium");

  async function handleSave(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    await onInlineSave(task.id, { 
      title: t, 
      description: description.trim() || undefined,
      priority: priority
    });
    setIsEditing(false);
  }

  function getDaysUntilDue() {
    if (!task.dueDate) return null;
    const due = new Date(task.dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  const daysUntilDue = getDaysUntilDue();

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="group relative rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-4 shadow-lg hover:border-blue-500/30 hover:shadow-xl transition-all duration-200"
      {...attributes}
      {...listeners}
    >
      {/* Priority Badge - Top Right */}
      <div className="absolute top-3 right-3">
        <PriorityChip priority={task.priority || "medium"} size="sm" />
      </div>

      {/* Status Indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
        task.status === "completed" ? "bg-green-500" : "bg-blue-500"
      }`} />

      <div className="pl-3">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Task title..."
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Task description (optional)..."
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="low">🌿 Low Priority</option>
              <option value="medium">⚡ Medium Priority</option>
              <option value="high">🔥 High Priority</option>
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setTitle(task.title);
                  setDescription(task.description ?? "");
                  setPriority(task.priority || "medium");
                }}
                className="flex-1 rounded-lg border border-gray-600 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Task Content */}
            <div className="mb-3 pr-16">
              <h3 className="text-base font-semibold text-gray-100 mb-1 leading-tight">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-400 leading-relaxed">
                  {task.description}
                </p>
              )}
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div className="mb-3">
                <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                  daysUntilDue < 0 
                    ? "bg-red-500/20 text-red-300 border border-red-500/30" 
                    : daysUntilDue <= 2 
                      ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                      : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                }`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {daysUntilDue < 0 
                    ? `${Math.abs(daysUntilDue)} days overdue` 
                    : daysUntilDue === 0 
                      ? "Due today" 
                      : `${daysUntilDue} days left`
                  }
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={task.status === "completed"}
                  onChange={(e) => onToggle(task.id, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-500 bg-gray-700 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className={task.status === "completed" ? "line-through opacity-75" : ""}>
                  {task.status === "completed" ? "Completed" : "Mark complete"}
                </span>
              </label>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg border border-gray-600 text-gray-400 hover:text-gray-200 hover:border-gray-500 hover:bg-gray-700 transition-colors"
                  title="Edit task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-1.5 rounded-lg border border-red-600/50 text-red-400 hover:text-red-300 hover:border-red-500 hover:bg-red-500/10 transition-colors"
                  title="Delete task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Drag Indicator */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-40 transition-opacity">
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </div>
    </motion.div>
  );
}

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [creating, setCreating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const [activeId, setActiveId] = useState(null);

  // Extract boardId from route parameters
  const boardId = params?.boardId;

  useEffect(() => {
    if (!boardId) return;
    
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.user) {
          router.push("/login");
          return;
        }
        await fetchBoard();
        await fetchTasks();
      } catch {
        router.push("/login");
      }
    }
    checkAuth();
  }, [boardId, router]);

  async function fetchBoard() {
    try {
      const res = await fetch("/api/boards");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Failed to fetch boards");
        setBoard(null);
        return;
      }
      
      const boards = data.boards || [];
      const currentBoard = boards.find(b => b.id === boardId);
      
      if (!currentBoard) {
        setError("Board not found");
        setBoard(null);
        return;
      }
      
      setBoard(currentBoard);
    } catch {
      setError("Network error. Please try again.");
      setBoard(null);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTasks() {
    try {
      const res = await fetch(`/api/tasks/${boardId}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || "Failed to fetch tasks";
        setError(msg);
        addToast({ type: "error", message: msg });
        return;
      }
      setTasks(data.tasks || []);
    } catch {
      const msg = "Network error. Please try again.";
      setError(msg);
      addToast({ type: "error", message: msg });
    }
  }

  async function createTask(e) {
    e.preventDefault();
    const title = newTaskTitle.trim();
    if (!title) return;

    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardId,
          title,
          description: newTaskDescription.trim() || undefined,
          priority: newTaskPriority,
          dueDate: newTaskDueDate || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || "Failed to create task";
        setError(msg);
        addToast({ type: "error", message: msg });
        return;
      }

      setTasks((prev) => [...prev, data.task]);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskPriority("medium");
      setNewTaskDueDate("");
      addToast({ type: "success", message: "Task created successfully" });
    } catch {
      const msg = "Network error. Please try again.";
      setError(msg);
      addToast({ type: "error", message: msg });
    } finally {
      setCreating(false);
    }
  }

  async function toggleStatus(id, checked) {
    const status = checked ? "completed" : "pending";
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || "Failed to update task";
        setError(msg);
        addToast({ type: "error", message: msg });
        return;
      }
      setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
      addToast({ type: "success", message: `Task marked as ${status}` });
    } catch {
      const msg = "Network error. Please try again.";
      setError(msg);
      addToast({ type: "error", message: msg });
    }
  }

  async function deleteTask(id) {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || "Failed to delete task";
        setError(msg);
        addToast({ type: "error", message: msg });
        return;
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
      addToast({ type: "success", message: "Task deleted" });
    } catch {
      const msg = "Network error. Please try again.";
      setError(msg);
      addToast({ type: "error", message: msg });
    }
  }

  async function inlineSaveTask(id, patch) {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const m = data?.error || "Failed to update task";
        setError(m);
        addToast({ type: "error", message: m });
        return;
      }
      setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
      addToast({ type: "success", message: "Task updated" });
    } catch {
      const m = "Network error. Please try again.";
      setError(m);
      addToast({ type: "error", message: m });
    }
  }

  function findContainer(id) {
    const task = tasks.find((t) => t.id === id);
    return task?.status || null;
  }

  function onDragStart(event) {
    setActiveId(event.active.id);
  }

  function onDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeCol = findContainer(active.id);
    let overCol = findContainer(over.id);

    if (!overCol && over?.data?.current?.columnKey) {
      overCol = over.data.current.columnKey;
    }

    if (!activeCol || !overCol) return;

    setTasks((prev) => {
      const grouped = groupTasks(prev);
      const from = grouped[activeCol];
      const to = grouped[overCol];

      const activeIndex = from.findIndex((t) => t.id === active.id);
      const overIndex = overCol === activeCol
        ? from.findIndex((t) => t.id === over.id)
        : to.findIndex((t) => t.id === over.id);

      const activeTask = from[activeIndex];

      // Remove from source
      const newFrom = [...from];
      newFrom.splice(activeIndex, 1);

      let newTo;
      if (overCol === activeCol) {
        // Same column reorder
        newTo = arrayMove(from, activeIndex, overIndex);
      } else {
        // Move to different column
        newTo = [...to];
        const insertAt = overIndex >= 0 ? overIndex : newTo.length;
        newTo.splice(insertAt, 0, { ...activeTask, status: overCol });
      }

      const next = prev.map((t) => {
        if (t.id === active.id) {
          return { ...t, status: overCol };
        }
        return t;
      });

      // Merge back grouped lists into linear order (preserve existing order across columns)
      const merged = [
        ...next.filter((t) => t.status === "pending"),
        ...next.filter((t) => t.status === "completed"),
      ];

      // Persist status change
      fetch(`/api/tasks/${active.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: overCol }),
      }).catch(() => {});

      // Persist new global order
      fetch("/api/tasks/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: merged.map((t) => t.id) }),
      }).catch(() => {});

      return merged;
    });
  }

  const grouped = groupTasks(tasks);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <div>
              <h1 className="text-xl font-semibold">
                {loading ? "Loading..." : board?.name || "Board"}
              </h1>
              {board && (
                <p className="text-sm text-gray-400">
                  {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {!loading && !board ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-center">
            <p className="mb-4">Board not found.</p>
            <Link
              href="/dashboard"
              className="px-4 py-2 inline-flex rounded-md bg-blue-500 hover:bg-blue-600 text-white"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <>
            {/* Create Task Form */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                <h2 className="text-lg font-semibold mb-4">Create New Task</h2>
                <form onSubmit={createTask} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Task title"
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="low">🌿 Low Priority</option>
                        <option value="medium">⚡ Medium Priority</option>
                        <option value="high">🔥 High Priority</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <textarea
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder="Task description (optional)"
                      rows={3}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        disabled={creating || !newTaskTitle.trim()}
                        className="w-full rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 font-medium text-white transition-colors"
                      >
                        {creating ? "Creating..." : "Create Task"}
                      </button>
                    </div>
                  </div>
                </form>
                {error && (
                  <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                    {error}
                  </div>
                )}
              </div>
            </motion.section>

            {/* Tasks Kanban Board */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-400">Loading tasks...</p>
              </div>
            ) : (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {COLUMNS.map((col) => (
                      <div key={col.key} className="rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              col.key === "pending" ? "bg-blue-500" : "bg-green-500"
                            }`} />
                            {col.label}
                          </h3>
                          <span className="text-xs text-white/50 bg-gray-700/50 px-2 py-1 rounded-full">
                            {grouped[col.key].length}
                          </span>
                        </div>
                        <SortableContext
                          items={grouped[col.key].map((t) => t.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div
                            className="p-4 min-h-[300px] space-y-3"
                            data-column-key={col.key}
                          >
                            {grouped[col.key].map((t) => (
                              <SortableTaskCard
                                key={t.id}
                                task={t}
                                onToggle={toggleStatus}
                                onDelete={deleteTask}
                                onInlineSave={inlineSaveTask}
                                view="list"
                              />
                            ))}
                            {grouped[col.key].length === 0 && (
                              <div className="text-center py-8">
                                <div className="text-gray-500 text-sm">
                                  {col.key === "pending" ? "No pending tasks" : "No completed tasks"}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  Drag tasks here or create a new one
                                </div>
                              </div>
                            )}
                          </div>
                        </SortableContext>
                      </div>
                    ))}
                  </div>
                </DndContext>
              </motion.section>
            )}
          </>
        )}
      </main>
    </div>
  );
} 