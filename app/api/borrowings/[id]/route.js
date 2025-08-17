import { NextResponse } from 'next/server';
import { connectDB, Borrowing } from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

// GET /api/borrowings/[id] - Get a specific borrowing
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
    
    const borrowing = await Borrowing.findOne({ _id: id, userId: user.id });
    
    if (!borrowing) {
      return NextResponse.json({ error: 'Borrowing not found' }, { status: 404 });
    }

    return NextResponse.json(borrowing);
  } catch (error) {
    console.error('Error fetching borrowing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/borrowings/[id] - Update a borrowing
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
    
    const borrowing = await Borrowing.findOne({ _id: id, userId: user.id });
    
    if (!borrowing) {
      return NextResponse.json({ error: 'Borrowing not found' }, { status: 404 });
    }

    // Update only provided fields
    if (amount !== undefined) borrowing.amount = parseFloat(amount);
    if (personName !== undefined) borrowing.personName = personName.trim();
    if (description !== undefined) borrowing.description = description.trim();
    if (date !== undefined) borrowing.date = date;
    if (expectedReturnDate !== undefined) borrowing.expectedReturnDate = expectedReturnDate;
    if (isReturned !== undefined) {
      borrowing.isReturned = isReturned;
      if (isReturned) {
        borrowing.returnedDate = new Date();
      } else {
        borrowing.returnedDate = null;
      }
    }

    const updatedBorrowing = await borrowing.save();
    
    return NextResponse.json(updatedBorrowing);
  } catch (error) {
    console.error('Error updating borrowing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/borrowings/[id] - Delete a borrowing
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
    
    const borrowing = await Borrowing.findOne({ _id: id, userId: user.id });
    
    if (!borrowing) {
      return NextResponse.json({ error: 'Borrowing not found' }, { status: 404 });
    }

    await Borrowing.findByIdAndDelete(id);
    
    return NextResponse.json({ 
      message: 'Borrowing deleted successfully',
      deletedBorrowing: borrowing.description
    });
  } catch (error) {
    console.error('Error deleting borrowing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 