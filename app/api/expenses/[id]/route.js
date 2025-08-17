import { NextResponse } from 'next/server';
import { connectDB, Expense } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

// GET /api/expenses/[id] - Get a specific expense
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
    
    const expense = await Expense.findOne({ _id: id, userId: user.id });
    
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/expenses/[id] - Update an expense
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
    const { amount, category, description, date, type, isRecoverable, personName } = body;

    if (amount !== undefined && (!amount || parseFloat(amount) <= 0)) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    if (category !== undefined && (!category || category.trim().length < 2)) {
      return NextResponse.json({ error: 'Category must be at least 2 characters' }, { status: 400 });
    }

    if (description !== undefined && (!description || description.trim().length < 3)) {
      return NextResponse.json({ error: 'Description must be at least 3 characters' }, { status: 400 });
    }

    await connectDB();
    
    const expense = await Expense.findOne({ _id: id, userId: user.id });
    
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Update only provided fields
    if (amount !== undefined) expense.amount = parseFloat(amount);
    if (category !== undefined) expense.category = category.trim();
    if (description !== undefined) expense.description = description.trim();
    if (date !== undefined) expense.date = date;
    if (type !== undefined) expense.type = type;
    if (isRecoverable !== undefined) expense.isRecoverable = isRecoverable;
    if (personName !== undefined) expense.personName = personName ? personName.trim() : '';

    const updatedExpense = await expense.save();
    
    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/expenses/[id] - Delete an expense
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
    
    const expense = await Expense.findOne({ _id: id, userId: user.id });
    
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    await Expense.findByIdAndDelete(id);
    
    return NextResponse.json({ 
      message: 'Expense deleted successfully',
      deletedExpense: expense.description
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 