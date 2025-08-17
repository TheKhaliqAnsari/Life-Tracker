import { NextResponse } from 'next/server';
import { connectDB, DietEntry } from '@/lib/mongodb';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    await connectDB();
    
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { verifyToken } = await import('@/lib/auth');
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    let query = { userId: user.id };
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    
    const entries = await DietEntry.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching diet entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { verifyToken } = await import('@/lib/auth');
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const body = await request.json();
    const { date, foodName, description, calories, protein, carbs, fat, fiber, mealType, isCustomFood } = body;
    
    if (!date || !foodName || calories === undefined || protein === undefined || carbs === undefined || fat === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const entry = new DietEntry({
      userId: user.id,
      date: new Date(date),
      foodName,
      description,
      calories,
      protein,
      carbs,
      fat,
      fiber: fiber || 0,
      mealType: mealType || 'snack',
      isCustomFood: isCustomFood || false
    });
    
    await entry.save();
    
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating diet entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 