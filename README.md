# 🚀 LifeFlow - Comprehensive Life Management Platform

A modern, full-stack web application built with Next.js that helps users manage every aspect of their life - from health and fitness to finances, habits, and productivity.

![LifeFlow Dashboard](https://img.shields.io/badge/Next.js-15.4.6-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-6.18.0-green?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-blue?style=for-the-badge&logo=tailwind-css)

## ✨ Features Overview

### 🏥 **Health & Fitness Tracking**
- **Weight Management**: Track daily weight, body fat percentage, muscle mass
- **BMI Calculator**: Monitor BMI changes with visual charts
- **Exercise Logging**: Record workouts, duration, calories burned, and intensity
- **Nutrition Tracking**: Monitor daily food intake, calories, and macronutrients
- **Health Analytics**: Beautiful charts and progress visualization

### ✅ **Habit Building & Tracking**
- **Custom Habits**: Create personalized habits with categories and frequencies
- **Progress Monitoring**: Track daily completion with streak counting
- **Habit Types**: Support for both building new habits and quitting bad ones
- **Visual Progress**: Color-coded habit tracking with detailed analytics

### 💰 **Financial Management**
- **Expense Tracking**: Categorize and monitor daily expenses
- **Income Management**: Track multiple income sources and recurring payments
- **Investment Portfolio**: Monitor mutual funds, shares, and course investments
- **Lending & Borrowing**: Track money lent/borrowed with return dates
- **Financial Analytics**: Comprehensive spending insights and trends

### 🚭 **Smoking Cessation Support**
- **Progress Tracking**: Monitor smoke-free days and cigarette consumption
- **Milestone Celebrations**: Track achievements and set quit goals
- **Daily Logging**: Record smoking patterns and triggers
- **Motivational Insights**: Visual progress and statistics

### 📋 **Task & Project Management**
- **Kanban Boards**: Create multiple project boards with drag-and-drop
- **Task Organization**: Prioritize tasks with status, due dates, and descriptions
- **Team Collaboration**: Share boards and assign tasks
- **Visual Workflow**: List and grid views with smooth animations

### 🍽️ **Diet & Nutrition**
- **Meal Planning**: Track breakfast, lunch, dinner, and snacks
- **Macro Tracking**: Monitor protein, carbs, fat, and fiber intake
- **Custom Foods**: Add personal recipes and food items
- **Nutrition Goals**: Set and track daily calorie and macro targets

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15.4.6** - React framework with App Router
- **React 19.1.0** - Latest React with modern features
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Beautiful data visualization

### **Backend**
- **Node.js** - Server-side JavaScript runtime
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT Authentication** - Secure user authentication
- **bcryptjs** - Password hashing and security

### **Development Tools**
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing and optimization
- **Git** - Version control

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Life-Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your MongoDB URI
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
Life-Tracker/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── boards/             # Task board management
│   │   ├── tasks/              # Task CRUD operations
│   │   ├── habits/             # Habit management
│   │   ├── health-tracker/     # Health & fitness APIs
│   │   ├── diet-tracker/       # Nutrition tracking APIs
│   │   ├── expense-tracker/    # Financial management APIs
│   │   └── smoking-tracker/    # Smoking cessation APIs
│   ├── dashboard/              # Main dashboard
│   ├── health-tracker/         # Health tracking pages
│   ├── habit-tracker/          # Habit management pages
│   ├── expense-tracker/        # Financial pages
│   ├── diet-tracker/           # Nutrition pages
│   ├── smoking-tracker/        # Smoking cessation pages
│   ├── login/                  # Authentication pages
│   └── register/               # User registration
├── components/                  # Reusable UI components
│   ├── Toast.js               # Notification system
│   └── ThemeToggle.js         # Theme switcher
├── lib/                        # Utility libraries
│   ├── mongodb.js             # Database connection & schemas
│   └── auth.js                # Authentication utilities
├── styles/                     # Global styles
├── public/                     # Static assets
└── data/                       # Data files
```

## 🔐 Authentication & Security

- **JWT-based authentication** with HTTP-only cookies
- **Password hashing** using bcryptjs
- **Protected routes** for user-specific data
- **Input validation** and sanitization
- **Secure MongoDB connection** with environment variables

## 📊 Database Schema

The application uses MongoDB with comprehensive schemas for:

- **Users**: Authentication and profile management
- **TaskBoards & Tasks**: Project and task organization
- **Habits & HabitTracker**: Habit building and monitoring
- **Health Data**: Weight, BMI, exercise, and nutrition tracking
- **Financial Data**: Expenses, income, investments, and lending
- **Smoking Data**: Cessation progress and patterns

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Themes**: Toggle between themes with persistence
- **Smooth Animations**: Framer Motion powered interactions
- **Drag & Drop**: Intuitive task and habit management
- **Toast Notifications**: User feedback and error handling
- **Data Visualization**: Beautiful charts and progress indicators

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push

### Manual Deployment
```bash
npm run build
npm start
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Task Management
- `GET/POST /api/boards` - Board CRUD operations
- `GET/POST/PUT/DELETE /api/tasks` - Task management
- `POST /api/tasks/reorder` - Drag & drop reordering

### Health & Fitness
- `GET/POST /api/health-tracker/*` - Health data management
- `GET/POST /api/exercises` - Exercise logging
- `GET/POST /api/diet-entries` - Food tracking

### Financial Management
- `GET/POST /api/expenses` - Expense tracking
- `GET/POST /api/incomes` - Income management
- `GET/POST /api/investments` - Investment portfolio

### Habit Tracking
- `GET/POST /api/habits` - Habit creation and management
- `GET/POST /api/habit-tracker` - Daily habit tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS approach
- **MongoDB** for the flexible database solution
- **Framer Motion** for smooth animations
- **Recharts** for beautiful data visualization

## 📞 Support

If you have any questions or need help:

- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation above

---

**Built with ❤️ using Next.js, React, and MongoDB**

*Transform your life with comprehensive tracking and management tools!*
