import { NextResponse } from 'next/server';
import { connectDB, Expense } from '@/lib/mongodb';
import { cookies } from 'next/headers';
const { verifyToken } = require('@/lib/auth');

// GET /api/expenses - Get all expenses for a user
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
    
    // Get expenses from the database (we'll create the model next)
    const expenses = await Expense.find({ userId: user.id }).sort({ date: -1 });
    
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/expenses - Create a new expense
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
    const { amount, category, description, date, type, isRecoverable, personName } = body;

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    if (!category || category.trim().length < 2) {
      return NextResponse.json({ error: 'Category must be at least 2 characters' }, { status: 400 });
    }

    if (!description || description.trim().length < 3) {
      return NextResponse.json({ error: 'Description must be at least 3 characters' }, { status: 400 });
    }

    await connectDB();
    
    const expense = new Expense({
      userId: user.id,
      amount: parseFloat(amount),
      category: category.trim(),
      description: description.trim(),
      date: date || new Date(),
      type: type || 'personal',
      isRecoverable: isRecoverable || false,
      personName: personName ? personName.trim() : '',
      createdAt: new Date()
    });

    const savedExpense = await expense.save();
    
    return NextResponse.json(savedExpense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 