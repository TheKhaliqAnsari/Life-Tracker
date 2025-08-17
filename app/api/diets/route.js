import { NextResponse } from 'next/server';
import { connectDB, Diet } from '@/lib/mongodb';
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
    
    const diets = await Diet.find({ userId: user.id }).sort({ createdAt: -1 });
    
    return NextResponse.json(diets);
  } catch (error) {
    console.error('Error fetching diets:', error);
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
    const { name, description, targetCalories, targetProtein, targetCarbs, targetFat, targetFiber } = body;
    
    if (!name || !targetCalories || !targetProtein || !targetCarbs || !targetFat) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // If this is a new active diet, deactivate all other diets
    if (body.isActive) {
      await Diet.updateMany(
        { userId: user.id },
        { isActive: false }
      );
    }
    
    const diet = new Diet({
      userId: user.id,
      name,
      description,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      targetFiber: targetFiber || 25,
      isActive: body.isActive || false
    });
    
    await diet.save();
    
    return NextResponse.json(diet, { status: 201 });
  } catch (error) {
    console.error('Error creating diet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 