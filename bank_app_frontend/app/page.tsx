"use client";
import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Camera,
  Upload,
  BarChart3,
  CreditCard,
  Receipt,
  Search,
  Bell,
  ChevronRight,
  Sparkles,
  Fingerprint,
  ScanLine
} from 'lucide-react';

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const stats = [
    { 
      title: 'Total Balance', 
      value: '$24,567.89', 
      change: '+12.5%', 
      trending: 'up',
      icon: DollarSign,
      color: 'bg-emerald-100 text-emerald-600'
    },
    { 
      title: 'Income', 
      value: '$12,450.00', 
      change: '+8.2%', 
      trending: 'up',
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      title: 'Expenses', 
      value: '$8,234.50', 
      change: '-3%', 
      trending: 'down',
      icon: TrendingDown,
      color: 'bg-red-100 text-red-600'
    },
    { 
      title: 'Transactions', 
      value: 'This Month', 
      change: '156', 
      trending: 'neutral',
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const transactions = [
    { 
      id: 1,
      name: 'Restaurant Dinner', 
      category: 'Food & Dining',
      time: 'Today, 7:32 PM',
      amount: -45.50,
      status: 'Pending',
      icon: '🍽️',
      bgColor: 'bg-orange-100'
    },
    { 
      id: 2,
      name: 'Salary Payment', 
      category: 'Income',
      time: 'Today, 9:00 AM',
      amount: 3500.00,
      status: 'Completed',
      icon: '💼',
      bgColor: 'bg-green-100'
    },
    { 
      id: 3,
      name: 'Online Shopping', 
      category: 'Shopping',
      time: 'Yesterday, 3:15 PM',
      amount: -129.99,
      status: 'Completed',
      icon: '🛍️',
      bgColor: 'bg-purple-100'
    },
    { 
      id: 4,
      name: 'Public Transport', 
      category: 'Transport',
      time: 'Yesterday, 8:42 AM',
      amount: -12.50,
      status: 'Completed',
      icon: '🚇',
      bgColor: 'bg-orange-100'
    },
    { 
      id: 5,
      name: 'Movie Tickets', 
      category: 'Entertainment',
      time: '2 days ago',
      amount: -28.00,
      status: 'Completed',
      icon: '🎬',
      bgColor: 'bg-pink-100'
    },
    { 
      id: 6,
      name: 'Gas Station', 
      category: 'Transport',
      time: '3 days ago',
      amount: -65.00,
      status: 'Completed',
      icon: '⛽',
      bgColor: 'bg-red-100'
    }
  ];

  const spendingCategories = [
    { name: 'Food & Dining', amount: 1245, percentage: 65, color: 'bg-blue-500' },
    { name: 'Shopping', amount: 890, percentage: 45, color: 'bg-purple-500' },
    { name: 'Transport', amount: 567, percentage: 30, color: 'bg-pink-500' },
    { name: 'Entertainment', amount: 432, percentage: 22, color: 'bg-orange-500' }
  ];

  const quickActions = [
    { name: 'Scan Receipt', icon: Camera, color: 'bg-blue-500' },
    { name: 'Add Label', icon: CreditCard, color: 'bg-emerald-500' },
    { name: 'Face ID', icon: Fingerprint, color: 'bg-purple-500' },
    { name: 'AI Insights', icon: BarChart3, color: 'bg-indigo-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-16 bg-indigo-900 flex flex-col items-center py-6 space-y-8">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-indigo-900">
          F
        </div>
        <div className="flex-1 flex flex-col space-y-6">
          <button className="text-white/60 hover:text-white transition">
            <BarChart3 size={24} />
          </button>
          <button className="text-white/60 hover:text-white transition">
            <CreditCard size={24} />
          </button>
          <button className="text-white/60 hover:text-white transition">
            <Receipt size={24} />
          </button>
          <button className="text-white/60 hover:text-white transition">
            <Calendar size={24} />
          </button>
          <button className="text-white/60 hover:text-white transition">
            <Sparkles size={24} />
          </button>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full"></div>
      </div>

      {/* Main Content */}
      <div className="ml-16 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, manage your finances</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
              <Bell size={24} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                {stat.trending !== 'neutral' && (
                  <span className={`text-sm font-medium ${
                    stat.trending === 'up' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              {stat.trending === 'neutral' && (
                <p className="text-sm text-gray-600 mt-1">{stat.change}</p>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="col-span-2 space-y-6">
            {/* AI Assistant */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">AI Assistant</h3>
                  <p className="text-indigo-100 text-sm">
                    Analyze your spending patterns with AI-powered insights
                  </p>
                </div>
                <Sparkles size={24} />
              </div>
              <button className="w-full bg-white text-indigo-600 font-semibold py-3 rounded-lg hover:bg-indigo-50 transition">
                Start Analysis
              </button>
            </div>

            {/* Face Recognition */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Face Recognition</h3>
                <Fingerprint className="text-indigo-600" size={24} />
              </div>
              <p className="text-gray-500 text-sm mb-4">Secure login with facial recognition</p>
              <button className="w-full border-2 border-indigo-600 text-indigo-600 font-semibold py-3 rounded-lg hover:bg-indigo-50 transition">
                Setup Face ID
              </button>
            </div>

            {/* Receipt Scanner */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Receipt Scanner</h3>
                <Camera className="text-emerald-600" size={24} />
              </div>
              <p className="text-gray-500 text-sm mb-4">Upload and categorize receipts automatically</p>
              <button className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                <Upload size={20} />
                Upload Receipt
              </button>
            </div>

            {/* Spending by Category */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Spending by Category</h3>
              <div className="space-y-4">
                {spendingCategories.map((category, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-medium">{category.name}</span>
                      <span className="text-gray-900 font-bold">${category.amount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${category.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <button key={index} className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition">
                    <div className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center text-white`}>
                      <action.icon size={24} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{action.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Recent Transactions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
              <div className="flex gap-2">
                <select 
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option>All Categories</option>
                  <option>Food & Dining</option>
                  <option>Shopping</option>
                  <option>Transport</option>
                </select>
                <button className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
                  + New Transaction
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                  <div className={`w-12 h-12 ${transaction.bgColor} rounded-lg flex items-center justify-center text-2xl`}>
                    {transaction.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{transaction.name}</p>
                    <p className="text-xs text-gray-500">{transaction.category} • {transaction.time}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.amount > 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      transaction.status === 'Pending' 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 text-indigo-600 font-semibold py-2 flex items-center justify-center gap-2 hover:bg-indigo-50 rounded-lg transition">
              View All Transactions
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}