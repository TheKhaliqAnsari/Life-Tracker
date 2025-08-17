import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRawDB } from "@/lib/mongodb";

// External meal API integration
async function searchMealsFromAPI(query) {
  try {
    // Using Edamam Food Database API (free tier available)
    // You can also use other APIs like Spoonacular, Nutritionix, etc.
    const apiKey = process.env.EDAMAM_APP_KEY;
    const appId = process.env.EDAMAM_APP_ID;
    
    if (!apiKey || !appId) {
      // Fallback to mock data if API keys are not configured
      return getMockMealData(query);
    }

    const response = await fetch(
      `https://api.edamam.com/api/food-database/v2/parser?app_id=${appId}&app_key=${apiKey}&ingr=${encodeURIComponent(query)}&lang=en`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from meal API');
    }

    const data = await response.json();
    
    if (data.hints && data.hints.length > 0) {
      return data.hints.slice(0, 10).map(hint => ({
        id: hint.food.foodId,
        title: hint.food.label,
        calories: Math.round(hint.food.nutrients.ENERC_KCAL || 0),
        protein: Math.round(hint.food.nutrients.PROCNT || 0),
        carbs: Math.round(hint.food.nutrients.CHOCDF || 0),
        fat: Math.round(hint.food.nutrients.FAT || 0),
        fiber: Math.round(hint.food.nutrients.FIBTG || 0),
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching from meal API:', error);
    // Fallback to mock data
    return getMockMealData(query);
  }
}

function getMockMealData(query) {
  const mockMeals = [
    { id: '1', title: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
    { id: '2', title: 'Salmon Fillet', calories: 208, protein: 25, carbs: 0, fat: 12, fiber: 0 },
    { id: '3', title: 'Brown Rice', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8 },
    { id: '4', title: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
    { id: '5', title: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 },
    { id: '6', title: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.5, fiber: 0 },
    { id: '7', title: 'Oatmeal', calories: 68, protein: 2.4, carbs: 12, fat: 1.4, fiber: 1.7 },
    { id: '8', title: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
    { id: '9', title: 'Eggs', calories: 74, protein: 6.3, carbs: 0.6, fat: 5.3, fiber: 0 },
    { id: '10', title: 'Quinoa', calories: 120, protein: 4.4, carbs: 22, fat: 1.9, fiber: 2.8 },
  ];

  const queryLower = query.toLowerCase();
  return mockMeals.filter(meal => 
    meal.title.toLowerCase().includes(queryLower)
  );
}

export async function GET(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    const meals = await searchMealsFromAPI(query);

    return NextResponse.json({ meals });
  } catch (error) {
    console.error("Meal search GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { verifyToken } = await import("@/lib/auth");
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    
    const { mealId, name, calories, portion } = await request.json();

    if (!mealId || !name || !calories) {
      return NextResponse.json(
        { error: "Meal ID, name, and calories are required" },
        { status: 400 }
      );
    }

    const db = await getRawDB();

    const mealEntry = {
      userId: decoded.userId,
      mealId: mealId,
      name: name,
      calories: parseInt(calories),
      portion: portion || 1,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    };

    const result = await db.collection("meal_entries").insertOne(mealEntry);

    return NextResponse.json({
      message: "Meal entry added successfully",
      entry: { ...mealEntry, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Meal tracking POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 