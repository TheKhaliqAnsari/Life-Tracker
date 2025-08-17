import { NextResponse } from 'next/server';
import { connectDB, Income } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

// GET /api/incomes/[id] - Get a specific income
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
    
    const income = await Income.findOne({ _id: id, userId: user.id });
    
    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }

    return NextResponse.json(income);
  } catch (error) {
    console.error('Error fetching income:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/incomes/[id] - Update an income
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
    const { amount, source, date, type, recurring, recurringDay } = body;

    if (amount !== undefined && (!amount || parseFloat(amount) <= 0)) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    if (source !== undefined && (!source || source.trim().length < 2)) {
      return NextResponse.json({ error: 'Source must be at least 2 characters' }, { status: 400 });
    }

    await connectDB();
    
    const income = await Income.findOne({ _id: id, userId: user.id });
    
    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }

    // Update only provided fields
    if (amount !== undefined) income.amount = parseFloat(amount);
    if (source !== undefined) income.source = source.trim();
    if (date !== undefined) income.date = date;
    if (type !== undefined) income.type = type;
    if (recurring !== undefined) income.recurring = recurring;
    if (recurringDay !== undefined) income.recurringDay = recurring && recurringDay ? parseInt(recurringDay) : null;

    const updatedIncome = await income.save();
    
    return NextResponse.json(updatedIncome);
  } catch (error) {
    console.error('Error updating income:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/incomes/[id] - Delete an income
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
    
    await connectDB();
    
    const income = await Income.findOne({ _id: id, userId: user.id });
    
    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }

    await Income.findByIdAndDelete(id);
    
    return NextResponse.json({ 
      message: 'Income deleted successfully',
      deletedIncome: income.source
    });
  } catch (error) {
    console.error('Error deleting income:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 