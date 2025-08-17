"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/components/Toast";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [user, setUser] = useState(null);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newBoardName, setNewBoardName] = useState("");

  useEffect(() => {
    async function bootstrap() {
      setLoading(true);
      setError("");
      try {
        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        const me = await meRes.json().catch(() => ({ user: null }));
        if (!me?.user) {
          router.replace("/login");
          return;
        }
        setUser(me.user);
        const bRes = await fetch("/api/boards", { cache: "no-store" });
        if (!bRes.ok) {
          const bErr = await bRes.json().catch(() => ({}));
          setError(bErr?.error || "Failed to load boards");
        } else {
          const bData = await bRes.json().catch(() => ({ boards: [] }));
          setBoards(Array.isArray(bData.boards) ? bData.boards : []);
        }
      } catch (_err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, [router]);

  async function handleLogout() {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    addToast({ type: "success", message: "Logged out" });
    router.replace("/login");
  }

  async function createBoard(e) {
    e.preventDefault();
    setError("");
    const name = newBoardName.trim();
    if (!name) {
      const msg = "Board name is required";
      setError(msg);
      addToast({ type: "error", message: msg });
      return;
    }
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || "Failed to create board";
        setError(msg);
        addToast({ type: "error", message: msg });
        return;
      }
      setBoards((prev) => [data.board, ...prev]);
      setNewBoardName("");
      addToast({ type: "success", message: "Board created" });
    } catch (_err) {
      const msg = "Network error. Please try again.";
      setError(msg);
      addToast({ type: "error", message: msg });
    }
  }

  async function renameBoard(id) {
    const current = boards.find((b) => b.id === id);
    if (!current) return;
    const name = prompt("Rename board", current.name)?.trim();
    if (!name) return;
    setError("");
    try {
      const res = await fetch(`/api/boards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data?.error || "Failed to rename board";
        setError(msg);
        addToast({ type: "error", message: msg });
        return;
      }
      setBoards((prev) => prev.map((b) => (b.id === id ? { ...b, name } : b)));
      addToast({ type: "success", message: "Board renamed" });
    } catch (_err) {
      const msg = "Network error. Please try again.";
      setError(msg);
      addToast({ type: "error", message: msg });
    }
  }

  async function deleteBoard(id) {
    if (!confirm("Are you sure you want to delete this board?")) return;
    setError("");
    try {
      const res = await fetch(`/api/boards/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data?.error || "Failed to delete board";
        setError(msg);
        addToast({ type: "error", message: msg });
        return;
      }
      setBoards((prev) => prev.filter((b) => b.id !== id));
      addToast({ type: "success", message: "Board deleted" });
    } catch (_err) {
      const msg = "Network error. Please try again.";
      setError(msg);
      addToast({ type: "error", message: msg });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    { label: "Add Weight", icon: "⚖️", link: "/health-tracker", color: "from-emerald-500 to-teal-500", description: "Track your weight" },
    { label: "Log Exercise", icon: "🏃", link: "/health-tracker", color: "from-blue-500 to-cyan-500", description: "Record workout" },
    { label: "Track Habit", icon: "✅", link: "/habit-tracker", color: "from-purple-500 to-pink-500", description: "Mark habit complete" },
    { label: "Add Expense", icon: "💰", link: "/expense-tracker", color: "from-green-500 to-emerald-500", description: "Log spending" },
    { label: "Log Meal", icon: "🍽️", link: "/diet-tracker", color: "from-orange-500 to-red-500", description: "Track nutrition" },
    { label: "Create Task", icon: "📋", link: "/dashboard", color: "from-indigo-500 to-purple-500", description: "New project board" }
  ];

  const trackingModules = [
    {
      title: "Health & Fitness",
      description: "Track weight, BMI, exercise, and calories",
      icon: "💪",
      color: "from-emerald-500 to-teal-500",
      bgColor: "from-emerald-500/10 to-teal-500/10",
      link: "/health-tracker"
    },
    {
      title: "Habit Building",
      description: "Build positive routines and track progress",
      icon: "✅",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-500/10 to-cyan-500/10",
      link: "/habit-tracker"
    },
    {
      title: "Expense Management",
      description: "Track income, expenses, and investments",
      icon: "💰",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-500/10 to-emerald-500/10",
      link: "/expense-tracker"
    },
    {
      title: "Smoking Cessation",
      description: "Monitor progress and celebrate milestones",
      icon: "🚭",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-500/10 to-pink-500/10",
      link: "/smoking-tracker"
    },
    {
      title: "Diet & Nutrition",
      description: "Track meals, calories, and nutrition",
      icon: "🍽️",
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-500/10 to-red-500/10",
      link: "/diet-tracker"
    },
    {
      title: "Task Management",
      description: "Organize projects with kanban boards",
      icon: "📋",
      color: "from-indigo-500 to-purple-500",
      bgColor: "from-indigo-500/10 to-purple-500/10",
      link: "/dashboard"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg" />
              <span className="font-bold text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                LifeTracker
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <span className="text-sm text-gray-300">Welcome,</span>
                <span className="font-semibold text-blue-400">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Welcome back,
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {user?.username}!
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Your complete life management dashboard. Track everything from health and fitness to finances and habits.
          </p>
        </motion.div>

        {/* Quick Actions - Moved to top for better UX */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, i) => (
              <Link key={i} href={action.link}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-xl bg-gradient-to-r ${action.color} bg-opacity-20 border border-white/20 text-center hover:bg-opacity-30 transition-all duration-300 cursor-pointer group`}
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{action.icon}</div>
                  <div className="text-sm font-medium text-white mb-1">{action.label}</div>
                  <div className="text-xs text-gray-300 opacity-80">{action.description}</div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Active Boards", value: boards.length, icon: "📋" },
            { label: "Tracking Modules", value: "6", icon: "🎯" },
            { label: "Data Points", value: "∞", icon: "📊" },
            { label: "Goals Set", value: "0", icon: "🎯" }
          ].map((stat, i) => (
            <div key={i} className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 text-center">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-blue-400 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Task Management Section - Streamlined */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Task Management</h2>
              <p className="text-gray-400">Organize your projects with kanban boards</p>
            </div>
            <Link
              href="/dashboard"
              className="mt-4 md:mt-0 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
            >
              Manage Tasks
            </Link>
          </div>

          {/* Create New Board */}
          <form onSubmit={createBoard} className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Enter board name..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-600 bg-gray-950 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
              >
                Create Board
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </form>

          {/* Boards Grid */}
          {boards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards.map((board) => (
                <div
                  key={board.id}
                  className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 hover:border-gray-600/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-white">{board.name}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => renameBoard(board.id)}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Rename"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteBoard(board.id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <Link
                    href={`/boards/${board.id}`}
                    className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Open Board
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-gray-400 mb-4">No boards created yet</p>
              <p className="text-sm text-gray-500">Create your first board to start organizing tasks</p>
            </div>
          )}
        </motion.div>

        {/* Tracking Modules Grid - Streamlined */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Your Tracking Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trackingModules.map((module, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative"
              >
                <Link href={module.link}>
                  <div className={`relative p-6 rounded-2xl bg-gradient-to-b ${module.bgColor} border border-gray-700/50 hover:border-white/20 transition-all duration-300 h-full`}>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative h-full flex flex-col">
                      <div className="text-4xl mb-4">{module.icon}</div>
                      <h3 className={`text-xl font-bold mb-3 bg-gradient-to-r ${module.color} bg-clip-text text-transparent`}>
                        {module.title}
                      </h3>
                      <p className="text-gray-300 text-sm mb-4 flex-grow">
                        {module.description}
                      </p>
                      
                      <div className={`inline-flex items-center gap-2 text-sm font-medium bg-gradient-to-r ${module.color} bg-clip-text text-transparent group-hover:gap-3 transition-all duration-300`}>
                        Open Module
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}