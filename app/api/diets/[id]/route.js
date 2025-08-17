import { NextResponse } from 'next/server';
import { connectDB, Diet } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const { id } = params;
    const body = await request.json();
    
    // If this diet is being activated, deactivate all other diets
    if (body.isActive) {
      await Diet.updateMany(
        { userId: user.id, _id: { $ne: id } },
        { isActive: false }
      );
    }
    
    const updatedDiet = await Diet.findOneAndUpdate(
      { _id: id, userId: user.id },
      { ...body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!updatedDiet) {
      return NextResponse.json({ error: 'Diet not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedDiet);
  } catch (error) {
    console.error('Error updating diet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const { id } = params;
    
    const deletedDiet = await Diet.findOneAndDelete({ _id: id, userId: user.id });
    
    if (!deletedDiet) {
      return NextResponse.json({ error: 'Diet not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Diet deleted successfully' });
  } catch (error) {
    console.error('Error deleting diet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 