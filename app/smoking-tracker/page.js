"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useToast } from "@/components/Toast";

export default function SmokingTrackerPage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [user, setUser] = useState(null);
  const [trackingData, setTrackingData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [editingDay, setEditingDay] = useState(null);
  const [cigaretteCount, setCigaretteCount] = useState(0);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      fetchTrackingData();
    }
  }, [user, days, fetchTrackingData]);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
    } catch {
      router.push("/login");
    }
  }, [router]);

  const fetchTrackingData = useCallback(async () => {
    try {
      const res = await fetch(`/api/smoking-tracker?days=${days}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        addToast({ type: "error", message: data?.error || "Failed to fetch data" });
        return;
      }
      console.log('Fetched tracking data:', data.trackingData); // Debug log
      setTrackingData(data.trackingData || []);
      setStats(data.stats || {});
    } catch (error) {
      addToast({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }, [days, addToast]);

  async function toggleDay(date, newSmokeFreeStatus, cigarettes = 0) {
    const payload = {
      date,
      smokeFree: newSmokeFreeStatus,
      cigarettesSmoked: newSmokeFreeStatus ? 0 : cigarettes
    };
    
    console.log('Sending to API:', payload); // Debug log
    
    try {
      const res = await fetch("/api/smoking-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        addToast({ type: "error", message: data?.error || "Failed to update" });
        return;
      }

      console.log('API Response:', data); // Debug log

      addToast({ 
        type: "success", 
        message: data.smokeFree ? "Great! Smoke-free day marked! 🎉" : `Recorded ${data.cigarettesSmoked} cigarettes` 
      });

      setEditingDay(null);
      setCigaretteCount(0);

      // Refresh all data from server to ensure consistency
      await fetchTrackingData();
    } catch (error) {
      addToast({ type: "error", message: "Network error. Please try again." });
    }
  }

  function handleDayClick(day) {
    const isFuture = new Date(day.date) > new Date();
    if (isFuture) return;

    if (day.smokeFree) {
      // If currently smoke-free, ask for cigarette count to mark as smoking
      setEditingDay(day.date);
      setCigaretteCount(1);
    } else {
      // If currently smoking day, ask to edit cigarette count or mark as smoke-free
      setEditingDay(day.date);
      setCigaretteCount(day.cigarettesSmoked || 1);
    }
  }

  function handleCigaretteSubmit() {
    if (editingDay && cigaretteCount > 0) {
      // Always set as smoking day (false) with cigarette count
      toggleDay(editingDay, false, cigaretteCount);
    }
  }

  function handleMarkSmokeFree() {
    if (editingDay) {
      // Always set as smoke-free day (true) with 0 cigarettes
      toggleDay(editingDay, true, 0);
    }
  }

  function getStreakEmoji(streak) {
    if (streak >= 30) return "🏆";
    if (streak >= 14) return "🔥";
    if (streak >= 7) return "⭐";
    if (streak >= 3) return "💪";
    if (streak >= 1) return "🎯";
    return "🚭";
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00.000Z');
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading your smoking tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-gray-200 transition-colors text-sm"
              >
                ← Back to Dashboard
              </Link>
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  🚭 Smoking Tracker
                </h1>
                <p className="text-sm text-gray-400">
                  Track your smoke-free journey
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/habit-tracker"
                className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-sm font-medium shadow-lg shadow-purple-500/25 transition-all duration-200 text-center"
              >
                🎯 Habit Tracker
              </Link>
              <Link
                href="/diet-tracker"
                className="px-4 py-2 rounded-md bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-sm font-medium shadow-lg shadow-pink-500/25 transition-all duration-200 text-center"
              >
                🥗 Diet Tracker
              </Link>
              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 2 weeks</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Statistics Cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1">
              {stats.currentStreak || 0}
            </div>
            <div className="text-sm text-gray-300">Current Streak</div>
            <div className="text-lg mt-1">{getStreakEmoji(stats.currentStreak || 0)}</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-1">
              {stats.longestStreak || 0}
            </div>
            <div className="text-sm text-gray-300">Best Streak</div>
            <div className="text-lg mt-1">🏅</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-1">
              {stats.successRate || 0}%
            </div>
            <div className="text-sm text-gray-300">Success Rate</div>
            <div className="text-lg mt-1">📊</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1">
              {stats.smokeFreeCount || 0}/{stats.totalDays || 0}
            </div>
            <div className="text-sm text-gray-300">Smoke-Free Days</div>
            <div className="text-lg mt-1">📅</div>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-red-400 mb-1">
              {stats.totalCigarettes || 0}
            </div>
            <div className="text-sm text-gray-300">Total Cigarettes</div>
            <div className="text-lg mt-1">🚬</div>
          </div>
        </motion.section>

        {/* Additional Statistics */}
        {stats.totalCigarettes > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          >
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                📊 Consumption Analysis
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Average per day:</span>
                  <span className="font-medium">{stats.averageCigarettesPerDay} cigarettes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average on smoking days:</span>
                  <span className="font-medium">{stats.averageCigarettesOnSmokingDays} cigarettes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Days with smoking:</span>
                  <span className="font-medium">{stats.smokedCount} days</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                💰 Health Impact
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimated cost:</span>
                  <span className="font-medium text-red-400">${(stats.totalCigarettes * 0.50).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time spent smoking:</span>
                  <span className="font-medium text-yellow-400">{Math.round(stats.totalCigarettes * 5)} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reduction vs 1 pack/day:</span>
                  <span className="font-medium text-green-400">
                    {Math.max(0, Math.round(((20 * stats.totalDays - stats.totalCigarettes) / (20 * stats.totalDays)) * 100))}%
                  </span>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Daily Tracker Grid */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Daily Progress</h2>
            <div className="text-sm text-gray-400">
              🚬 Smoking days → Click to edit count or mark smoke-free • ✅ Smoke-free days → Click to mark as smoking
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-3">
            {/* Week day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs text-gray-500 font-medium p-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {trackingData.map((day, index) => {
              const isToday = day.date === new Date().toISOString().split('T')[0];
              const isFuture = new Date(day.date) > new Date();
              
              return (
                <motion.button
                  key={day.date}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  whileHover={{ scale: isFuture ? 1 : 1.05 }}
                  whileTap={{ scale: isFuture ? 1 : 0.95 }}
                  onClick={() => handleDayClick(day)}
                  disabled={isFuture}
                  className={`
                    aspect-square rounded-lg border transition-all duration-200 flex flex-col items-center justify-center p-1 md:p-2
                    ${isFuture 
                      ? 'border-gray-700 bg-gray-800/50 cursor-not-allowed opacity-50' 
                      : day.smokeFree
                        ? 'border-green-500/50 bg-green-500/20 hover:bg-green-500/30'
                        : 'border-red-500/50 bg-red-500/20 hover:bg-red-500/30 cursor-pointer'
                    }
                    ${isToday ? 'ring-2 ring-blue-500/50' : ''}
                  `}
                  title={`${formatDate(day.date)} - ${day.smokeFree ? 'Smoke-free' : `Smoked ${day.cigarettesSmoked || 0} cigarettes`}`}
                >
                  <div className="text-xs md:text-sm font-medium text-gray-300">
                    {formatDate(day.date).split(' ')[1]}
                  </div>
                  <div className="text-lg md:text-xl">
                    {isFuture ? '⏳' : day.smokeFree ? '✅' : '🚬'}
                  </div>
                  {!day.smokeFree && (
                    <div className="text-xs text-red-300 font-bold">
                      {day.cigarettesSmoked || 0}
                    </div>
                  )}
                  {/* Debug display */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-blue-300" style={{fontSize: '8px'}}>
                      {day.smokeFree ? 'SF' : `S:${day.cigarettesSmoked}`}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {day.dayOfWeek}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/50"></div>
              <span className="text-gray-400">Smoke-free</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/50"></div>
              <span className="text-gray-400">Smoked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/50"></div>
              <span className="text-gray-400">Today</span>
            </div>
          </div>
        </motion.section>

        {/* Motivational Message */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-2xl p-6">
            {stats.currentStreak >= 7 ? (
              <div>
                <div className="text-2xl mb-2">🎉</div>
                <h3 className="text-xl font-semibold text-blue-400 mb-2">
                  Amazing! {stats.currentStreak} days strong!
                </h3>
                <p className="text-gray-300">
                  You&apos;re building an incredible healthy habit. Keep it up!
                </p>
              </div>
            ) : stats.currentStreak > 0 ? (
              <div>
                <div className="text-2xl mb-2">💪</div>
                <h3 className="text-xl font-semibold text-green-400 mb-2">
                  Great start! {stats.currentStreak} day{stats.currentStreak !== 1 ? 's' : ''} smoke-free!
                </h3>
                <p className="text-gray-300">
                  Every day counts. You&apos;re on the right path!
                </p>
              </div>
            ) : (
              <div>
                <div className="text-2xl mb-2">🌱</div>
                <h3 className="text-xl font-semibold text-yellow-400 mb-2">
                  Start your smoke-free journey!
                </h3>
                <p className="text-gray-300">
                  Click on any smoking day to mark it as smoke-free and start building your streak.
                </p>
              </div>
            )}
          </div>
        </motion.section>
      </main>

      {/* Cigarette Count Modal */}
      {editingDay && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-semibold mb-4 text-center">
              {(() => {
                const currentDay = trackingData.find(d => d.date === editingDay);
                return currentDay?.smokeFree 
                  ? "Mark as smoking day" 
                  : "Edit smoking record";
              })()}
            </h3>
            <p className="text-sm text-gray-400 text-center mb-6">
              {formatDate(editingDay)} - {(() => {
                const currentDay = trackingData.find(d => d.date === editingDay);
                return currentDay?.smokeFree 
                  ? "This day is currently marked as smoke-free"
                  : `Currently: ${currentDay?.cigarettesSmoked || 1} cigarettes`;
              })()}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setCigaretteCount(Math.max(1, cigaretteCount - 1))}
                  className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
                >
                  -
                </button>
                
                <div className="flex-1 text-center">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={cigaretteCount}
                    onChange={(e) => setCigaretteCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center text-2xl font-bold bg-gray-800 border border-gray-600 rounded-lg py-2 focus:border-blue-500 focus:outline-none"
                  />
                  <div className="text-sm text-gray-400 mt-1">cigarettes</div>
                </div>
                
                <button
                  onClick={() => setCigaretteCount(Math.min(100, cigaretteCount + 1))}
                  className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>

              {/* Quick preset buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 5, 10, 20].map(count => (
                  <button
                    key={count}
                    onClick={() => setCigaretteCount(count)}
                    className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                      cigaretteCount === count
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setEditingDay(null);
                    setCigaretteCount(0);
                  }}
                  className="px-4 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkSmokeFree}
                  className="flex-1 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
                >
                  Mark Smoke-Free
                </button>
                <button
                  onClick={handleCigaretteSubmit}
                  className="flex-1 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                >
                  Record {cigaretteCount} 🚬
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 