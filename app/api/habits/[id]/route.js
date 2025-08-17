import { NextResponse } from 'next/server';
import { connectDB, Habit } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { HabitTracker } from '@/lib/mongodb'; // Added import for HabitTracker

// GET /api/habits/[id] - Get a specific habit
export async function GET(request, { params }) {
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

    const { id } = params;
    await connectDB();
    
    const habit = await Habit.findOne({ _id: id, userId: user.id });
    
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json(habit);
  } catch (error) {
    console.error('Error fetching habit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/habits/[id] - Update a habit
export async function PUT(request, { params }) {
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

    const { id } = params;
    const body = await request.json();
    const { name, description, category, frequency, targetCount, color, isActive } = body;

    if (name !== undefined && (!name || name.trim().length < 2)) {
      return NextResponse.json({ error: 'Habit name must be at least 2 characters' }, { status: 400 });
    }

    await connectDB();
    
    const habit = await Habit.findOne({ _id: id, userId: user.id });
    
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    // Update only provided fields
    if (name !== undefined) habit.name = name.trim();
    if (description !== undefined) habit.description = description.trim();
    if (category !== undefined) habit.category = category.trim();
    if (frequency !== undefined) habit.frequency = frequency;
    if (targetCount !== undefined) habit.targetCount = targetCount;
    if (color !== undefined) habit.color = color;
    if (isActive !== undefined) habit.isActive = isActive;

    const updatedHabit = await habit.save();
    
    return NextResponse.json(updatedHabit);
  } catch (error) {
    console.error('Error updating habit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/habits/[id] - Delete a habit (soft delete by default, hard delete with query param)
export async function DELETE(request, { params }) {
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
    const { id } = params;
    
    // Check if hard delete is requested
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';
    
    await connectDB();
    
    const habit = await Habit.findOne({ _id: id, userId: user.id });
    
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    if (hardDelete) {
      // Hard delete: Remove the habit and all its tracking data
      try {
        // Delete all tracking records for this habit
        const deleteResult = await HabitTracker.deleteMany({ 
          userId: user.id, 
          habitId: id 
        });
        
        // Delete the habit itself
        await Habit.findByIdAndDelete(id);
        
        return NextResponse.json({ 
          message: 'Habit and all tracking data deleted permanently',
          deletedHabit: habit.name,
          deletedTrackingRecords: deleteResult.deletedCount
        });
      } catch (deleteError) {
        console.error('Error during hard delete:', deleteError);
        return NextResponse.json({ 
          error: 'Failed to delete habit and tracking data' 
        }, { status: 500 });
      }
    } else {
      // Soft delete: Set isActive to false (existing behavior)
      habit.isActive = false;
      await habit.save();
      
      return NextResponse.json({ 
        message: 'Habit deactivated successfully',
        deactivatedHabit: habit.name
      });
    }
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 