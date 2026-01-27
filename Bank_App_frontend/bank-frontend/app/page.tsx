'use client';
import React, { useState, useEffect } from 'react';
import { Search, Bell, TrendingUp, TrendingDown, DollarSign, CreditCard, Plus, Camera, Scan, User, BarChart3, Home, FileText, Lock, Settings } from 'lucide-react';

interface DashboardStats{
  accountId: number;
  totalBalance: number;
  balanceChange: number;
  totalIncome: number;
  incomeChange: number;
  totalExpense: number;
  expensesChange: number;
  bonusPoints: number;
  bonusChange: number;  
}

export default function FinanceDashboard() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [stats, setStats]= useState<DashboardStats | null>(null);
  const [loading, setLoading]= useState(true);

  useEffect(()=>{
    const fetchStates = async()=>{
      try{
        const acc_id= 1;
        const response = await fetch(`http://localhost:5000/api/transaction/account/${acc_id}/stats`);
        const data= await response.json();
        setStats(data);

      }catch(e){
        console.error("Error fetching dashboard stats: ", e);        
      }finally{
        setLoading(false);
      }
    }
    fetchStates();
  }, []);

  function getUserID(){
    return localStorage.getItem('userID') || 'default-user-id';
  }

  const transactions = [
    { id: 1, icon: '🍴', name: 'Restaurant Dinner', category: 'Food & Dining', time: 'Today, 7:32 PM', amount: -45.50, status: 'Pending', color: 'bg-blue-100' },
    { id: 2, icon: '💼', name: 'Salary Payment', category: 'Income', time: 'Today, 8:00 AM', amount: 3500.00, status: 'Completed', color: 'bg-green-100' },
    { id: 3, icon: '🛒', name: 'Online Shopping', category: 'Shopping', time: 'Yesterday, 3:15 PM', amount: -129.99, status: 'Completed', color: 'bg-purple-100' },
    { id: 4, icon: '🚌', name: 'Public Transport', category: 'Transport', time: 'Yesterday, 8:42 AM', amount: -12.50, status: 'Completed', color: 'bg-orange-100' },
    { id: 5, icon: '🎬', name: 'Movie Tickets', category: 'Entertainment', time: '2 days ago', amount: -28.00, status: 'Completed', color: 'bg-pink-100' },
    { id: 6, icon: '⛽', name: 'Gas Station', category: 'Transport', time: '3 days ago', amount: -65.00, status: 'Completed', color: 'bg-red-100' }
  ];

  const spendingData = [
    { category: 'Food & Dining', amount: 1245, percentage: 70, color: 'bg-blue-500' },
    { category: 'Shopping', amount: 890, percentage: 50, color: 'bg-purple-500' },
    { category: 'Transport', amount: 567, percentage: 32, color: 'bg-red-500' },
    { category: 'Entertainment', amount: 432, percentage: 24, color: 'bg-pink-500' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-16 bg-indigo-700 flex flex-col items-center py-6 space-y-8">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-indigo-700">
          F
        </div>
        
        <div className="flex-1 flex flex-col space-y-6">
          <button className="p-3 text-white hover:bg-indigo-600 rounded-lg">
            <Home size={20} />
          </button>
          <button className="p-3 text-white hover:bg-indigo-600 rounded-lg">
            <BarChart3 size={20} />
          </button>
          <button className="p-3 text-white hover:bg-indigo-600 rounded-lg">
            <CreditCard size={20} />
          </button>
          <button className="p-3 text-white hover:bg-indigo-600 rounded-lg">
            <FileText size={20} />
          </button>
          <button className="p-3 text-white hover:bg-indigo-600 rounded-lg">
            <Lock size={20} />
          </button>
          <button className="p-3 text-white hover:bg-indigo-600 rounded-lg">
            <Scan size={20} />
          </button>
        </div>

        <button className="p-3 text-white hover:bg-indigo-600 rounded-lg">
          <Settings size={20} />
        </button>
        
        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="rounded-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, manage your finances</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 p-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600" size={20} />
              </div>
              <span className="text-green-600 text-sm font-semibold">+12.5%</span>
            </div>
            <p className="text-gray-500 text-sm">Total Balance</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalBalance}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={20} />
              </div>
              <span className="text-blue-600 text-sm font-semibold">+8.2%</span>
            </div>
            <p className="text-gray-500 text-sm">Income</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalIncome}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-red-600" size={20} />
              </div>
              <span className="text-red-600 text-sm font-semibold">-3.1%</span>
            </div>
            <p className="text-gray-500 text-sm">Expenses</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalExpense}</p>
          </div>

         <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <span className="text-yellow-600 text-sm font-semibold">+250</span>
            </div>
            <p className="text-gray-500 text-sm">Bonus Points</p>
            <p className="text-2xl font-bold text-gray-900">{3000}</p>
          </div>
        </div>

        {/* Main Grid - LEFT: AI + Features, RIGHT: Recent Transactions */}
        <div className="grid grid-cols-3 gap-6 px-8 pb-8">
          {/* Left Column - AI Assistant, Face Recognition, Receipt Scanner, Spending */}
          <div className="col-span-1 space-y-6">
            {/* AI Assistant */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">AI Assistant</h3>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-6">Analyze your spending patterns with AI-powered insights</p>
              <button className="w-full bg-white text-indigo-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Start Analysis
              </button>
            </div>

            {/* Face Recognition */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Recycling</h3>
                <Camera className="text-green-600" size={20} />
              </div>
              <p className="text-sm text-gray-500 mb-6">Record yourself while throwing recyclables</p>
              <button className="w-full border border-green-600 bg-transparent text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition flex items-center justify-center space-x-2">
                <Camera size={18} />
                <span>Record Video</span>
              </button>
            </div>

            {/* Receipt Scanner */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Receipt Scanner</h3>
                <Camera className="text-green-600" size={20} />
              </div>
              <p className="text-sm text-gray-500 mb-6">Upload receipts and track expenses automatically</p>
              <button className="w-full border border-green-600 bg-transparent text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition flex items-center justify-center space-x-2">
                <Camera size={18} />
                <span>Upload Receipt</span>
              </button>
            </div>

            {/* Spending by Category */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending by Category</h3>
              <div className="space-y-5">
                {spendingData.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <span className="text-sm font-semibold text-gray-900">${item.amount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`${item.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Recent Transactions & Quick Actions */}
          <div className="col-span-2 space-y-6">
            {/* Recent Transactions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                <div className="flex items-center space-x-3">
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>All Categories</option>
                    <option>Food & Dining</option>
                    <option>Shopping</option>
                    <option>Transport</option>
                  </select>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center space-x-2">
                    <Plus size={16} />
                    <span>New Transaction</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${tx.color} rounded-lg flex items-center justify-center text-xl`}>
                        {tx.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{tx.name}</p>
                        <p className="text-sm text-gray-500">{tx.category} • {tx.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                      </p>
                      <p className={`text-xs ${tx.status === 'Pending' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {tx.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 text-indigo-600 font-semibold py-2 hover:bg-indigo-50 rounded-lg transition">
                View All Transactions →
              </button>
            </div>

            {/* Quick Actions }
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-4 gap-4">
                <button className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <Camera className="text-blue-600" size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Scan Receipt</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl hover:border-green-600 hover:bg-green-50 transition">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Plus className="text-green-600" size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Add Label</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl hover:border-purple-600 hover:bg-purple-50 transition">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <User className="text-purple-600" size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Face ID</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                    <BarChart3 className="text-indigo-600" size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">AI Insights</span>
                </button>
              </div>
            </div>*/}
          </div>
        </div>
      </div>
    </div>
  );
}