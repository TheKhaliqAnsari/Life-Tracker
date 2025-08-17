"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function DietTracker() {
  const [meals, setMeals] = useState([]);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newMeal, setNewMeal] = useState({
    name: '',
    mealType: 'breakfast',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: ''
  });

  // Calculate daily totals
  const dailyTotals = meals.reduce((acc, meal) => {
    acc.calories += parseInt(meal.calories) || 0;
    acc.protein += parseInt(meal.protein) || 0;
    acc.carbs += parseInt(meal.carbs) || 0;
    acc.fat += parseInt(meal.fat) || 0;
    acc.fiber += parseInt(meal.fiber) || 0;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  async function addMeal() {
    if (!newMeal.name || !newMeal.calories) return;

    try {
      const response = await fetch('/api/diet-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          foodName: newMeal.name,
          mealType: newMeal.mealType,
          calories: parseInt(newMeal.calories),
          protein: parseInt(newMeal.protein) || 0,
          carbs: parseInt(newMeal.carbs) || 0,
          fat: parseInt(newMeal.fat) || 0,
          fiber: parseInt(newMeal.fiber) || 0
        })
      });

      if (response.ok) {
        const meal = await response.json();
        setMeals([...meals, meal]);
        setNewMeal({
          name: '',
          mealType: 'breakfast',
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
          fiber: ''
        });
        setShowAddMealModal(false);
      }
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  }

  async function deleteMeal(mealId) {
    try {
      const response = await fetch(`/api/diet-entries/${mealId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMeals(meals.filter(meal => meal._id !== mealId));
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  }

  async function fetchMeals() {
    try {
      const response = await fetch(`/api/diet-entries?date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setMeals(data);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  }

  useEffect(() => {
    fetchMeals();
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
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
                  🥗 Diet Tracker
                </h1>
                <p className="text-sm text-gray-400">
                  Track your daily meals and macros
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setShowAddMealModal(true)}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-medium shadow-lg shadow-green-500/25 transition-all duration-200"
              >
                + Add Meal
              </button>
              <Link
                href="/smoking-tracker"
                className="px-4 py-2 rounded-md bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-medium shadow-lg shadow-green-500/25 transition-all duration-200 text-center"
              >
                🚭 Smoking Tracker
              </Link>
              <Link
                href="/habit-tracker"
                className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-sm font-medium shadow-lg shadow-purple-500/25 transition-all duration-200 text-center"
              >
                🎯 Habit Tracker
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Date Selector */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <label className="text-sm font-medium text-gray-300">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        {/* Daily Totals */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">
            📊 Daily Totals - {new Date(selectedDate).toLocaleDateString()}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
              <div className="text-2xl font-bold text-green-400">{dailyTotals.calories}</div>
              <div className="text-sm text-gray-400">Calories</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
              <div className="text-2xl font-bold text-blue-400">{dailyTotals.protein}g</div>
              <div className="text-sm text-gray-400">Protein</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
              <div className="text-2xl font-bold text-yellow-400">{dailyTotals.carbs}g</div>
              <div className="text-sm text-gray-400">Carbs</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
              <div className="text-2xl font-bold text-orange-400">{dailyTotals.fat}g</div>
              <div className="text-sm text-gray-400">Fat</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
              <div className="text-2xl font-bold text-purple-400">{dailyTotals.fiber}g</div>
              <div className="text-sm text-gray-400">Fiber</div>
            </div>
          </div>
        </div>

        {/* Meals by Type */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">🍽️ Meals</h3>
          
          {/* Breakfast */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3 text-yellow-400">🌅 Breakfast</h4>
            <div className="space-y-2">
              {meals.filter(m => m.mealType === 'breakfast').map((meal) => (
                <div key={meal._id} className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-200">{meal.foodName}</div>
                    <div className="text-sm text-gray-400">
                      {meal.calories} cal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g | Fiber: {meal.fiber}g
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMeal(meal._id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {meals.filter(m => m.mealType === 'breakfast').length === 0 && (
                <div className="text-gray-500 text-sm italic">No breakfast items</div>
              )}
            </div>
          </div>

          {/* Lunch */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3 text-orange-400">🌞 Lunch</h4>
            <div className="space-y-2">
              {meals.filter(m => m.mealType === 'lunch').map((meal) => (
                <div key={meal._id} className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-200">{meal.foodName}</div>
                    <div className="text-sm text-gray-400">
                      {meal.calories} cal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g | Fiber: {meal.fiber}g
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMeal(meal._id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {meals.filter(m => m.mealType === 'lunch').length === 0 && (
                <div className="text-gray-500 text-sm italic">No lunch items</div>
              )}
            </div>
          </div>

          {/* Dinner */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3 text-blue-400">🌙 Dinner</h4>
            <div className="space-y-2">
              {meals.filter(m => m.mealType === 'dinner').map((meal) => (
                <div key={meal._id} className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-200">{meal.foodName}</div>
                    <div className="text-sm text-gray-400">
                      {meal.calories} cal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g | Fiber: {meal.fiber}g
                  </div>
                  </div>
                  <button
                    onClick={() => deleteMeal(meal._id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {meals.filter(m => m.mealType === 'dinner').length === 0 && (
                <div className="text-gray-500 text-sm italic">No dinner items</div>
              )}
            </div>
          </div>

          {/* Snacks */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3 text-purple-400">🍿 Snacks</h4>
            <div className="space-y-2">
              {meals.filter(m => m.mealType === 'snack').map((meal) => (
                <div key={meal._id} className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-200">{meal.foodName}</div>
                    <div className="text-sm text-gray-400">
                      {meal.calories} cal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g | Fiber: {meal.fiber}g
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMeal(meal._id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {meals.filter(m => m.mealType === 'snack').length === 0 && (
                <div className="text-gray-500 text-sm italic">No snack items</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Meal Modal */}
      {showAddMealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Add New Meal</h3>
            <form onSubmit={(e) => { e.preventDefault(); addMeal(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Food Name</label>
                  <input
                    type="text"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Meal Type</label>
                  <select
                    value={newMeal.mealType}
                    onChange={(e) => setNewMeal({ ...newMeal, mealType: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="breakfast">🌅 Breakfast</option>
                    <option value="lunch">🌞 Lunch</option>
                    <option value="dinner">🌙 Dinner</option>
                    <option value="snack">🍿 Snack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Calories</label>
                  <input
                    type="number"
                    value={newMeal.calories}
                    onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Protein (g)</label>
                    <input
                      type="number"
                      value={newMeal.protein}
                      onChange={(e) => setNewMeal({ ...newMeal, protein: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      value={newMeal.carbs}
                      onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Fat (g)</label>
                    <input
                      type="number"
                      value={newMeal.fat}
                      onChange={(e) => setNewMeal({ ...newMeal, fat: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Fiber (g)</label>
                    <input
                      type="number"
                      value={newMeal.fiber}
                      onChange={(e) => setNewMeal({ ...newMeal, fiber: e.target.value })}
                      className="w-full rounded-lg border border-gray-700 bg-gray-700 px-3 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Add Meal
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMealModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 