import { NextResponse } from 'next/server';
import { connectDB, DietEntry } from '@/lib/mongodb';
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
    
    const updatedEntry = await DietEntry.findOneAndUpdate(
      { _id: id, userId: user.id },
      { ...body },
      { new: true }
    );
    
    if (!updatedEntry) {
      return NextResponse.json({ error: 'Diet entry not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Error updating diet entry:', error);
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
    
    const deletedEntry = await DietEntry.findOneAndDelete({ _id: id, userId: user.id });
    
    if (!deletedEntry) {
      return NextResponse.json({ error: 'Diet entry not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Diet entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting diet entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 