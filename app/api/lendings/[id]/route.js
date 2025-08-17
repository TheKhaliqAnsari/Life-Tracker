import { NextResponse } from 'next/server';
import { connectDB, Lending } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

// GET /api/lendings/[id] - Get a specific lending
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
    
    const lending = await Lending.findOne({ _id: id, userId: user.id });
    
    if (!lending) {
      return NextResponse.json({ error: 'Lending not found' }, { status: 404 });
    }

    return NextResponse.json(lending);
  } catch (error) {
    console.error('Error fetching lending:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/lendings/[id] - Update a lending
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
    const { amount, personName, description, date, expectedReturnDate, isReturned } = body;

    if (amount !== undefined && (!amount || parseFloat(amount) <= 0)) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    if (personName !== undefined && (!personName || personName.trim().length < 2)) {
      return NextResponse.json({ error: 'Person name must be at least 2 characters' }, { status: 400 });
    }

    if (description !== undefined && (!description || description.trim().length < 3)) {
      return NextResponse.json({ error: 'Description must be at least 3 characters' }, { status: 400 });
    }

    await connectDB();
    
    const lending = await Lending.findOne({ _id: id, userId: user.id });
    
    if (!lending) {
      return NextResponse.json({ error: 'Lending not found' }, { status: 404 });
    }

    // Update only provided fields
    if (amount !== undefined) lending.amount = parseFloat(amount);
    if (personName !== undefined) lending.personName = personName.trim();
    if (description !== undefined) lending.description = description.trim();
    if (date !== undefined) lending.date = date;
    if (expectedReturnDate !== undefined) lending.expectedReturnDate = expectedReturnDate;
    if (isReturned !== undefined) {
      lending.isReturned = isReturned;
      if (isReturned) {
        lending.returnedDate = new Date();
      } else {
        lending.returnedDate = null;
      }
    }

    const updatedLending = await lending.save();
    
    return NextResponse.json(updatedLending);
  } catch (error) {
    console.error('Error updating lending:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/lendings/[id] - Delete a lending
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
    
    const lending = await Lending.findOne({ _id: id, userId: user.id });
    
    if (!lending) {
      return NextResponse.json({ error: 'Lending not found' }, { status: 404 });
    }

    await Lending.findByIdAndDelete(id);
    
    return NextResponse.json({ 
      message: 'Lending deleted successfully',
      deletedLending: lending.description
    });
  } catch (error) {
    console.error('Error deleting lending:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 