"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

// Feature Showcase Component
function FeatureShowcase() {
  const features = [
    {
      icon: "📊",
      title: "Health & Fitness Tracking",
      description: "Monitor weight, BMI, exercise, calories burned, and set health goals with beautiful charts",
      color: "from-emerald-500 to-teal-500",
      bgColor: "from-emerald-500/10 to-teal-500/10",
      link: "/health-tracker"
    },
    {
      icon: "✅",
      title: "Habit Building",
      description: "Track daily habits, build routines, and visualize your progress over time",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-500/10 to-cyan-500/10",
      link: "/habit-tracker"
    },
    {
      icon: "💰",
      title: "Expense Management",
      description: "Track income, expenses, investments, and lending with detailed analytics",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-500/10 to-emerald-500/10",
      link: "/expense-tracker"
    },
    {
      icon: "🚭",
      title: "Smoking Cessation",
      description: "Monitor smoking habits, track progress, and celebrate smoke-free milestones",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-500/10 to-pink-500/10",
      link: "/smoking-tracker"
    },
    {
      icon: "🍽️",
      title: "Diet & Nutrition",
      description: "Track meals, calories, and nutrition with food database integration",
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-500/10 to-red-500/10",
      link: "/diet-tracker"
    },
    {
      icon: "📋",
      title: "Task Management",
      description: "Organize projects with drag-and-drop kanban boards and team collaboration",
      color: "from-indigo-500 to-purple-500",
      bgColor: "from-indigo-500/10 to-purple-500/10",
      link: "/dashboard"
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative"
          >
            <Link href={feature.link}>
              <div className={`relative p-6 md:p-8 rounded-2xl bg-gradient-to-b ${feature.bgColor} border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300 h-full`}>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative h-full flex flex-col">
                  <div className="text-4xl md:text-5xl mb-4">{feature.icon}</div>
                  <h3 className={`text-xl md:text-2xl font-bold mb-3 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-4 flex-grow">
                    {feature.description}
                  </p>
                  <div className={`inline-flex items-center gap-2 text-sm font-medium bg-gradient-to-r ${feature.color} bg-clip-text text-transparent group-hover:gap-3 transition-all duration-300`}>
                    Explore Feature
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Stats Component
function StatsSection() {
  const stats = [
    { number: "6+", label: "Tracking Modules", description: "Comprehensive life management" },
    { number: "∞", label: "Data Insights", description: "Unlimited analytics & charts" },
    { number: "100%", label: "Privacy First", description: "Your data stays yours" },
    { number: "24/7", label: "Always Available", description: "Access anywhere, anytime" }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 py-12 md:py-16"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="text-center group"
          >
            <div className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2 group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
              {stat.number}
            </div>
            <div className="text-gray-200 text-lg font-semibold mb-1">{stat.label}</div>
            <div className="text-gray-400 text-sm">{stat.description}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// Demo Section Component
function DemoSection() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-white/10 backdrop-blur-sm overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-3xl" />
        <div className="relative text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              See Your Life
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              in Numbers
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Track everything from your morning coffee to your evening workout. 
            Get insights that help you make better decisions every day.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="text-2xl mb-2">📈</div>
              <h3 className="font-semibold text-white mb-2">Progress Tracking</h3>
              <p className="text-sm text-gray-400">Visualize your journey with beautiful charts and analytics</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-white mb-2">Goal Setting</h3>
              <p className="text-sm text-gray-400">Set meaningful targets and track your achievements</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="text-2xl mb-2">📱</div>
              <h3 className="font-semibold text-white mb-2">Mobile First</h3>
              <p className="text-sm text-gray-400">Access your data anywhere, anytime</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const scaleParallax = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacityParallax = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0a0f1a] via-[#0b1320] to-[#0e1726] text-gray-100 overflow-x-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-l from-purple-600/20 to-fuchsia-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -50, 0],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/3 left-1/2 w-64 h-64 bg-gradient-to-br from-emerald-600/15 to-teal-500/15 rounded-full blur-2xl"
        />
      </div>

      {/* Enhanced Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50"
      >
        <div className="mx-4 my-4 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30" />
                <div className="absolute inset-0 w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 blur-sm opacity-50" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                LifeTracker
              </span>
            </motion.div>
            
            <div className="flex items-center gap-3 md:gap-4">
              {user ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="hidden sm:flex items-center gap-3 md:gap-4 text-sm"
                >
                  <div className="px-3 md:px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm">
                    Welcome back, <span className="font-semibold">{user.username}</span>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/dashboard"
                      className="px-4 md:px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25 transition-all duration-200"
                    >
                      Dashboard
                    </Link>
                  </motion.div>
                </motion.div>
              ) : (
                <div className="flex items-center gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/login"
                      className="px-3 md:px-4 py-2 rounded-lg border border-white/20 text-sm hover:bg-white/10 transition-colors backdrop-blur-sm"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/register"
                      className="px-4 md:px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25 transition-all duration-200"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Enhanced Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative pt-12 md:pt-20 pb-24 md:pb-32 !w-full"
      >
        <motion.div
          style={{ y: yParallax, scale: scaleParallax, opacity: opacityParallax }}
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 md:mb-12"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm mb-8 backdrop-blur-sm mx-auto"
            >
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Your complete life management companion
            </motion.div>
            
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 md:mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                Track
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Everything
              </span>
            </h1>
            
            {/* Hero Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-full max-w-4xl mx-auto mb-8 md:mb-12"
            >
              <p className="text-lg sm:text-xl md:text-2xl text-gray-300 leading-relaxed px-4 sm:px-6 md:px-8">
                From health and fitness to finances and habits, 
                <br className="hidden sm:block" />
                manage every aspect of your life in one powerful platform.
              </p>
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 md:mb-16 px-4"
            >
              {user ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-base md:text-lg shadow-2xl shadow-blue-500/25 transition-all duration-300 text-center"
                  >
                    Go to Dashboard →
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/register"
                      className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-base md:text-lg shadow-2xl shadow-blue-500/25 transition-all duration-300 text-center"
                    >
                      Start Free Trial
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/login"
                      className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl border border-white/20 text-white font-semibold text-base md:text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm text-center"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-12 md:py-16">
        <StatsSection />
      </section>

      {/* Features Showcase */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 md:py-24 lg:py-32"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6"
            >
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Everything you need to
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                track your life
              </span>
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-4xl mx-auto"
            >
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed px-4 sm:px-6">
                Six powerful modules designed to help you understand, 
                <br className="hidden sm:block" />
                improve, and master every aspect of your daily life
              </p>
            </motion.div>
          </div>

          {/* Features Grid */}
          <FeatureShowcase />
        </div>
      </motion.section>

      {/* Demo Section */}
      <section className="py-12 md:py-16">
        <DemoSection />
      </section>

      {/* Enhanced CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 md:py-24 lg:py-32"
      >
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 border border-white/10 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-3xl" />
              <div className="relative">
                {/* CTA Heading */}
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Ready to take control
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    of your life?
                  </span>
                </h2>
                
                {/* CTA Description */}
                <div className="w-full max-w-3xl mx-auto mb-8 md:mb-10">
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed px-4 sm:px-6">
                    Join thousands of users already tracking their progress
                    <br className="hidden sm:block" />
                    and achieving their goals with LifeTracker.
                  </p>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                  {user ? (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/dashboard"
                        className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-base md:text-lg shadow-2xl shadow-blue-500/25 transition-all duration-300 text-center"
                      >
                        Go to Dashboard →
                      </Link>
                    </motion.div>
                  ) : (
                    <>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          href="/register"
                          className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-base md:text-lg shadow-2xl shadow-blue-500/25 transition-all duration-300 text-center"
                        >
                          Get Started Free
                        </Link>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          href="/login"
                          className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl border border-white/20 text-white font-semibold text-base md:text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm text-center"
                        >
                          Sign In
                        </Link>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Footer */}
      <footer className="border-t border-white/10 py-8 md:py-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500" />
              <span className="font-semibold text-lg">LifeTracker</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 LifeTracker. Developed by Khaliq Ansari.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
