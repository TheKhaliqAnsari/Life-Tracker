import { NextResponse } from 'next/server';
import { connectDB, Habit } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

// GET /api/habits - Get all habits for the authenticated user
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token.value);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const user = { id: decoded.id, username: decoded.username };

    await connectDB();
    
    const habits = await Habit.find({ userId: user.id, isActive: true })
      .sort({ createdAt: -1 });

    return NextResponse.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/habits - Create a new habit
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token.value);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const user = { id: decoded.id, username: decoded.username };

    const body = await request.json();
    const { name, description, category, frequency, targetCount, color, habitType, quitDate } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Habit name must be at least 2 characters' }, { status: 400 });
    }

    await connectDB();
    
    const habit = new Habit({
      userId: user.id,
      name: name.trim(),
      description: description?.trim() || '',
      category: category?.trim() || 'General',
      frequency: frequency || 'daily',
      targetCount: targetCount || 1,
      color: color || '#3B82F6',
      habitType: habitType || 'build',
      quitDate: quitDate ? new Date(quitDate) : null
    });

    const savedHabit = await habit.save();
    
    return NextResponse.json(savedHabit, { status: 201 });
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 