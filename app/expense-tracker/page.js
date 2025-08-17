'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ExpenseTrackerPage() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [lendings, setLendings] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showAddLendingModal, setShowAddLendingModal] = useState(false);
  const [showAddBorrowingModal, setShowAddBorrowingModal] = useState(false);
  const [showAddInvestmentModal, setShowAddInvestmentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'personal', // personal, family, friends
    isRecoverable: false,
    personName: ''
  });

  const [newIncome, setNewIncome] = useState({
    amount: '',
    source: '',
    date: new Date().toISOString().split('T')[0],
    type: 'salary', // salary, freelance, investment, other
    recurring: false,
    recurringDay: ''
  });

  const [newLending, setNewLending] = useState({
    amount: '',
    personName: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    isReturned: false
  });

  const [newBorrowing, setNewBorrowing] = useState({
    amount: '',
    personName: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    isReturned: false
  });

  const [newInvestment, setNewInvestment] = useState({
    amount: '',
    type: 'mutual_fund', // mutual_fund, shares, courses
    description: '',
    date: new Date().toISOString().split('T')[0],
    expectedReturn: '',
    isActive: true
  });

  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      // Call fetchAllData directly to avoid circular dependency
      try {
        setLoading(true);
        await Promise.all([
          fetchExpenses(),
          fetchIncomes(),
          fetchLendings(),
          fetchBorrowings(),
          fetchInvestments()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      router.push('/login');
    }
  }, [router]);



  async function fetchExpenses() {
    try {
      const res = await fetch('/api/expenses');
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  }

  async function fetchIncomes() {
    try {
      const res = await fetch('/api/incomes');
      if (res.ok) {
        const data = await res.json();
        setIncomes(data);
      }
    } catch (error) {
      console.error('Error fetching incomes:', error);
    }
  }

  async function fetchLendings() {
    try {
      const res = await fetch('/api/lendings');
      if (res.ok) {
        const data = await res.json();
        setLendings(data);
      }
    } catch (error) {
      console.error('Error fetching lendings:', error);
    }
  }

  async function fetchBorrowings() {
    try {
      const res = await fetch('/api/borrowings');
      if (res.ok) {
        const data = await res.json();
        setBorrowings(data);
      }
    } catch (error) {
      console.error('Error fetching borrowings:', error);
    }
  }

  async function fetchInvestments() {
    try {
      const res = await fetch('/api/investments');
      if (res.ok) {
        const data = await res.json();
        setInvestments(data);
      }
    } catch (error) {
      console.error('Error fetching investments:', error);
    }
  }

  async function createExpense() {
    try {
      // Validation
      if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
        setError('Amount must be greater than 0');
        return;
      }
      if (!newExpense.description.trim()) {
        setError('Description is required');
        return;
      }
      if (!newExpense.date) {
        setError('Date is required');
        return;
      }

      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      });
      
      if (res.ok) {
        await fetchExpenses();
        setShowAddExpenseModal(false);
        setSuccess('Expense added successfully!');
        setNewExpense({
          amount: '',
          category: 'Food',
          description: '',
          date: new Date().toISOString().split('T')[0],
          type: 'personal',
          isRecoverable: false,
          personName: ''
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to add expense');
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      setError('Failed to add expense');
    }
  }

  async function createIncome() {
    try {
      // Validation
      if (!newIncome.amount || parseFloat(newIncome.amount) <= 0) {
        setError('Amount must be greater than 0');
        return;
      }
      if (!newIncome.source.trim()) {
        setError('Source is required');
        return;
      }
      if (!newIncome.date) {
        setError('Date is required');
        return;
      }

      const res = await fetch('/api/incomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIncome)
      });
      
      if (res.ok) {
        await fetchIncomes();
        setShowAddIncomeModal(false);
        setSuccess('Income added successfully!');
        setNewIncome({
          amount: '',
          source: '',
          date: new Date().toISOString().split('T')[0],
          type: 'salary',
          recurring: false,
          recurringDay: ''
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to add income');
      }
    } catch (error) {
      console.error('Error creating income:', error);
      setError('Failed to add income');
    }
  }

  async function createLending() {
    try {
      const res = await fetch('/api/lendings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLending)
      });
      
      if (res.ok) {
        await fetchLendings();
        setShowAddLendingModal(false);
        setNewLending({
          amount: '',
          personName: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          expectedReturnDate: '',
          isReturned: false
        });
      }
    } catch (error) {
      console.error('Error creating lending:', error);
    }
  }

  async function createBorrowing() {
    try {
      const res = await fetch('/api/borrowings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBorrowing)
      });
      
      if (res.ok) {
        await fetchBorrowings();
        setShowAddBorrowingModal(false);
        setNewBorrowing({
          amount: '',
          personName: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          expectedReturnDate: '',
          isReturned: false
        });
      }
    } catch (error) {
      console.error('Error creating borrowing:', error);
    }
  }

  async function createInvestment() {
    try {
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvestment)
      });
      
      if (res.ok) {
        await fetchInvestments();
        setShowAddInvestmentModal(false);
        setNewInvestment({
          amount: '',
          type: 'mutual_fund',
          description: '',
          date: new Date().toISOString().split('T')[0],
          expectedReturn: '',
          isActive: true
        });
      }
    } catch (error) {
      console.error('Error creating investment:', error);
    }
  }

  async function deleteExpense(id) {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchExpenses();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  }

  async function deleteIncome(id) {
    try {
      const res = await fetch(`/api/incomes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchIncomes();
      }
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  }

  async function deleteLending(id) {
    try {
      const res = await fetch(`/api/lendings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchLendings();
      }
    } catch (error) {
      console.error('Error deleting lending:', error);
    }
  }

  async function deleteBorrowing(id) {
    try {
      const res = await fetch(`/api/borrowings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchBorrowings();
      }
    } catch (error) {
      console.error('Error deleting borrowing:', error);
    }
  }

  async function deleteInvestment(id) {
    try {
      const res = await fetch(`/api/investments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchInvestments();
      }
    } catch (error) {
      console.error('Error deleting investment:', error);
    }
  }

  async function markLendingReturned(id) {
    try {
      const res = await fetch(`/api/lendings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isReturned: true })
      });
      if (res.ok) {
        await fetchLendings();
      }
    } catch (error) {
      console.error('Error marking lending returned:', error);
    }
  }

  async function markBorrowingReturned(id) {
    try {
      const res = await fetch(`/api/borrowings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isReturned: true })
      });
      if (res.ok) {
        await fetchBorrowings();
      }
    } catch (error) {
      console.error('Error marking borrowing returned:', error);
    }
  }

  // Calculate totals
  const totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const totalLent = lendings.filter(l => !l.isReturned).reduce((sum, l) => sum + parseFloat(l.amount), 0);
  const totalBorrowed = borrowings.filter(b => !b.isReturned).reduce((sum, b) => sum + parseFloat(b.amount), 0);
  const totalInvested = investments.filter(i => i.isActive).reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const netWorth = totalIncome - totalExpenses - totalLent + totalBorrowed - totalInvested;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                ← Back to Dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-white">💰 Expense Tracker</h1>
            <div className="flex items-center space-x-4">
              <Link href="/habit-tracker" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Habit Tracker
              </Link>
              <Link href="/diet-tracker" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Diet Tracker
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-600 rounded-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-green-100 text-sm">Total Income</p>
                <p className="text-2xl font-bold">₹{totalIncome.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-red-600 rounded-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-red-500 rounded-lg">
                <span className="text-2xl">💸</span>
              </div>
              <div className="ml-4">
                <p className="text-red-100 text-sm">Total Expenses</p>
                <p className="text-2xl font-bold">₹{totalExpenses.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-600 rounded-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-lg">
                <span className="text-2xl">📤</span>
              </div>
              <div className="ml-4">
                <p className="text-blue-100 text-sm">Lent Money</p>
                <p className="text-2xl font-bold">₹{totalLent.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-purple-600 rounded-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-500 rounded-lg">
                <span className="text-2xl">📥</span>
              </div>
              <div className="ml-4">
                <p className="text-purple-100 text-sm">Net Worth</p>
                <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                  ₹{netWorth.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setShowAddIncomeModal(true)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            ➕ Add Income
          </button>
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            ➕ Add Expense
          </button>
          <button
            onClick={() => setShowAddLendingModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            ➕ Add Borrowing
          </button>
          <button
            onClick={() => setShowAddBorrowingModal(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            ➕ Add Borrowing
          </button>
          <button
            onClick={() => setShowAddInvestmentModal(true)}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
          >
            ➕ Add Investment
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search expenses, incomes, lendings, borrowings, investments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="all">All Types</option>
            <option value="expenses">Expenses</option>
            <option value="incomes">Incomes</option>
            <option value="lendings">Lendings</option>
            <option value="borrowings">Borrowings</option>
            <option value="investments">Investments</option>
          </select>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expenses Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-xl font-bold mb-4 text-red-400">💸 Expenses</h2>
            {expenses.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No expenses recorded yet</p>
            ) : (
              <div className="space-y-3">
                {expenses.slice(0, 5).map((expense) => (
                  <div key={expense._id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-gray-400">{expense.category} • {expense.type}</p>
                      <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 font-bold">₹{expense.amount}</p>
                      <button
                        onClick={() => deleteExpense(expense._id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                {expenses.length > 5 && (
                  <p className="text-center text-gray-400 text-sm">
                    Showing 5 of {expenses.length} expenses
                  </p>
                )}
              </div>
            )}
          </motion.div>

          {/* Incomes Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-xl font-bold mb-4 text-green-400">💰 Incomes</h2>
            {incomes.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No incomes recorded yet</p>
            ) : (
              <div className="space-y-3">
                {incomes.slice(0, 5).map((income) => (
                  <div key={income._id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{income.source}</p>
                      <p className="text-sm text-gray-400">{income.type}</p>
                      <p className="text-xs text-gray-500">{new Date(income.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">₹{income.amount}</p>
                      <button
                        onClick={() => deleteIncome(income._id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                {incomes.length > 5 && (
                  <p className="text-center text-gray-400 text-sm">
                    Showing 5 of {incomes.length} incomes
                  </p>
                )}
              </div>
            )}
          </motion.div>

          {/* Lendings Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-xl font-bold mb-4 text-blue-400">📤 Lendings</h2>
            {lendings.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No lendings recorded yet</p>
            ) : (
              <div className="space-y-3">
                {lendings.slice(0, 5).map((lending) => (
                  <div key={lending._id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{lending.personName}</p>
                        <p className="text-sm text-gray-400">{lending.description}</p>
                        <p className="text-xs text-gray-500">{new Date(lending.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-400 font-bold">₹{lending.amount}</p>
                        <div className="flex gap-2 mt-1">
                          {!lending.isReturned && (
                            <button
                              onClick={() => markLendingReturned(lending._id)}
                              className="text-green-400 hover:text-green-300 text-sm"
                            >
                              ✅
                            </button>
                          )}
                          <button
                            onClick={() => deleteLending(lending._id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                    {lending.isReturned && (
                      <p className="text-green-400 text-sm">✅ Returned</p>
                    )}
                  </div>
                ))}
                {lendings.length > 5 && (
                  <p className="text-center text-gray-400 text-sm">
                    Showing 5 of {lendings.length} lendings
                  </p>
                )}
              </div>
            )}
          </motion.div>

          {/* Borrowings Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <h2 className="text-xl font-bold mb-4 text-purple-400">📥 Borrowings</h2>
            {borrowings.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No borrowings recorded yet</p>
            ) : (
              <div className="space-y-3">
                {borrowings.slice(0, 5).map((borrowing) => (
                  <div key={borrowing._id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{borrowing.personName}</p>
                        <p className="text-sm text-gray-400">{borrowing.description}</p>
                        <p className="text-xs text-gray-500">{new Date(borrowing.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-bold">₹{borrowing.amount}</p>
                        <div className="flex gap-2 mt-1">
                          {!borrowing.isReturned && (
                            <button
                              onClick={() => markBorrowingReturned(borrowing._id)}
                              className="text-green-400 hover:text-green-300 text-sm"
                            >
                              ✅
                            </button>
                          )}
                          <button
                            onClick={() => deleteBorrowing(borrowing._id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                    {borrowing.isReturned && (
                      <p className="text-green-400 text-sm">✅ Returned</p>
                    )}
                  </div>
                ))}
                {borrowings.length > 5 && (
                  <p className="text-center text-gray-400 text-sm">
                    Showing 5 of {borrowings.length} borrowings
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Investments Section - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gray-800 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold mb-4 text-yellow-400">📈 Investments</h2>
          {investments.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No investments recorded yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {investments.map((investment) => (
                <div key={investment._id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{investment.description}</p>
                      <p className="text-sm text-gray-400">{investment.type}</p>
                      <p className="text-xs text-gray-500">{new Date(investment.date).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => deleteInvestment(investment._id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-yellow-400 font-bold">₹{investment.amount}</p>
                    <span className={`px-2 py-1 rounded text-xs ${investment.isActive ? 'bg-green-600' : 'bg-gray-600'}`}>
                      {investment.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Add Expense</h3>
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Amount"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              >
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Shopping">Shopping</option>
                <option value="Bills">Bills</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
              <select
                value={newExpense.type}
                onChange={(e) => setNewExpense({...newExpense, type: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              >
                <option value="personal">Personal</option>
                <option value="family">Family</option>
                <option value="friends">Friends</option>
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRecoverable"
                  checked={newExpense.isRecoverable}
                  onChange={(e) => setNewExpense({...newExpense, isRecoverable: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="isRecoverable">Recoverable</label>
              </div>
              {newExpense.isRecoverable && (
                <input
                  type="text"
                  placeholder="Person Name"
                  value={newExpense.personName}
                  onChange={(e) => setNewExpense({...newExpense, personName: e.target.value})}
                  className="w-full p-3 bg-gray-700 rounded-lg text-white"
                />
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={createExpense}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
              >
                Add Expense
              </button>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Income Modal */}
      {showAddIncomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Add Income</h3>
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Amount"
                value={newIncome.amount}
                onChange={(e) => setNewIncome({...newIncome, amount: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
              <input
                type="text"
                placeholder="Source"
                value={newIncome.source}
                onChange={(e) => setNewIncome({...newIncome, source: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
              <input
                type="date"
                value={newIncome.date}
                onChange={(e) => setNewIncome({...newIncome, date: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
              <select
                value={newIncome.type}
                onChange={(e) => setNewIncome({...newIncome, type: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              >
                <option value="salary">Salary</option>
                <option value="freelance">Freelance</option>
                <option value="investment">Investment</option>
                <option value="other">Other</option>
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={newIncome.recurring}
                  onChange={(e) => setNewIncome({...newIncome, recurring: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="recurring">Recurring</label>
              </div>
              {newIncome.recurring && (
                <input
                  type="number"
                  placeholder="Day of month (1-31)"
                  min="1"
                  max="31"
                  value={newIncome.recurringDay}
                  onChange={(e) => setNewIncome({...newIncome, recurringDay: e.target.value})}
                  className="w-full p-3 bg-gray-700 rounded-lg text-white"
                />
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={createIncome}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
              >
                Add Income
              </button>
              <button
                onClick={() => setShowAddIncomeModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lending Modal */}
      {showAddLendingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Add Lending</h3>
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Amount"
                value={newLending.amount}
                onChange={(e) => setNewLending({...newLending, amount: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
              <input
                type="text"
                placeholder="Person Name"
                value={newLending.personName}
                onChange={(e) => setNewLending({...newLending, personName: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
              <input
                type="text"
                placeholder="Description"
                value={newLending.description}
                onChange={(e) => setNewLending({...newLending, description: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
              <input
                type="date"
                value={newLending.date}
                onChange={(e) => setNewLending({...newLending, date: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
              <input
                type="date"
                placeholder="Expected Return Date"
                value={newLending.expectedReturnDate}
                onChange={(e) => setNewLending({...newLending, expectedReturnDate: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={createLending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              >
                Add Lending
              </button>
              <button
                onClick={() => setShowAddLendingModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Borrowing Modal */}
      {showAddBorrowingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Add Borrowing</h3>
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Amount"
                value={newBorrowing.amount}
                onChange={(e) => setNewBorrowing({...newBorrowing, amount: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
              <input
                type="text"
                placeholder="Person Name"
                value={newBorrowing.personName}
                onChange={(e) => setNewBorrowing({...newBorrowing, personName: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
              <input
                type="text"
                placeholder="Description"
                value={newBorrowing.description}
                onChange={(e) => setNewBorrowing({...newBorrowing, description: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
              <input
                type="date"
                value={newBorrowing.date}
                onChange={(e) => setNewBorrowing({...newBorrowing, date: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
              <input
                type="date"
                placeholder="Expected Return Date"
                value={newBorrowing.expectedReturnDate}
                onChange={(e) => setNewBorrowing({...newBorrowing, expectedReturnDate: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={createBorrowing}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
              >
                Add Borrowing
              </button>
              <button
                onClick={() => setShowAddBorrowingModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Investment Modal */}
      {showAddInvestmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Add Investment</h3>
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Amount"
                value={newInvestment.amount}
                onChange={(e) => setNewInvestment({...newInvestment, amount: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
              <select
                value={newInvestment.type}
                onChange={(e) => setNewInvestment({...newInvestment, type: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              >
                <option value="mutual_fund">Mutual Fund</option>
                <option value="shares">Shares</option>
                <option value="courses">Courses</option>
              </select>
              <input
                type="text"
                placeholder="Description"
                value={newInvestment.description}
                onChange={(e) => setNewInvestment({...newInvestment, description: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
              <input
                type="date"
                value={newInvestment.date}
                onChange={(e) => setNewInvestment({...newInvestment, date: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
              <input
                type="number"
                placeholder="Expected Return (optional)"
                value={newInvestment.expectedReturn}
                onChange={(e) => setNewInvestment({...newInvestment, expectedReturn: e.target.value})}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={createInvestment}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg"
              >
                Add Investment
              </button>
              <button
                onClick={() => setShowAddInvestmentModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 