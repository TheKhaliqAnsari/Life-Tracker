'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HabitTrackerPage() {
  const [habits, setHabits] = useState([]);
  const [trackingData, setTrackingData] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingDay, setEditingDay] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [habitCount, setHabitCount] = useState(0);
  const [habitNotes, setHabitNotes] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    category: 'General',
    frequency: 'daily',
    targetCount: 1,
    color: '#3B82F6',
    habitType: 'build',
    quitDate: null
  });
  const [filterHabitId, setFilterHabitId] = useState('');
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState('soft'); // 'soft' or 'hard'
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(30);
  const [keepDays, setKeepDays] = useState(7);

  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (filterHabitId) {
      fetchTrackingData(filterHabitId);
    } else {
      fetchTrackingData();
    }
  }, [filterHabitId]);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      await fetchHabits();
      await fetchTrackingData();
    } catch (error) {
      router.push('/login');
    }
  }, [router]);

  async function fetchHabits() {
    try {
      const res = await fetch('/api/habits');
      if (res.ok) {
        const data = await res.json();
        setHabits(data);
      }
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  }

  async function fetchTrackingData(habitId = '') {
    try {
      setLoading(true);
      const url = habitId ? `/api/habit-tracker?habitId=${habitId}` : '/api/habit-tracker';
      const res = await fetch(url);
      
      if (res.ok) {
        const data = await res.json();
        setTrackingData(data.trackingData || []);
        setStatistics(data.statistics || {});
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createHabit() {
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHabit)
      });

      if (res.ok) {
        await fetchHabits();
        setShowCreateModal(false);
        setNewHabit({
          name: '',
          description: '',
          category: 'General',
          frequency: 'daily',
          targetCount: 1,
          color: '#3B82F6',
          habitType: 'build',
          quitDate: null
        });
        await fetchTrackingData();
      }
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  }

  async function updateHabitTracking(habitId, date, completed, count = 0, notes = '') {
    try {
      const res = await fetch('/api/habit-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habitId,
          date,
          completed,
          count,
          notes
        })
      });

      if (res.ok) {
        await fetchTrackingData(filterHabitId);
        setEditingDay(null);
        setSelectedHabit(null);
        setHabitCount(0);
        setHabitNotes('');
      }
    } catch (error) {
      console.error('Error updating habit tracking:', error);
    }
  }

  function handleDayClick(day) {
    const isFuture = new Date(day.date) > new Date();
    if (isFuture) return;

    setEditingDay(day.date);
    setSelectedHabit(day);
    setHabitCount(day.count || 0);
    setHabitNotes(day.notes || '');
  }

  function handleMarkCompleted() {
    if (editingDay && selectedHabit) {
      updateHabitTracking(
        selectedHabit.habitId,
        editingDay,
        true,
        habitCount,
        habitNotes
      );
    }
  }

  function handleMarkIncomplete() {
    if (editingDay && selectedHabit) {
      updateHabitTracking(
        selectedHabit.habitId,
        editingDay,
        false,
        0,
        habitNotes
      );
    }
  }

  async function deleteHabit(habitId, hardDelete = false) {
    try {
      const url = hardDelete 
        ? `/api/habits/${habitId}?hard=true` 
        : `/api/habits/${habitId}`;
      
      const res = await fetch(url, { method: 'DELETE' });
      
      if (res.ok) {
        await fetchHabits();
        await fetchTrackingData(filterHabitId);
        // Remove from selected habits if it was there
        setSelectedHabits(prev => prev.filter(id => id !== habitId));
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('Failed to delete habit');
    }
  }

  async function bulkDeleteHabits() {
    if (selectedHabits.length === 0) return;
    
    try {
      const res = await fetch('/api/habits/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habitIds: selectedHabits,
          hardDelete: deleteType === 'hard'
        })
      });
      
      if (res.ok) {
        const result = await res.json();
        alert(`Successfully deleted ${result.deletedHabitsCount || result.deactivatedCount} habits`);
        setSelectedHabits([]);
        setShowDeleteModal(false);
        await fetchHabits();
        await fetchTrackingData(filterHabitId);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error bulk deleting habits:', error);
      alert('Failed to delete habits');
    }
  }

  async function cleanupOldData() {
    try {
      const res = await fetch('/api/habits/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          olderThanDays: cleanupDays,
          keepLastDays: keepDays
        })
      });
      
      if (res.ok) {
        const result = await res.json();
        alert(`Successfully cleaned up ${result.cleanedRecords} old tracking records`);
        setShowCleanupModal(false);
        await fetchTrackingData(filterHabitId);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error cleaning up data:', error);
      alert('Failed to cleanup old data');
    }
  }

  function toggleHabitSelection(habitId) {
    setSelectedHabits(prev => 
      prev.includes(habitId) 
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    );
  }

  function selectAllHabits() {
    setSelectedHabits(habits.map(h => h._id));
  }

  function deselectAllHabits() {
    setSelectedHabits([]);
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">🎯 Habit Tracker</h1>
              <p className="text-gray-400 mt-1">Track your daily habits and build consistency</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                + New Habit
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                ← Back to Dashboard
              </button>
              <Link
                href="/smoking-tracker"
                className="px-4 py-2 rounded-md bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-medium shadow-lg shadow-green-500/25 transition-all duration-200 text-center"
              >
                🚭 Smoking Tracker
              </Link>
              <Link
                href="/diet-tracker"
                className="px-4 py-2 rounded-md bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-sm font-medium shadow-lg shadow-pink-500/25 transition-all duration-200 text-center"
              >
                🥗 Diet Tracker
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Total Habits</p>
                <p className="text-xl sm:text-2xl font-bold">{statistics.totalHabits || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Completion Rate</p>
                <p className="text-xl sm:text-2xl font-bold">{statistics.completionRate || 0}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-500 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Completed Days</p>
                <p className="text-xl sm:text-2xl font-bold">{statistics.completedDays || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-500 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Total Count</p>
                <p className="text-2xl font-bold">{statistics.totalCount || 0}</p>
              </div>
            </div>
          </motion.div>

          {statistics.quitHabits > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="flex items-center">
                <div className="p-3 bg-red-500 rounded-lg">
                  <span className="text-2xl">🚫</span>
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">Quit Success Rate</p>
                  <p className="text-2xl font-bold">{statistics.quitHabitSuccessRate || 0}%</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Habit Filter */}
        {habits.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Habit
            </label>
            <select
              value={filterHabitId}
              onChange={(e) => setFilterHabitId(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Habits</option>
              {habits.map(habit => (
                <option key={habit._id} value={habit._id}>
                  {habit.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-2">How to use:</h3>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Click on any day to mark it as completed or incomplete</li>
            <li>• Set your target count for habits that have quantity goals</li>
            <li>• Add notes to track your progress and observations</li>
            <li>• Use the filter to focus on specific habits</li>
          </ul>
        </div>

        {/* Habit Management Section */}
        {habits.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Manage Your Habits</h3>
              <div className="flex items-center space-x-3">
                {selectedHabits.length > 0 && (
                  <>
                    <span className="text-sm text-gray-400">
                      {selectedHabits.length} habit{selectedHabits.length !== 1 ? 's' : ''} selected
                    </span>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Delete Selected
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowCleanupModal(true)}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  🧹 Cleanup Old Data
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habits.map(habit => (
                <div
                  key={habit._id}
                  className={`bg-gray-700 rounded-lg p-4 border-2 transition-all duration-200 ${
                    selectedHabits.includes(habit._id) 
                      ? 'border-blue-500 bg-blue-900/20' 
                      : 'border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedHabits.includes(habit._id)}
                        onChange={() => toggleHabitSelection(habit._id)}
                        className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: habit.color }}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => deleteHabit(habit._id, false)}
                        className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                        title="Deactivate habit"
                      >
                        ⏸️
                      </button>
                      <button
                        onClick={() => deleteHabit(habit._id, true)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Permanently delete habit"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-white mb-2">{habit.name}</h4>
                  {habit.description && (
                    <p className="text-sm text-gray-300 mb-2">{habit.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="capitalize">{habit.category}</span>
                    <span className="capitalize">{habit.frequency}</span>
                    <span className={`px-2 py-1 rounded ${
                      habit.habitType === 'quit' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                    }`}>
                      {habit.habitType}
                    </span>
                  </div>
                  
                  {habit.targetCount > 1 && (
                    <div className="mt-2 text-xs text-gray-400">
                      Target: {habit.targetCount} per day
                    </div>
                  )}
                </div>
              ))}
            </div>

            {habits.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-600">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={selectAllHabits}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAllHabits}
                    className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
                <div className="text-sm text-gray-400">
                  {habits.length} total habit{habits.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Calendar Grid */}
        {habits.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-semibold text-gray-300 mb-2">No habits yet</h3>
            <p className="text-gray-400 mb-6">Create your first habit to start tracking your progress!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {trackingData.map((day, index) => (
                <motion.div
                  key={`${day.habitId}-${day.date}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => handleDayClick(day)}
                  className={`
                    aspect-square rounded-lg border-2 cursor-pointer transition-all duration-200
                    ${day.completed 
                      ? 'bg-green-600 border-green-500 hover:bg-green-700' 
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    }
                    ${new Date(day.date) > new Date() ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  style={{ borderColor: day.habitColor }}
                >
                  <div className="h-full flex flex-col items-center justify-center p-1">
                    <div className="text-xs text-gray-300 mb-1">{day.dayOfWeek}</div>
                    <div className="text-lg font-bold">
                      {day.completed ? '✅' : '⭕'}
                    </div>
                    {day.completed && day.count > 0 && (
                      <div className="text-xs text-white font-bold">
                        {day.count}/{day.targetCount}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Habit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700"
          >
            <h3 className="text-xl font-semibold mb-4">Create New Habit</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Habit Name</label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Exercise, Read, Meditate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Describe your habit..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={newHabit.category}
                    onChange={(e) => setNewHabit({...newHabit, category: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="General">General</option>
                    <option value="Health">Health</option>
                    <option value="Learning">Learning</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
                  <select
                    value={newHabit.frequency}
                    onChange={(e) => setNewHabit({...newHabit, frequency: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Count</label>
                <input
                  type="number"
                  min="1"
                  value={newHabit.targetCount}
                  onChange={(e) => setNewHabit({...newHabit, targetCount: parseInt(e.target.value) || 1})}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewHabit({...newHabit, color})}
                      className={`w-8 h-8 rounded-full border-2 ${newHabit.color === color ? 'border-white' : 'border-gray-600'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createHabit}
                disabled={!newHabit.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Habit
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Day Modal */}
      {editingDay && selectedHabit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700"
          >
            <h3 className="text-xl font-semibold mb-4 text-center">
              {selectedHabit.completed ? "Edit Habit Record" : "Mark Habit Complete"}
            </h3>
            
            <p className="text-sm text-gray-400 text-center mb-6">
              {formatDate(editingDay)} - {selectedHabit.habitName}
            </p>

            <div className="space-y-4">
              {selectedHabit.targetCount > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Count (Target: {selectedHabit.targetCount})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedHabit.targetCount}
                    value={habitCount}
                    onChange={(e) => setHabitCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={habitNotes}
                  onChange={(e) => setHabitNotes(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Add notes about your progress..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setEditingDay(null);
                  setSelectedHabit(null);
                  setHabitCount(0);
                  setHabitNotes('');
                }}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              
              {selectedHabit.completed ? (
                <button
                  onClick={handleMarkIncomplete}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  Mark Incomplete
                </button>
              ) : (
                <button
                  onClick={handleMarkCompleted}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 