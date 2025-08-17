import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in your .env file');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Connected to MongoDB successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Function to get raw MongoDB driver connection for direct collection access
async function getRawDB() {
  const conn = await connectDB();
  return conn.connection.db;
}

// User Schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, {
  timestamps: true
});

// TaskBoard Schema
const TaskBoardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Task Schema
const TaskSchema = new mongoose.Schema({
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaskBoard',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Smoking Tracker Schema - for tracking daily smoke-free progress
const SmokingTrackerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  smokeFree: {
    type: Boolean,
    default: false
  },
  cigarettesSmoked: {
    type: Number,
    default: 0,
    min: 0,
    max: 100 // reasonable upper limit
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Create compound index to ensure one record per user per day
SmokingTrackerSchema.index({ userId: 1, date: 1 }, { unique: true });

// Habit Schema - for defining habits
const HabitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  targetCount: {
    type: Number,
    default: 1,
    min: 1
  },
  color: {
    type: String,
    default: '#3B82F6' // blue-500
  },
  isActive: {
    type: Boolean,
    default: true
  },
  habitType: {
    type: String,
    enum: ['build', 'quit'],
    default: 'build'
  },
  quitDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Habit Tracker Schema - for tracking daily habit completion
const HabitTrackerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  count: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Create compound index to ensure one record per user per habit per day
HabitTrackerSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

// Expense Schema
const ExpenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['personal', 'family', 'friends'],
    default: 'personal'
  },
  isRecoverable: {
    type: Boolean,
    default: false
  },
  personName: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Income Schema
const IncomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['salary', 'freelance', 'investment', 'other'],
    default: 'salary'
  },
  recurring: {
    type: Boolean,
    default: false
  },
  recurringDay: {
    type: Number,
    min: 1,
    max: 31,
    default: null
  }
}, {
  timestamps: true
});

// Lending Schema
const LendingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  personName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  expectedReturnDate: {
    type: Date,
    default: null
  },
  isReturned: {
    type: Boolean,
    default: false
  },
  returnedDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Borrowing Schema
const BorrowingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  personName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  expectedReturnDate: {
    type: Date,
    default: null
  },
  isReturned: {
    type: Boolean,
    default: false
  },
  returnedDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Investment Schema
const InvestmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['mutual_fund', 'shares', 'courses'],
    default: 'mutual_fund'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  expectedReturn: {
    type: Number,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Diet Schema
const DietSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  targetCalories: { type: Number, required: true },
  targetProtein: { type: Number, required: true }, // in grams
  targetCarbs: { type: Number, required: true }, // in grams
  targetFat: { type: Number, required: true }, // in grams
  targetFiber: { type: Number, default: 25 }, // in grams
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Diet Entry Schema (daily food tracking)
const DietEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  foodName: { type: String, required: true },
  description: { type: String },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true }, // in grams
  carbs: { type: Number, required: true }, // in grams
  fat: { type: Number, required: true }, // in grams
  fiber: { type: Number, default: 0 }, // in grams
  mealType: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner', 'snack'], 
    default: 'snack' 
  },
  isCustomFood: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Exercise Schema
const ExerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  exerciseName: { type: String, required: true },
  exerciseType: {
    type: String,
    enum: ['cardio', 'strength', 'flexibility', 'sports', 'other'],
    required: true
  },
  duration: { type: Number, required: true }, // in minutes
  caloriesBurned: { type: Number, required: true },
  intensity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Weight Entry Schema
const WeightEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  weight: { type: Number, required: true }, // in kg
  bodyFatPercentage: { type: Number }, // optional
  muscleMass: { type: Number }, // in kg, optional
  waterPercentage: { type: Number }, // optional
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// BMI Tracking Schema
const BMITrackingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  height: { type: Number, required: true }, // in cm
  weight: { type: Number, required: true }, // in kg
  bmi: { type: Number, required: true },
  bmiCategory: {
    type: String,
    enum: ['underweight', 'normal', 'overweight', 'obese'],
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const TaskBoard = mongoose.models.TaskBoard || mongoose.model('TaskBoard', TaskBoardSchema);
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
const SmokingTracker = mongoose.models.SmokingTracker || mongoose.model('SmokingTracker', SmokingTrackerSchema);
const Habit = mongoose.models.Habit || mongoose.model('Habit', HabitSchema);
const HabitTracker = mongoose.models.HabitTracker || mongoose.model('HabitTracker', HabitTrackerSchema);
const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
const Income = mongoose.models.Income || mongoose.model('Income', IncomeSchema);
const Lending = mongoose.models.Lending || mongoose.model('Lending', LendingSchema);
const Borrowing = mongoose.models.Borrowing || mongoose.model('Borrowing', BorrowingSchema);
const Investment = mongoose.models.Investment || mongoose.model('Investment', InvestmentSchema);
const Diet = mongoose.models.Diet || mongoose.model('Diet', DietSchema);
const DietEntry = mongoose.models.DietEntry || mongoose.model('DietEntry', DietEntrySchema);
const Exercise = mongoose.models.Exercise || mongoose.model('Exercise', ExerciseSchema);
const WeightEntry = mongoose.models.WeightEntry || mongoose.model('WeightEntry', WeightEntrySchema);
const BMITracking = mongoose.models.BMITracking || mongoose.model('BMITracking', BMITrackingSchema);

export { connectDB, getRawDB, User, TaskBoard, Task, SmokingTracker, Habit, HabitTracker, Expense, Income, Lending, Borrowing, Investment, Diet, DietEntry, Exercise, WeightEntry, BMITracking }; 