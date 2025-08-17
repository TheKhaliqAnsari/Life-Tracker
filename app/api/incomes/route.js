import { NextResponse } from 'next/server';
import { connectDB, Income } from '@/lib/mongodb';
import { cookies } from 'next/headers';
const { verifyToken } = require('@/lib/auth');

// GET /api/incomes - Get all incomes for a user
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
    
    const incomes = await Income.find({ userId: user.id }).sort({ date: -1 });
    
    return NextResponse.json(incomes);
  } catch (error) {
    console.error('Error fetching incomes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/incomes - Create a new income
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
    const { amount, source, date, type, recurring, recurringDay } = body;

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    if (!source || source.trim().length < 2) {
      return NextResponse.json({ error: 'Source must be at least 2 characters' }, { status: 400 });
    }

    await connectDB();
    
    const income = new Income({
      userId: user.id,
      amount: parseFloat(amount),
      source: source.trim(),
      date: date || new Date(),
      type: type || 'salary',
      recurring: recurring || false,
      recurringDay: recurring && recurringDay ? parseInt(recurringDay) : null,
      createdAt: new Date()
    });

    const savedIncome = await income.save();
    
    return NextResponse.json(savedIncome, { status: 201 });
  } catch (error) {
    console.error('Error creating income:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 