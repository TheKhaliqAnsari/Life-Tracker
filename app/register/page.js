"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const u = username.trim();
    const p = password.trim();
    if (u.length < 3 || p.length < 6) {
      const msg = "Username must be ≥ 3 chars and password ≥ 6 chars.";
      setError(msg);
      addToast({ type: "error", message: msg });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || "Registration failed";
        setError(msg);
        addToast({ type: "error", message: msg });
      } else {
        addToast({ type: "success", message: "Account created" });
        router.push("/login");
      }
    } catch (_err) {
      const msg = "Network error. Please try again.";
      setError(msg);
      addToast({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="w-full max-w-md bg-gray-900 rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-1">Create your account</h1>
        <p className="text-sm text-gray-300 mb-6">Join to start organizing your tasks</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••"
              autoComplete="new-password"
            />
          </div>

          <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full inline-flex items-center justify-center rounded-md bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 transition-colors disabled:opacity-60">
            {loading ? "Creating account..." : "Register"}
          </motion.button>
        </form>

        {error && (
          <p className="mt-3 text-sm text-red-400" role="alert">{error}</p>
        )}

        <p className="mt-6 text-sm text-gray-300">
          Already have an account? {" "}
          <Link href="/login" className="text-blue-400 hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
} 