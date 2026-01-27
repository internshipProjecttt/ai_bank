'use client';
import React, { useState, useEffect } from 'react';
import { Search, Bell, TrendingUp, TrendingDown, DollarSign, CreditCard, Plus, Camera, Scan, User, BarChart3, Home, FileText, Lock, Settings } from 'lucide-react';


type Transaction = {
  date: string | number | Date;
  id: number;
  amount: number;
  category: string;
  type: string;
  color?: string;
  icon?: string;
  name?: string;
  time?: string;
  status?: string;
};

export default function FinanceDashboard() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('User');

useEffect(() => {
  // Kullanıcı bilgisini çek
  fetch('/api/user/1')  // şimdilik ID=1, ileride login'den gelecek
    .then(res => {
      if (!res.ok) throw new Error("User API error");
      return res.json();
    })
    .then(data => {
      setUserName(data.name || data.Name); // C#'ta Name büyük harfle olabilir
    })
    .catch(err => {
      console.log('User fetch error:', err);
    });
}, []);

useEffect(() => {
  fetch('/api/transaction')
    .then(res => {
      if (!res.ok) throw new Error("API error: " + res.status);
      return res.json();
    })
    .then(data => {
      const categoryIcons: { [key: string]: { icon: string; color: string } } = {
        'Food & Dining': { icon: '🍔', color: 'bg-yellow-100' },
        'Shopping': { icon: '🛍️', color: 'bg-pink-100' },
        'Transport': { icon: '🚗', color: 'bg-blue-100' },
        'Entertainment': { icon: '🎬', color: 'bg-purple-100' },
        'Utilities': { icon: '💡', color: 'bg-green-100' },
      };

      const mapped = data.map((item: any) => {
        const categoryInfo = categoryIcons[item.category] || { icon: '📌', color: 'bg-gray-100' };
        return {
          id: item.transactionId,
          amount: item.type === 'expense' ? -Math.abs(item.amount) : item.amount,
          category: item.category,
          type: item.type,
          date: item.transactionDate,
          name: item.category,
          time: new Date(item.transactionDate).toLocaleDateString(),
          icon: categoryInfo.icon,
          color: categoryInfo.color,
          status: 'Completed',
        };
      });
      setTransactions(mapped);
      setLoading(false);   // burası önemli
    })
    .catch(err => {
      console.log(err);
      setLoading(false);   // hata olsa bile loading bitsin
    });
}, []);


  const filteredTransactions = selectedCategory === 'All Categories'
    ? transactions
    : transactions.filter(tx => tx.category === selectedCategory);


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
              <h1 className="text-2xl font-bold text-gray-900">{userName}</h1>
              <p className="text-sm text-gray-500">Welcome back, manage your finances!</p>
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
            <p className="text-2xl font-bold text-gray-900">$24,567.89</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={20} />
              </div>
              <span className="text-blue-600 text-sm font-semibold">+8.2%</span>
            </div>
            <p className="text-gray-500 text-sm">Income</p>
            <p className="text-2xl font-bold text-gray-900">$12,450.00</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-red-600" size={20} />
              </div>
              <span className="text-red-600 text-sm font-semibold">-3.1%</span>
            </div>
            <p className="text-gray-500 text-sm">Expenses</p>
            <p className="text-2xl font-bold text-gray-900">$8,234.50</p>
          </div>

         <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <span className="text-yellow-600 text-sm font-semibold">+250</span>
            </div>
            <p className="text-gray-500 text-sm">Bonus Points</p>
            <p className="text-2xl font-bold text-gray-900">3,245</p>
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

            {/* Spending by Category
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
            */}
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
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
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
                          {tx.amount > 0 ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                        </p>
                        <p className={`text-xs ${tx.status === 'Pending' ? 'text-yellow-600' : 'text-green-600'}`}>
                          {tx.status}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No transactions found</p>
                )}
              </div>

              <button className="w-full mt-4 text-indigo-600 font-semibold py-2 hover:bg-indigo-50 rounded-lg transition">
                View All Transactions →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}