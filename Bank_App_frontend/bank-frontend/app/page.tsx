'use client';
import React, { useState, useEffect } from 'react';
import { Search, Bell, TrendingUp, TrendingDown, DollarSign, CreditCard, Plus, Camera, Scan, User, BarChart3, Home, FileText, Lock, Settings, X } from 'lucide-react';

interface DashboardStats{
  accountId: number;
  totalBalance: number;
  balanceChange: number;
  totalIncome: number;
  incomeChange: number;
  totalExpense: number;
  expensesChange: number;
  totalBonusPoints: number;
  bonusChange: number;  
}
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
interface Account {
  accountId: number;
  accountNumber: string;
  accountName?: string;
  balance: number;
  bonusPoints: number;
}
interface UserData {
  userId: number;
  name: string;
  email: string;
  accountCount: number;
  accounts: Account[]; 
}

export default function FinanceDashboard() {
  
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [stats, setStats]= useState<DashboardStats | null>(null);
  const [loading, setLoading]= useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [user, setUser] = useState<UserData>({
              userId: 0,
              name: 'User',
              email: '',
              accountCount: 0,
              accounts: []
    });

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

    useEffect(() => {
    fetch('http://localhost:5000/api/user/1/with-accounts')
      .then(res => {
        if (!res.ok) throw new Error("User API error");
        return res.json();
      })
      .then(data => {
        console.log('API Response:', data);
        setUser({
          userId: data.userId || data.UserId || 0,
          name: data.name || data.Name || 'User',
          email: data.email || data.Email || '',
          accountCount: data.accountCount || data.AccountCount || 0,
          accounts: data.accounts || data.Accounts || []
        });
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
    },[]);

      function getUserID(){
        return localStorage.getItem('userID') || 'default-user-id';
      }



  const filteredTransactions = selectedCategory === 'All Categories'
    ? transactions
    : transactions.filter(tx => tx.category === selectedCategory);

  const displayedTransactions = showAllTransactions 
    ? filteredTransactions 
    : filteredTransactions.slice(0, 5);


  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-16 bg-indigo-700 flex flex-col items-center py-6 space-y-8">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-indigo-700">
          <button
            onClick={() => setShowUserModal(true)}
            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-indigo-700 hover:bg-indigo-50 transaction-colors"
          >
            {user.name.charAt(0).toUpperCase()}
            </button>
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

        <button onClick={() => setShowUserModal(true)}
                className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center hover:bg-indigo-400 transition-colors">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                  alt="User" 
                  className="rounded-full" 
                />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {showUserModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowUserModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-96 p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowUserModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-600"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mb-4">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                  alt="User" 
                  className="rounded-full" 
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <User size={16} className="text-indigo-600" />
                  </div>
                  <p className="text-sm text-gray-500">İsim</p>
                </div>
                <p className="text-gray-800 font-medium ml-11">{user.name}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600">📧</span>
                  </div>
                  <p className="text-sm text-gray-500">E-posta</p>
                </div>
                <p className="text-gray-800 font-medium ml-11">{user.email}</p>
              </div>

              
            </div>
              {/* Hesaplar Bölümü */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Hesaplarım</h3>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                  {user.accountCount} Hesap
                </span>
              </div>

              {/* Hesap Listesi */}
              <div className="space-y-3">
                {user.accounts.length > 0 ? (
                  user.accounts.map((account) => (
                    <div 
                      key={account.accountId}
                      className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <CreditCard size={20} className="text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{account.accountName || `Account ${account.accountId}`}</p>
                            <p className="text-xs text-gray-500">ID: {account.accountId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-800">
                            ₺{account.balance.toLocaleString('tr-TR', { 
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2 
                            })}
                          </p>
                          <p className="text-xs text-gray-500">TRY</p>
                        </div>
                      </div>
                      
                      {/* Bonus Puanlar */}
                      <div className="flex items-center justify-between pt-3 border-t border-indigo-200">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-sm text-gray-600">Bonus Puan</span>
                        </div>
                        <span className="text-sm font-semibold text-indigo-600">
                          {account.bonusPoints} puan
                        </span>
                      </div>
                      
                      <button className="w-full mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium text-center py-2 hover:bg-indigo-50 rounded transition-colors">
                        Detayları Gör →
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard size={48} className="mx-auto mb-3 opacity-30" />
                    <p>Henüz hesap bulunmuyor</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700">
                Profili Düzenle
              </button>
              <button 
                onClick={() => setShowUserModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}


        {/* Header */}
        <div className="bg-white border-b px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
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
              <span className={stats?.balanceChange && stats.balanceChange >= 0 ? "text-green-600" : "text-red-600"}>
                {stats?.balanceChange && stats.balanceChange >= 0 ? "+" : "-"}{stats?.balanceChange}%
              </span>
            </div>
            <p className="text-gray-500 text-sm">Total Balance</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalBalance}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={20} />
              </div>
              <span className={stats?.incomeChange && stats.incomeChange >= 0 ? "text-blue-600" : "text-red-600"}>
                {stats?.incomeChange && stats.incomeChange >= 0 ? "+" : "-"}{stats?.incomeChange}%
              </span>
            </div>
            <p className="text-gray-500 text-sm">Income</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalIncome}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-red-600" size={20} />
              </div>
              <span className={stats?.expensesChange && stats.expensesChange >= 0 ? "text-red-600" : "text-green-600"}>
                {stats?.expensesChange && stats.expensesChange >= 0 ? "+" : "-"}{stats?.expensesChange}%
              </span>
            </div>
            <p className="text-gray-500 text-sm">Expenses</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalExpense}</p>
          </div>

         <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <span className={stats?.bonusChange && stats.bonusChange >= 0 ? "text-yellow-600" : "text-red-600"}>
                {stats?.bonusChange && stats.bonusChange >= 0 ? "+" : "-"}{stats?.bonusChange}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Bonus Points</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalBonusPoints}</p>
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
                </div>
              </div>

              <div className="space-y-4">
                {displayedTransactions.length > 0 ? (
                  displayedTransactions.map((tx) => (
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

              {!showAllTransactions && filteredTransactions.length > 5 && (
                <button 
                  onClick={() => setShowAllTransactions(true)}
                  className="w-full mt-4 text-indigo-600 font-semibold py-2 hover:bg-indigo-50 rounded-lg transition"
                >
                  View All Transactions →
                </button>
              )}
              {showAllTransactions && (
                <button 
                  onClick={() => setShowAllTransactions(false)}
                  className="w-full mt-4 text-indigo-600 font-semibold py-2 hover:bg-indigo-50 rounded-lg transition"
                >
                  Show Less ↑
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}