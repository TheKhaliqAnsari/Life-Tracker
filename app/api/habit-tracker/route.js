import { NextResponse } from 'next/server';
import { connectDB, Habit, HabitTracker } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

// GET /api/habit-tracker - Get habit tracking data for the authenticated user
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

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days')) || 30;
    const habitId = searchParams.get('habitId');

    await connectDB();

    // Get user's active habits
    const habits = await Habit.find({ userId: user.id, isActive: true });
    
    if (habits.length === 0) {
      return NextResponse.json({ habits: [], trackingData: [], statistics: {} });
    }

    // If specific habit requested, filter to that habit
    const targetHabits = habitId ? habits.filter(h => h._id.toString() === habitId) : habits;
    
    if (habitId && targetHabits.length === 0) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);

    // Get tracking records for the date range and habits
    const trackingRecords = await HabitTracker.find({
      userId: user.id,
      habitId: { $in: targetHabits.map(h => h._id) },
      date: { $gte: startDate, $lte: endDate }
    }).populate('habitId');

    // Create a map for quick lookup
    const recordMap = new Map();
    trackingRecords.forEach(record => {
      const key = `${record.habitId._id}-${record.date.toISOString().split('T')[0]}`;
      recordMap.set(key, record);
    });

    // Generate tracking data for each habit and day
    const trackingData = [];
    
    for (const habit of targetHabits) {
      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const key = `${habit._id}-${dateStr}`;
        const record = recordMap.get(key);
        
        trackingData.push({
          habitId: habit._id.toString(),
          habitName: habit.name,
          habitColor: habit.color,
          date: dateStr,
          dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
          completed: record ? record.completed : false,
          count: record ? record.count : 0,
          targetCount: habit.targetCount,
          notes: record?.notes || '',
          id: record?._id?.toString() || null
        });
      }
    }

    // Calculate statistics
    const totalDays = days * targetHabits.length;
    const completedDays = trackingData.filter(d => d.completed).length;
    const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    
    const totalCount = trackingData.reduce((sum, d) => sum + d.count, 0);
    const averageCount = totalDays > 0 ? Math.round((totalCount / totalDays) * 10) / 10 : 0;

    // Calculate quit habit statistics
    const quitHabits = targetHabits.filter(h => h.habitType === 'quit');
    const quitHabitDays = days * quitHabits.length;
    const quitHabitCompletedDays = trackingData.filter(d => {
      const habit = targetHabits.find(h => h._id.toString() === d.habitId);
      return habit && habit.habitType === 'quit' && d.completed;
    }).length;

    const statistics = {
      totalHabits: targetHabits.length,
      totalDays,
      completedDays,
      completionRate,
      totalCount,
      averageCount,
      quitHabits: quitHabits.length,
      quitHabitDays,
      quitHabitCompletedDays,
      quitHabitSuccessRate: quitHabitDays > 0 ? Math.round(((quitHabitDays - quitHabitCompletedDays) / quitHabitDays) * 100) : 0
    };

    return NextResponse.json({
      habits: targetHabits,
      trackingData,
      statistics
    });
  } catch (error) {
    console.error('Error fetching habit tracking data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/habit-tracker - Update habit tracking for a specific day
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
    const { habitId, date, completed, count = 0, notes = '' } = body;

    if (!habitId || !date) {
      return NextResponse.json({ error: 'Habit ID and date are required' }, { status: 400 });
    }

    // Verify the habit belongs to the user
    await connectDB();
    const habit = await Habit.findOne({ _id: habitId, userId: user.id, isActive: true });
    
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Parse the date
    const trackingDate = new Date(date);
    if (isNaN(trackingDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Set time to start of day for consistent comparison
    trackingDate.setHours(0, 0, 0, 0);

    // Update or create tracking record
    const updateData = {
      completed,
      count: completed ? count : 0,
      notes: notes.trim()
    };

    const record = await HabitTracker.findOneAndUpdate(
      {
        userId: user.id,
        habitId: habitId,
        date: trackingDate
      },
      updateData,
      {
        upsert: true,
        new: true
      }
    ).populate('habitId');

    return NextResponse.json({
      habitId: record.habitId._id.toString(),
      habitName: record.habitId.name,
      date,
      completed: record.completed,
      count: record.count,
      notes: record.notes,
      id: record._id.toString()
    });
  } catch (error) {
    console.error('Error updating habit tracking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 