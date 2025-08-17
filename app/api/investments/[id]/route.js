import { NextResponse } from 'next/server';
import { connectDB, Investment } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

// GET /api/investments/[id] - Get a specific investment
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
    
    const investment = await Investment.findOne({ _id: id, userId: user.id });
    
    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }

    return NextResponse.json(investment);
  } catch (error) {
    console.error('Error fetching investment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/investments/[id] - Update an investment
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
    const { amount, type, description, date, expectedReturn, isActive } = body;

    if (amount !== undefined && (!amount || parseFloat(amount) <= 0)) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    if (type !== undefined && !['mutual_fund', 'shares', 'courses'].includes(type)) {
      return NextResponse.json({ error: 'Invalid investment type' }, { status: 400 });
    }

    if (description !== undefined && (!description || description.trim().length < 3)) {
      return NextResponse.json({ error: 'Description must be at least 3 characters' }, { status: 400 });
    }

    await connectDB();
    
    const investment = await Investment.findOne({ _id: id, userId: user.id });
    
    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }

    // Update only provided fields
    if (amount !== undefined) investment.amount = parseFloat(amount);
    if (type !== undefined) investment.type = type;
    if (description !== undefined) investment.description = description.trim();
    if (date !== undefined) investment.date = date;
    if (expectedReturn !== undefined) investment.expectedReturn = expectedReturn ? parseFloat(expectedReturn) : null;
    if (isActive !== undefined) investment.isActive = isActive;

    const updatedInvestment = await investment.save();
    
    return NextResponse.json(updatedInvestment);
  } catch (error) {
    console.error('Error updating investment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/investments/[id] - Delete an investment
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
    
    const investment = await Investment.findOne({ _id: id, userId: user.id });
    
    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }

    await Investment.findByIdAndDelete(id);
    
    return NextResponse.json({ 
      message: 'Investment deleted successfully',
      deletedInvestment: investment.description
    });
  } catch (error) {
    console.error('Error deleting investment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 