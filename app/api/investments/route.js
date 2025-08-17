import { NextResponse } from 'next/server';
import { connectDB, Investment } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

// GET /api/investments - Get all investments for a user
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
    
    const investments = await Investment.find({ userId: user.id }).sort({ date: -1 });
    
    return NextResponse.json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/investments - Create a new investment
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
    const { amount, type, description, date, expectedReturn } = body;

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    if (!type || !['mutual_fund', 'shares', 'courses'].includes(type)) {
      return NextResponse.json({ error: 'Invalid investment type' }, { status: 400 });
    }

    if (!description || description.trim().length < 3) {
      return NextResponse.json({ error: 'Description must be at least 3 characters' }, { status: 400 });
    }

    await connectDB();
    
    const investment = new Investment({
      userId: user.id,
      amount: parseFloat(amount),
      type: type,
      description: description.trim(),
      date: date || new Date(),
      expectedReturn: expectedReturn ? parseFloat(expectedReturn) : null,
      isActive: true,
      createdAt: new Date()
    });

    const savedInvestment = await investment.save();
    
    return NextResponse.json(savedInvestment, { status: 201 });
  } catch (error) {
    console.error('Error creating investment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 