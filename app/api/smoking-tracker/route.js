import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB, User, SmokingTracker } from "@/lib/mongodb";

export const runtime = "nodejs";

async function getAuthUser() {
  const token = cookies().get("token")?.value || null;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  
  try {
    await connectDB();
    const user = await User.findById(decoded.id);
    return user ? { id: user._id.toString(), username: user.username } : null;
  } catch (error) {
    console.error("Error getting auth user:", error);
    return null;
  }
}

function getDateString(date = new Date()) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

function getDayOfWeek(dateStr) {
  const date = new Date(dateStr + 'T00:00:00.000Z');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// GET - Fetch smoking tracker data for user
export async function GET(request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30'); // Default to 30 days

  try {
    await connectDB();

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);

    // Get existing records for the date range
    const records = await SmokingTracker.find({
      userId: user.id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    // Create a complete array of dates with smoking status
    const trackingData = [];
    const recordMap = new Map();
    
    records.forEach(record => {
      const dateStr = getDateString(record.date);
      recordMap.set(dateStr, record);
    });

    // Generate data for each day in the range
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = getDateString(currentDate);
      
      const record = recordMap.get(dateStr);
      trackingData.push({
        date: dateStr,
        dayOfWeek: getDayOfWeek(dateStr),
        smokeFree: record ? record.smokeFree : false, // Default to smoking day if no record
        cigarettesSmoked: record?.cigarettesSmoked || (record ? 0 : 1), // Default 1 cigarette if no record
        notes: record?.notes || '',
        id: record?._id?.toString() || null
      });
    }

    // Calculate statistics
    const totalDays = trackingData.length;
    const smokeFreeCount = trackingData.filter(day => day.smokeFree).length;
    const currentStreak = calculateCurrentStreak(trackingData);
    const longestStreak = calculateLongestStreak(trackingData);
    const totalCigarettes = trackingData.reduce((sum, day) => sum + (day.cigarettesSmoked || 0), 0);
    const averageCigarettesPerDay = totalDays > 0 ? Math.round((totalCigarettes / totalDays) * 10) / 10 : 0;
    const smokingDays = trackingData.filter(day => !day.smokeFree && day.cigarettesSmoked > 0);
    const averageCigarettesOnSmokingDays = smokingDays.length > 0 
      ? Math.round((smokingDays.reduce((sum, day) => sum + day.cigarettesSmoked, 0) / smokingDays.length) * 10) / 10 
      : 0;

    const stats = {
      totalDays,
      smokeFreeCount,
      smokedCount: totalDays - smokeFreeCount,
      successRate: totalDays > 0 ? Math.round((smokeFreeCount / totalDays) * 100) : 0,
      currentStreak,
      longestStreak,
      totalCigarettes,
      averageCigarettesPerDay,
      averageCigarettesOnSmokingDays
    };

    return NextResponse.json({
      trackingData,
      stats
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching smoking tracker data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

// POST - Update smoking status for a specific day
export async function POST(request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const date = body.date;
  const smokeFree = body.smokeFree;
  const cigarettesSmoked = body.cigarettesSmoked !== undefined ? Number(body.cigarettesSmoked) : 0;
  const notes = body.notes || '';

  console.log('Received body:', body);
  console.log('Extracted values:', { date, smokeFree, cigarettesSmoked, notes });
  console.log('cigarettesSmoked type:', typeof cigarettesSmoked);
  console.log('cigarettesSmoked raw value:', body.cigarettesSmoked);

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  if (typeof smokeFree !== 'boolean') {
    return NextResponse.json({ error: "smokeFree must be a boolean" }, { status: 400 });
  }

  if (typeof cigarettesSmoked !== 'number' || cigarettesSmoked < 0 || cigarettesSmoked > 100) {
    return NextResponse.json({ error: "cigarettesSmoked must be a number between 0 and 100" }, { status: 400 });
  }

  try {
    await connectDB();

    // Ensure date is in correct format
    const trackingDate = new Date(date + 'T00:00:00.000Z');
    
    // Update or create record for this date
    const updateData = {
      smokeFree, 
      cigarettesSmoked: smokeFree ? 0 : cigarettesSmoked, // If smoke-free, reset cigarettes to 0
      notes: notes.trim() 
    };
    
    console.log('Update data being saved:', updateData);
    
    const record = await SmokingTracker.findOneAndUpdate(
      { 
        userId: user.id, 
        date: trackingDate 
      },
      updateData,
      { 
        upsert: true, 
        new: true 
      }
    );

    console.log(`Smoking tracker updated: ${date} - smokeFree: ${smokeFree}, cigarettes: ${cigarettesSmoked} for user: ${user.username}`);
    console.log('Saved record:', record);

    return NextResponse.json({
      date,
      smokeFree: record.smokeFree,
      cigarettesSmoked: record.cigarettesSmoked || 0,
      notes: record.notes || '',
      id: record._id.toString()
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating smoking tracker:", error);
    return NextResponse.json({ error: "Failed to update tracking data" }, { status: 500 });
  }
}

// Helper function to calculate current streak (consecutive smoke-free days from today backwards)
function calculateCurrentStreak(trackingData) {
  let streak = 0;
  // Start from the most recent day and go backwards
  for (let i = trackingData.length - 1; i >= 0; i--) {
    if (trackingData[i].smokeFree) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Helper function to calculate longest streak in the data
function calculateLongestStreak(trackingData) {
  let maxStreak = 0;
  let currentStreak = 0;
  
  trackingData.forEach(day => {
    if (day.smokeFree) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });
  
  return maxStreak;
} 