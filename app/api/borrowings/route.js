import { NextResponse } from 'next/server';
import { connectDB, Borrowing } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

// GET /api/borrowings - Get all borrowings for a user
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
    
    const borrowings = await Borrowing.find({ userId: user.id }).sort({ date: -1 });
    
    return NextResponse.json(borrowings);
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/borrowings - Create a new borrowing
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
    const { amount, personName, description, date, expectedReturnDate } = body;

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    if (!personName || personName.trim().length < 2) {
      return NextResponse.json({ error: 'Person name must be at least 2 characters' }, { status: 400 });
    }

    if (!description || description.trim().length < 3) {
      return NextResponse.json({ error: 'Description must be at least 3 characters' }, { status: 400 });
    }

    await connectDB();
    
    const borrowing = new Borrowing({
      userId: user.id,
      amount: parseFloat(amount),
      personName: personName.trim(),
      description: description.trim(),
      date: date || new Date(),
      expectedReturnDate: expectedReturnDate || null,
      isReturned: false,
      createdAt: new Date()
    });

    const savedBorrowing = await borrowing.save();
    
    return NextResponse.json(savedBorrowing, { status: 201 });
  } catch (error) {
    console.error('Error creating borrowing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 