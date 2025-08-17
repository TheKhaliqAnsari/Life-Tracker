import { NextResponse } from 'next/server';
import { connectDB, Habit, HabitTracker } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

// POST /api/habits/cleanup - Clean up old tracking data for habits
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
    const { 
      habitIds = [], // If empty, clean all habits for the user
      olderThanDays = 30, // Default: clean data older than 30 days
      keepLastDays = 7 // Default: keep last 7 days of data
    } = body;

    await connectDB();
    
    let targetHabits;
    if (habitIds.length > 0) {
      // Verify specified habits belong to the user
      targetHabits = await Habit.find({ 
        _id: { $in: habitIds }, 
        userId: user.id 
      });
      
      if (targetHabits.length !== habitIds.length) {
        return NextResponse.json({ 
          error: 'Some habits not found or do not belong to you' 
        }, { status: 404 });
      }
    } else {
      // Get all user's habits
      targetHabits = await Habit.find({ userId: user.id });
    }

    if (targetHabits.length === 0) {
      return NextResponse.json({ 
        message: 'No habits found to clean up',
        cleanedRecords: 0
      });
    }

    const habitIdsToClean = targetHabits.map(h => h._id);
    
    // Calculate cutoff dates
    const now = new Date();
    const olderThanDate = new Date(now.getTime() - (olderThanDays * 24 * 60 * 60 * 1000));
    const keepAfterDate = new Date(now.getTime() - (keepLastDays * 24 * 60 * 60 * 1000));
    
    // Delete old tracking records, but keep recent ones
    const deleteResult = await HabitTracker.deleteMany({
      userId: user.id,
      habitId: { $in: habitIdsToClean },
      date: { 
        $lt: olderThanDate,
        $lt: keepAfterDate // This ensures we keep the most recent data
      }
    });

    return NextResponse.json({ 
      message: 'Old tracking data cleaned up successfully',
      cleanedRecords: deleteResult.deletedCount,
      habitsAffected: targetHabits.length,
      cutoffDate: olderThanDate.toISOString(),
      keptDataAfter: keepAfterDate.toISOString()
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 