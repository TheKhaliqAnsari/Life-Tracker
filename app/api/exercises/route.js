import { NextResponse } from 'next/server';
import { connectDB, Exercise } from '@/lib/mongodb';
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
    const days = searchParams.get('days') || 7;
    
    let query = { userId: user.id };
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else {
      // Get exercises for last N days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      query.date = { $gte: startDate };
    }
    
    const exercises = await Exercise.find(query).sort({ date: -1, createdAt: -1 });
    
    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
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
    const { date, exerciseName, exerciseType, duration, caloriesBurned, intensity, notes } = body;
    
    if (!date || !exerciseName || !exerciseType || !duration || caloriesBurned === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const exercise = new Exercise({
      userId: user.id,
      date: new Date(date),
      exerciseName,
      exerciseType,
      duration,
      caloriesBurned,
      intensity: intensity || 'medium',
      notes: notes || ''
    });
    
    await exercise.save();
    
    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 