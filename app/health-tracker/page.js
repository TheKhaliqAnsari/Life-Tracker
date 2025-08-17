"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function HealthTrackerPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weightHistory, setWeightHistory] = useState([]);
  const [calorieHistory, setCalorieHistory] = useState([]);
  const [exerciseHistory, setExerciseHistory] = useState([]);
  
  // Form states
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [exerciseMinutes, setExerciseMinutes] = useState("");
  const [exerciseType, setExerciseType] = useState("cardio");
  const [manualCalories, setManualCalories] = useState("");
  const [useManualCalories, setUseManualCalories] = useState(false);
  const [mealSearch, setMealSearch] = useState("");
  const [mealResults, setMealResults] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealPortion, setMealPortion] = useState(1);
  
  // Goal management states
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalType, setGoalType] = useState("weight");
  const [goalValue, setGoalValue] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [userGoals, setUserGoals] = useState({});

  const exerciseTypes = [
    { value: "cardio", label: "Cardio", caloriesPerMinute: 8 },
    { value: "strength", label: "Strength Training", caloriesPerMinute: 6 },
    { value: "yoga", label: "Yoga", caloriesPerMinute: 3 },
    { value: "walking", label: "Walking", caloriesPerMinute: 4 },
    { value: "running", label: "Running", caloriesPerMinute: 10 },
    { value: "cycling", label: "Cycling", caloriesPerMinute: 7 }
  ];

  useEffect(() => {
    async function bootstrap() {
      setLoading(true);
      try {
        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        const me = await meRes.json().catch(() => ({ user: null }));
        if (!me?.user) {
          router.replace("/login");
          return;
        }
        setUser(me.user);
        await loadHealthData();
      } catch (_err) {
        addToast({ type: "error", message: "Failed to load user data" });
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, [router, addToast]);

  async function loadHealthData() {
    try {
      const res = await fetch("/api/health-tracker", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setWeightHistory(data.weightHistory || []);
        setCalorieHistory(data.calorieHistory || []);
        setExerciseHistory(data.exerciseHistory || []);
      }
    } catch (err) {
      console.error("Failed to load health data:", err);
    }
  }

  async function addWeightEntry(e) {
    e.preventDefault();
    if (!weight || !height) {
      addToast({ type: "error", message: "Please enter both weight and height" });
      return;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const bmi = (weightNum / ((heightNum / 100) ** 2)).toFixed(1);

    try {
      const res = await fetch("/api/health-tracker/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: weightNum, height: heightNum, bmi }),
      });

      if (res.ok) {
        addToast({ type: "success", message: "Weight entry added successfully" });
        setWeight("");
        setHeight("");
        await loadHealthData();
      } else {
        const error = await res.json();
        addToast({ type: "error", message: error.error || "Failed to add weight entry" });
      }
    } catch (err) {
      addToast({ type: "error", message: "Network error. Please try again." });
    }
  }

  async function addExerciseEntry(e) {
    e.preventDefault();
    if (!exerciseMinutes || !exerciseType) {
      addToast({ type: "error", message: "Please enter exercise duration and type" });
      return;
    }
    
    if (useManualCalories && !manualCalories) {
      addToast({ type: "error", message: "Please enter calories burned when using custom calories" });
      return;
    }

    const minutes = parseInt(exerciseMinutes);
    const exercise = exerciseTypes.find(t => t.value === exerciseType);
    const calculatedCalories = Math.round(minutes * exercise.caloriesPerMinute);
    
    // Use manual calories if provided, otherwise use calculated calories
    const finalCalories = useManualCalories && manualCalories ? parseInt(manualCalories) : calculatedCalories;

    try {
      const res = await fetch("/api/health-tracker/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          minutes, 
          type: exerciseType, 
          caloriesBurned: finalCalories 
        }),
      });

      if (res.ok) {
        addToast({ type: "success", message: "Exercise entry added successfully" });
        setExerciseMinutes("");
        setManualCalories("");
        setUseManualCalories(false);
        await loadHealthData();
      } else {
        const error = await res.json();
        addToast({ type: "error", message: error.error || "Failed to add exercise entry" });
      }
    } catch (err) {
      addToast({ type: "error", message: "Network error. Please try again." });
    }
  }

  async function searchMeals(query) {
    if (!query.trim()) return;
    
    try {
      const res = await fetch(`/api/health-tracker/meals?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setMealResults(data.meals || []);
      }
    } catch (err) {
      console.error("Failed to search meals:", err);
    }
  }

  async function addMealEntry() {
    if (!selectedMeal) {
      addToast({ type: "error", message: "Please select a meal first" });
      return;
    }

    try {
      const res = await fetch("/api/health-tracker/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealId: selectedMeal.id,
          name: selectedMeal.title,
          calories: Math.round(selectedMeal.calories * mealPortion),
          portion: mealPortion
        }),
      });

      if (res.ok) {
        addToast({ type: "success", message: "Meal added successfully" });
        setSelectedMeal(null);
        setMealPortion(1);
        setMealSearch("");
        setMealResults([]);
        await loadHealthData();
      } else {
        const error = await res.json();
        addToast({ type: "error", message: error.error || "Failed to add meal" });
      }
    } catch (err) {
      addToast({ type: "error", message: "Network error. Please try again." });
    }
  }

  function calculateBMI(weight, height) {
    if (!weight || !height) return null;
    return (weight / ((height / 100) ** 2)).toFixed(1);
  }

  function getBMICategory(bmi) {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-500" };
    if (bmi < 25) return { category: "Normal weight", color: "text-green-500" };
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-500" };
    return { category: "Obese", color: "text-red-500" };
  }

  // Goal management functions
  async function setHealthGoal(e) {
    e.preventDefault();
    if (!goalValue || !goalTarget) {
      addToast({ type: "error", message: "Please enter both current and target values" });
      return;
    }

    try {
      const res = await fetch("/api/health-tracker/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: goalType, 
          currentValue: parseFloat(goalValue), 
          targetValue: parseFloat(goalTarget) 
        }),
      });

      if (res.ok) {
        addToast({ type: "success", message: "Health goal set successfully" });
        setShowGoalModal(false);
        setGoalValue("");
        setGoalTarget("");
        await loadHealthData();
      } else {
        const error = await res.json();
        addToast({ type: "error", message: error.error || "Failed to set goal" });
      }
    } catch (err) {
      addToast({ type: "error", message: "Network error. Please try again." });
    }
  }

  function openGoalModal(type) {
    setGoalType(type);
    setShowGoalModal(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading health tracker...</p>
        </div>
      </div>
    );
  }

  const latestWeight = weightHistory[0];
  const latestBMI = latestWeight ? calculateBMI(latestWeight.weight, latestWeight.height) : null;
  const bmiCategory = latestBMI ? getBMICategory(latestBMI) : null;

  const today = new Date().toISOString().split('T')[0];
  const todayCalories = calorieHistory.filter(entry => entry.date === today);
  const todayExercise = exerciseHistory.filter(entry => entry.date === today);
  
  const totalCaloriesConsumed = todayCalories.reduce((sum, entry) => sum + entry.calories, 0);
  const totalCaloriesBurned = todayExercise.reduce((sum, entry) => sum + entry.caloriesBurned, 0);
  const netCalories = totalCaloriesConsumed - totalCaloriesBurned;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">🏥 Health & Fitness Tracker</h1>
              <p className="text-sm text-gray-300">
                Track your weight, BMI, exercise, and nutrition
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-sm font-medium text-gray-400 mb-2">Current Weight</h3>
            <p className="text-2xl font-bold text-white">
              {latestWeight ? `${latestWeight.weight} kg` : "N/A"}
            </p>
            {latestWeight && (
              <p className="text-sm text-gray-400 mt-1">
                {new Date(latestWeight.date).toLocaleDateString()}
              </p>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-sm font-medium text-gray-400 mb-2">BMI</h3>
            <p className="text-2xl font-bold text-white">
              {latestBMI || "N/A"}
            </p>
            {bmiCategory && (
              <p className={`text-sm font-medium mt-1 ${bmiCategory.color}`}>
                {bmiCategory.category}
              </p>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-sm font-medium text-gray-400 mb-2">Today&apos;s Calories</h3>
            <p className="text-2xl font-bold text-white">{totalCaloriesConsumed}</p>
            <p className="text-sm text-gray-400 mt-1">Consumed</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-sm font-medium text-gray-400 mb-2">Net Calories</h3>
            <p className={`text-2xl font-bold ${netCalories >= 0 ? 'text-red-400' : 'text-green-400'}`}>
              {netCalories >= 0 ? '+' : ''}{netCalories}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {netCalories >= 0 ? 'Surplus' : 'Deficit'}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weight Tracking */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-xl font-bold mb-4">📊 Weight & BMI Tracking</h2>
            
            <form onSubmit={addWeightEntry} className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full rounded-md border border-gray-600 bg-gray-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="70.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full rounded-md border border-gray-600 bg-gray-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="175"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-md transition-colors"
              >
                Add Weight Entry
              </button>
            </form>

            {weightHistory.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium text-white">Weight & BMI Chart:</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightHistory.slice(0, 30).reverse()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        tickFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        name="Weight (kg)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="bmi" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        name="BMI"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <h3 className="font-medium text-white">Recent Entries:</h3>
                {weightHistory.slice(0, 5).map((entry, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-950 rounded-md">
                    <span className="text-white">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                    <div className="text-right">
                      <span className="text-blue-400 font-medium">{entry.weight} kg</span>
                      <span className="text-green-400 ml-2">BMI: {entry.bmi}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Exercise Tracking */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-xl font-bold mb-4">🏃‍♂️ Exercise Tracking</h2>
            
            <form onSubmit={addExerciseEntry} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Exercise Type</label>
                <select
                  value={exerciseType}
                  onChange={(e) => setExerciseType(e.target.value)}
                  className="w-full rounded-md border border-gray-600 bg-gray-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {exerciseTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} (~{type.caloriesPerMinute} cal/min)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={exerciseMinutes}
                  onChange={(e) => setExerciseMinutes(e.target.value)}
                  className="w-full rounded-md border border-gray-600 bg-gray-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="30"
                />
              </div>
              
              {!useManualCalories && exerciseMinutes && (
                <div className="p-3 bg-gray-950 rounded-md border border-gray-600">
                  <p className="text-sm text-gray-300">
                    <span className="text-green-400 font-medium">
                      Estimated calories: ~{Math.round(parseInt(exerciseMinutes) * exerciseTypes.find(t => t.value === exerciseType)?.caloriesPerMinute || 0)} cal
                    </span>
                    <br />
                    <span className="text-xs text-gray-400">
                      Based on {exerciseTypes.find(t => t.value === exerciseType)?.label} at ~{exerciseTypes.find(t => t.value === exerciseType)?.caloriesPerMinute} cal/min
                    </span>
                  </p>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="useManualCalories"
                  checked={useManualCalories}
                  onChange={(e) => setUseManualCalories(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-950 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="useManualCalories" className="text-sm font-medium">
                  Use custom calories instead of calculated
                </label>
              </div>
              
              {useManualCalories && (
                <div>
                  <label className="block text-sm font-medium mb-1">Calories Burned</label>
                  <input
                    type="number"
                    value={manualCalories}
                    onChange={(e) => setManualCalories(e.target.value)}
                    className="w-full rounded-md border border-gray-600 bg-gray-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter calories burned"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Calculated calories: ~{exerciseMinutes ? Math.round(parseInt(exerciseMinutes) * exerciseTypes.find(t => t.value === exerciseType)?.caloriesPerMinute || 0) : 0} cal
                  </p>
                </div>
              )}
              
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-md transition-colors"
              >
                Add Exercise Entry
              </button>
            </form>

            {exerciseHistory.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium text-white">Exercise & Calories Chart:</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={exerciseHistory.slice(0, 14).reverse()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        tickFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Legend />
                      <Bar dataKey="caloriesBurned" fill="#10B981" name="Calories Burned" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <h3 className="font-medium text-white">Today&apos;s Exercise:</h3>
                {todayExercise.map((entry, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-950 rounded-md">
                    <span className="text-white">
                      {exerciseTypes.find(t => t.value === entry.type)?.label || entry.type}
                    </span>
                    <div className="text-right">
                      <span className="text-green-400 font-medium">{entry.minutes} min</span>
                      <span className="text-red-400 ml-2">-{entry.caloriesBurned} cal</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Meal Tracking */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-8"
        >
          <h2 className="text-xl font-bold mb-4">🍽️ Meal & Nutrition Tracking</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Search & Add Meals</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Search for meals</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mealSearch}
                      onChange={(e) => setMealSearch(e.target.value)}
                      className="flex-1 rounded-md border border-gray-600 bg-gray-950 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., chicken breast, pasta, salad"
                    />
                    <button
                      onClick={() => searchMeals(mealSearch)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {mealResults.length > 0 && (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {mealResults.map((meal) => (
                      <div
                        key={meal.id}
                        className={`p-3 rounded-md border cursor-pointer transition-colors ${
                          selectedMeal?.id === meal.id
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => setSelectedMeal(meal)}
                      >
                        <h4 className="font-medium text-white">{meal.title}</h4>
                        <p className="text-sm text-gray-400">{meal.calories} calories per serving</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedMeal && (
                  <div className="space-y-3 p-4 bg-gray-950 rounded-md border border-gray-600">
                    <h4 className="font-medium text-white">Selected: {selectedMeal.title}</h4>
                    <div>
                      <label className="block text-sm font-medium mb-1">Portion size</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={mealPortion}
                        onChange={(e) => setMealPortion(parseFloat(e.target.value))}
                        className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-sm text-gray-400">
                      Total calories: {Math.round(selectedMeal.calories * mealPortion)}
                    </p>
                    <button
                      onClick={addMealEntry}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-medium px-3 py-2 rounded-md transition-colors"
                    >
                      Add Meal Entry
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Today&apos;s Nutrition</h3>
              {todayCalories.length > 0 ? (
                <div className="space-y-4">
                  {todayCalories.map((meal, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-950 rounded-md">
                      <span className="text-white">{meal.name}</span>
                      <span className="text-green-400 font-medium">{meal.calories} cal</span>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-600 pt-2 mt-4">
                    <div className="flex justify-between items-center font-medium">
                      <span>Total Consumed:</span>
                      <span className="text-green-400">{totalCaloriesConsumed} cal</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-400">
                      <span>Burned:</span>
                      <span className="text-red-400">-{totalCaloriesBurned} cal</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg border-t border-gray-600 pt-2 mt-2">
                      <span>Net:</span>
                      <span className={netCalories >= 0 ? 'text-red-400' : 'text-green-400'}>
                        {netCalories >= 0 ? '+' : ''}{netCalories} cal
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No meals logged today</p>
              )}
              
              {calorieHistory.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Weekly Calorie Trend</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={calorieHistory.slice(0, 7).reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#9CA3AF"
                          tickFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                          labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="calories" 
                          stroke="#F59E0B" 
                          strokeWidth={2}
                          dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                          name="Calories Consumed"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Goals Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">🎯 Health Goals</h2>
            <button
              onClick={() => openGoalModal("weight")}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors"
            >
              Set New Goal
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-950 rounded-lg border border-gray-600">
              <h3 className="font-semibold text-white mb-2">Weight Goal</h3>
              <p className="text-2xl font-bold text-blue-400">
                {latestWeight ? `${latestWeight.weight} kg` : "Set goal"}
              </p>
              <p className="text-sm text-gray-400 mt-1">Current weight</p>
              <button
                onClick={() => openGoalModal("weight")}
                className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
              >
                Set Goal
              </button>
            </div>
            <div className="text-center p-4 bg-gray-950 rounded-lg border border-gray-600">
              <h3 className="font-semibold text-white mb-2">Daily Exercise</h3>
              <p className="text-2xl font-bold text-green-400">
                {todayExercise.reduce((sum, ex) => sum + ex.minutes, 0)} min
              </p>
              <p className="text-sm text-gray-400 mt-1">Today&apos;s total</p>
              <button
                onClick={() => openGoalModal("exercise")}
                className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
              >
                Set Goal
              </button>
            </div>
            <div className="text-center p-4 bg-gray-950 rounded-lg border border-gray-600">
              <h3 className="font-semibold text-white mb-2">Calorie Balance</h3>
              <p className={`text-2xl font-bold ${netCalories >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                {netCalories >= 0 ? '+' : ''}{netCalories}
              </p>
              <p className="text-sm text-gray-400 mt-1">Net calories</p>
              <button
                onClick={() => openGoalModal("calories")}
                className="mt-2 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs transition-colors"
              >
                Set Goal
              </button>
            </div>
          </div>
        </motion.div>

        {/* Goal Setting Modal */}
        {showGoalModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowGoalModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">Set Health Goal</h3>
              <form onSubmit={setHealthGoal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Goal Type</label>
                  <select
                    value={goalType}
                    onChange={(e) => setGoalType(e.target.value)}
                    className="w-full rounded-md border border-gray-600 bg-gray-950 px-3 py-2 text-white"
                  >
                    <option value="weight">Weight (kg)</option>
                    <option value="exercise">Daily Exercise (minutes)</option>
                    <option value="calories">Daily Calories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Current Value</label>
                  <input
                    type="number"
                    step="0.1"
                    value={goalValue}
                    onChange={(e) => setGoalValue(e.target.value)}
                    placeholder={goalType === "weight" ? "Current weight" : goalType === "exercise" ? "Current minutes" : "Current calories"}
                    className="w-full rounded-md border border-gray-600 bg-gray-950 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Target Value</label>
                  <input
                    type="number"
                    step="0.1"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    placeholder={goalType === "weight" ? "Target weight" : goalType === "exercise" ? "Target minutes" : "Target calories"}
                    className="w-full rounded-md border border-gray-600 bg-gray-950 px-3 py-2 text-white"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGoalModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                  >
                    Set Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
} 