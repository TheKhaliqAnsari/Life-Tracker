import { NextResponse } from 'next/server';
import { connectDB, Habit, HabitTracker } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

// POST /api/habits/bulk-delete - Delete multiple habits and their tracking data
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
    const { habitIds, hardDelete = true } = body;

    if (!habitIds || !Array.isArray(habitIds) || habitIds.length === 0) {
      return NextResponse.json({ 
        error: 'Habit IDs array is required and must not be empty' 
      }, { status: 400 });
    }

    await connectDB();
    
    // Verify all habits belong to the user
    const habits = await Habit.find({ 
      _id: { $in: habitIds }, 
      userId: user.id 
    });

    if (habits.length !== habitIds.length) {
      return NextResponse.json({ 
        error: 'Some habits not found or do not belong to you' 
      }, { status: 404 });
    }

    const habitNames = habits.map(h => h.name);
    
    if (hardDelete) {
      // Hard delete: Remove habits and all their tracking data
      try {
        // Delete all tracking records for these habits
        const deleteTrackingResult = await HabitTracker.deleteMany({ 
          userId: user.id, 
          habitId: { $in: habitIds } 
        });
        
        // Delete the habits themselves
        const deleteHabitsResult = await Habit.deleteMany({ 
          _id: { $in: habitIds }, 
          userId: user.id 
        });
        
        return NextResponse.json({ 
          message: 'Habits and all tracking data deleted permanently',
          deletedHabits: habitNames,
          deletedHabitsCount: deleteHabitsResult.deletedCount,
          deletedTrackingRecords: deleteTrackingResult.deletedCount
        });
      } catch (deleteError) {
        console.error('Error during bulk hard delete:', deleteError);
        return NextResponse.json({ 
          error: 'Failed to delete habits and tracking data' 
        }, { status: 500 });
      }
    } else {
      // Soft delete: Set isActive to false for all habits
      try {
        const updateResult = await Habit.updateMany(
          { _id: { $in: habitIds }, userId: user.id },
          { isActive: false }
        );
        
        return NextResponse.json({ 
          message: 'Habits deactivated successfully',
          deactivatedHabits: habitNames,
          deactivatedCount: updateResult.modifiedCount
        });
      } catch (updateError) {
        console.error('Error during bulk soft delete:', updateError);
        return NextResponse.json({ 
          error: 'Failed to deactivate habits' 
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Error in bulk delete:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 