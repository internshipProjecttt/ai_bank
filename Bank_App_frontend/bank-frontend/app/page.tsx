'use client';
import React, { useState, useEffect } from 'react';
import { Search, Bell, TrendingUp, TrendingDown, DollarSign, CreditCard, Plus, Camera, Scan, User, BarChart3, Home, FileText, Lock, Settings, X, Recycle, Receipt, ReceiptEuroIcon, ReceiptTextIcon, ReceiptTurkishLira, LucideRecycle, RecycleIcon, Video } from 'lucide-react';
import {Info, HelpCircle } from 'lucide-react';
import OcrScanModal from './components/OcrScanModal';

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

interface Notification {
  message: string;
  createDate: string;
  category: string;
  isRead: boolean;
}

const categoryInfo: { [key: string]: { title: string; description: string; examples: string[] } } = {
  'Eko_Ulaşım': {
    title: '🚇 Yeşil Ulaşım',
    description: 'Çevre dostu ulaşım seçenekleri ile karbon ayak izinizi azaltın ve EkoBonus kazanın!',
    examples: ['Toplu taşıma kullanımı', 'Bisiklet paylaşım sistemleri', 'Elektrikli araç şarjı', 'Carpool/araç paylaşımı']
  },
  'Eko_Enerji': {
    title: '⚡ Enerji & Su Tasarrufu',
    description: 'Enerji ve su tasarrufu sağlayan akıllı harcamalarınızla bonus kazanın!',
    examples: ['Enerji tasarruflu cihazlar', 'LED ampul alımı', 'Akıllı termostat', 'Su tasarruflu ürünler']
  },
  'Eko_Tüketim': {
    title: '♻️ Bilinçli Tüketim',
    description: 'Sürdürülebilir ve çevre dostu ürün tercihlerinizle ödüllendirilirsiniz!',
    examples: ['Organik ürünler', 'Yerel üreticilerden alışveriş', 'Sıfır atık mağazaları', 'İkinci el ürünler']
  },
  'Eko_Sosyal': {
    title: '🌳 Çevresel Katkı',
    description: 'Çevre koruma ve sosyal sorumluluk projelerine katkılarınız ödüllendirilir!',
    examples: ['Ağaç dikimi bağışları', 'Çevre NGO\'larına destek', 'Geri dönüşüm projeleri', 'Temiz enerji yatırımları']
  },
  'Günlük Harcamalar': {
    title: '🍔 Günlük Harcamalar',
    description: 'Günlük yaşamınızdaki temel ihtiyaç harcamalarınız.',
    examples: ['Market alışverişi', 'Restoran ödemeleri', 'Kafe harcamaları', 'Küçük alışverişler']
  },
  'Alışveriş': {
    title: '🛍️ Alışveriş',
    description: 'Giyim, elektronik ve diğer ürün alışverişleriniz.',
    examples: ['Giyim mağazaları', 'Elektronik alışverişi', 'Online alışveriş', 'Aksesuar']
  },
  'Konut & Faturalar': {
    title: '🏠 Konut & Faturalar',
    description: 'Ev ile ilgili sabit giderler ve faturalar.',
    examples: ['Kira ödemeleri', 'Elektrik faturası', 'Su faturası', 'İnternet faturası']
  },
  'Seyahat': {
    title: '✈️ Seyahat',
    description: 'Tatil ve seyahat harcamalarınız.',
    examples: ['Uçak bileti', 'Otel rezervasyonu', 'Tur paketleri', 'Vize işlemleri']
  },
  'Finans': {
    title: '💸 Finans',
    description: 'Finansal işlemler ve yatırımlar.',
    examples: ['Banka işlemleri', 'Yatırım', 'Sigorta ödemeleri', 'Kredi kartı ödemeleri']
  },
  'Diğer Harcamalar': {
    title: '📦 Diğer Harcamalar',
    description: 'Diğer kategorilere girmeyen harcamalar.',
    examples: ['Çeşitli harcamalar', 'Özel durumlar', 'Kategorize edilmemiş']
  }
};


export default function FinanceDashboard() {

  const [showOcrModal, setShowOcrModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tüm Kategoriler');
  const [showCategoryInfo, setShowCategoryInfo] = useState(false);
  const [selectedCategoryInfo, setSelectedCategoryInfo] = useState<string | null>(null);  
  const [stats, setStats]= useState<DashboardStats | null>(null);
  const [accountStats, setAccountStats] = useState<{ [key: number]: DashboardStats }>({});
  const [loading, setLoading]= useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [user, setUser] = useState<UserData>({
              userId: 0,
              name: 'User',
              email: '',
              accountCount: 0,
              accounts: []
    });

  useEffect(()=>{
    // Seçili account'ı belirle (ilk account varsayılan)
    if (user.accounts.length > 0 && selectedAccountId === null) {
      setSelectedAccountId(user.accounts[0].accountId);
    }
  }, [user.accounts, selectedAccountId]);

  useEffect(()=>{
    if (selectedAccountId === null) return;

    const fetchStats = async()=>{
      try{
        const response = await fetch(`http://localhost:5000/api/transaction/account/${selectedAccountId}/stats`);
        const data= await response.json();
        setStats(data);

      }catch(e){
        console.error("Error fetching dashboard stats: ", e);
      }finally{
        setLoading(false);
      }
    }
    fetchStats();
  }, [selectedAccountId]);

  useEffect(() => {
    fetch('http://localhost:5000/api/user/1/with-accounts')
      .then(res => {
      if (!res.ok) throw new Error("User API error");
        return res.json();
      })
      .then(async (data) => {
        console.log('API Response:', data);
        const accounts = data.accounts || data.Accounts || [];
        setUser({
          userId: data.userId || data.UserId || 0,
          name: data.name || data.Name || 'User',
          email: data.email || data.Email || '',
          accountCount: data.accountCount || data.AccountCount || 0,
          accounts: accounts
        });
        
        // Tüm accountlar için stats çek
        const statsMap: { [key: number]: DashboardStats } = {};
        for (const account of accounts) {
          try {
            const statsRes = await fetch(`http://localhost:5000/api/transaction/account/${account.accountId}/stats`);
            const statsData = await statsRes.json();
            statsMap[account.accountId] = statsData;
          } catch (err) {
            console.log(`Error fetching stats for account ${account.accountId}:`, err);
          }
        }
        setAccountStats(statsMap);
      })
      .catch(err => {
        console.log('User fetch error:', err);
      });
  }, []);
    useEffect(() => {
      if (selectedAccountId === null) return;

      // Yeni hesaba geçince hemen transactions'ı boşalt
      setTransactions([]);

      fetch(`http://localhost:5000/api/transaction/account/${selectedAccountId}`)
        .then(res => {
          if (!res.ok) throw new Error("API error: " + res.status);
          return res.json();
        })
        .then(data => {
          const categoryIcons: { [key: string]: { icon: string; color: string } } = {
            // 🟢 EcoBonus Kategorileri (Pozitif Davranışlar)
            'Eko_Ulaşım': { icon: '🚇', color: 'bg-green-100' },
            'Eko_Enerji': { icon: '⚡', color: 'bg-blue-100' },
            'Eko_Tüketim': { icon: '♻️', color: 'bg-emerald-100' },
            'Eko_Sosyal': { icon: '🌳', color: 'bg-lime-100' },

            // ⚪ Genel Harcama Kategorileri
            'Günlük Harcamalar': { icon: '🍔', color: 'bg-yellow-100' },
            'Alışveriş': { icon: '🛍️', color: 'bg-pink-100' },
            'Konut & Faturalar': { icon: '🏠', color: 'bg-orange-100' },
            'Seyahat': { icon: '✈️', color: 'bg-sky-100' },
            'Finans': { icon: '💸', color: 'bg-purple-100' },
            'Diğer Harcamalar': { icon: '📦', color: 'bg-gray-100' },
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
            };
          });
          setTransactions(mapped);
          setLoading(false);   // burası önemli
        })
        .catch(err => {
          console.log(err);
          setLoading(false);   // hata olsa bile loading bitsin
        });
      },[selectedAccountId]);
    useEffect(() => {
      const fetchNotifications = async () => {
        try {
          const userId = 1; // Gerçek uygulamada auth'dan gelecek
          const response = await fetch(`http://localhost:5000/api/Notification/${userId}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch notifications');
          }
          
          const data = await response.json();
          setNotifications(data);
          
          // Okunmamış bildirim sayısını hesapla
          const unreadCount = data.filter((n: Notification) => !n.isRead).length;
          setNotificationCount(unreadCount);
        } catch (error) {
          console.error('Error fetching notifications:', error);
          setNotifications([]);
        }
      };

      fetchNotifications();

      // Her 30 saniyede bir kontrol et
      const interval = setInterval(fetchNotifications, 30000);

      return () => clearInterval(interval);
  }, []);

  const filteredTransactions = selectedCategory === 'Tüm Kategoriler'
    ? transactions
    : transactions.filter(tx => tx.category === selectedCategory);
    
    const displayedTransactions = showAllTransactions
    ? filteredTransactions
    : filteredTransactions.slice(0, 5);
    
    const handleCategoryInfoClick = (category: string) => {
      setSelectedCategoryInfo(category);
      setShowCategoryInfo(true);
    };

   function getUserID(){
      return localStorage.getItem('userID') || 'default-user-id';
    }
    

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {/* <div className="w-16 bg-indigo-700 flex flex-col items-center py-6 space-y-8"> */}


        {/* <div className="flex-1 flex flex-col space-y-6">
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
        </div> */}

        {/* <button className="p-3 text-white hover:bg-indigo-600 rounded-lg">
          <Settings size={20} />
        </button> */}

        {/* <button onClick={() => setShowUserModal(true)}
                className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center hover:bg-indigo-400 transition-colors">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  alt="User"
                  className="rounded-full"
                />
        </button> */}
      {/* </div> */}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {showUserModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowUserModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-96 p-6 relative max-h-[90vh] overflow-y-auto"
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
                            ${(accountStats[account.accountId]?.totalBalance || account.balance).toLocaleString('tr-TR', {
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
                          <span className="text-sm text-gray-600">Bonus Puanlar</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setSelectedAccountId(account.accountId);
                          setShowUserModal(false);
                        }}
                        className="w-full mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium text-center py-2 hover:bg-indigo-50 rounded transition-colors"
                      >
                        {selectedAccountId === account.accountId ? '✓ Seçildi' : 'Detayları Görüntüle →'}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard size={48} className="mx-auto mb-3 opacity-30" />
                    <p>Hesap bulunamadı</p>
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
      {showNotificationModal && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
          onClick={() => setShowNotificationModal(false)}
        >
          <div
            className='bg-white rounded-2xl shadow-2xl w-[500px] max-h-[600px] relative'
            onClick={(e)=> e.stopPropagation()}
          >
            <button
              onClick={() => setShowNotificationModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-600 z-10"
            >
              <X size={20} />
            </button>

            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Bildirimler</h2>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[450px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Bell size={48} className="mb-4 opacity-30" />
                  <p className="text-lg">Henüz bildirim yok</p>
                  <p className="text-sm">Yeni işlemler yaptığınızda burada görünecek</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification, index) => {
                    const categoryEmojis: { [key: string]: string } = {
                      'Başarılar': '🎉',
                      'Eko_Ulqşım': '🚇',
                      'Eko_Enerji': '⚡',
                      'Eko_Tüketim': '♻️',
                      'Eko_Sosyal': '🌳',
                      'Bilgi': 'ℹ️',
                      'Uyarı': '⚠️',
                    };

                    const emoji = categoryEmojis[notification.category] || '📌';

                    return (
                      <div
                        key={index}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                            {emoji}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium mb-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>
                                {new Date(notification.createDate).toLocaleDateString('tr-TR', {
                                  day: 'numeric',
                                  month: 'long',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              <span>•</span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-medium">
                                {notification.category}
                              </span>
                            </div>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold transition-colors"
                >
                  Kapat
                </button>
              </div>
            )}
          </div>
        </div>
      )
      }
      {showOcrModal && (
        <OcrScanModal
          isOpen={showOcrModal}
          onClose={() => {
            setShowOcrModal(false);
            window.location.reload(); // basit ama etkili
          }}
          accountId={selectedAccountId ?? 1}
        />
      )}
      {/* Category Info Modal */}
        {showCategoryInfo && selectedCategoryInfo && categoryInfo[selectedCategoryInfo] && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCategoryInfo(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-[500px] p-6 relative max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowCategoryInfo(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-600"
              >
                <X size={20} />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {categoryInfo[selectedCategoryInfo].title}
                </h2>
                <p className="text-gray-600">
                  {categoryInfo[selectedCategoryInfo].description}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  Örnek Harcamalar
                </h3>
                <ul className="space-y-2">
                  {categoryInfo[selectedCategoryInfo].examples.map((example, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedCategoryInfo.startsWith('Eko_') && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">🌟</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">EkoBonus Kazanın!</h4>
                      <p className="text-sm text-green-700">
                        Bu kategorideki harcamalarınız için ekstra bonus puan kazanırsınız. 
                        Çevre dostu seçimlerinizle hem dünyaya katkıda bulunur, hem de ödüllendirilirsiniz!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowCategoryInfo(false)}
                className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold"
              >
                Anladım
              </button>
            </div>
          </div>
        )}


        {/* Header */}
        <div className="bg-white border-b px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowUserModal(true)}
                className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center hover:bg-indigo-400 transition-colors"
              >
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  alt="User"
                  className="rounded-full w-10 h-10"
                />
              </button>

              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-sm text-gray-500">Hoş geldiniz, finanslarınızı yönetin!</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div> */}
              <button 
                onClick={() => setShowNotificationModal(true)}
                className="relative p-2 hover:bg-gray-100 rounded-lg"
              >
                <Bell size={20} />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {notificationCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 p-8">
          <div className="bg-white rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600" size={20} />
              </div>
              <span className={stats?.balanceChange && stats.balanceChange >= 0 ? "text-green-600" : "text-red-600"}>
                {stats?.balanceChange}%
              </span>
            </div>
            <p className="text-gray-500 text-sm">Toplam Bakiye</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalBalance}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={20} />
              </div>
              <span className={stats?.incomeChange && stats.incomeChange >= 0 ? "text-blue-600" : "text-red-600"}>
                {stats?.incomeChange}%
              </span>
            </div>
            <p className="text-gray-500 text-sm">Toplam Gelir</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalIncome}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-red-600" size={20} />
              </div>
              <span className={stats?.expensesChange && stats.expensesChange >= 0 ? "text-red-600" : "text-green-600"}>
                {stats?.expensesChange}%
              </span>
            </div>
            <p className="text-gray-500 text-sm">Toplam Gider</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalExpense}</p>
          </div>

         <div className="bg-white rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <span className={stats?.bonusChange && stats.bonusChange >= 0 ? "text-yellow-600" : "text-red-600"}>
                {stats?.bonusChange}%
              </span>
            </div>
            <p className="text-gray-500 text-sm">Bonus Puanlar</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalBonusPoints}</p>
          </div>
        </div>

        {/* Main Grid - LEFT: AI + Features, RIGHT: Recent Transactions */}
        <div className="grid grid-cols-3 gap-6 px-8 pb-8">
          {/* Left Column - AI Assistant, Face Recognition, Receipt Scanner, Spending */}
          <div className="col-span-1 space-y-6">
            {/* AI Assistant */}
            {/* <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">AI Asistanı</h3>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-6"> AI destekli analizler</p>
              <button className="w-full bg-white text-indigo-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Analizi Başlat
              </button>
            </div> */}

            {/* Face Recognition */}
            <div className="bg-white rounded-xl p-6 shadow-sm relative overflow-hidden">
              {/* <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div> */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Geri Dönüşüm</h3>
                <RecycleIcon className="text-green-600" size={20} />
              </div>
              <p className="text-sm text-gray-500 mb-6">Yeniden dönüştürülebilir atıklarınızı atarken video kaydedin ve bonus puan kazanın!</p>
              <button className="w-full border border-green-600 bg-transparent text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition flex items-center justify-center space-x-2">
                <Video size={18} />
                <span>Video Kaydet</span>
              </button>
            </div>

            {/* Receipt Scanner */}
            <div className="bg-white rounded-xl p-6 shadow-sm relative overflow-hidden">
              {/* <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div> */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Fiş Tarayıcı</h3>
                <ReceiptTextIcon className="text-green-600" size={20} />
              </div>
              <p className="text-sm text-gray-500 mb-6">Fişlerinizi yükleyin ve giderlerinizi bonusa dönüştürün!</p>
              <button
                onClick={() => setShowOcrModal(true)}  // ← sadece bu satır eklendi
                className="w-full border border-green-600 bg-transparent text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition flex items-center justify-center space-x-2">
                <Camera size={18} />
                <span>Fiş Yükle</span>
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
                <h3 className="text-lg font-semibold text-gray-900">Son İşlemler</h3>
                <div className="flex items-center space-x-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Tüm Kategoriler</option>
                    <optgroup label="EkoBonus Kategorileri">
                      <option>Eko_Ulaşım</option>
                      <option>Eko_Enerji</option>
                      <option>Eko_Tüketim</option>
                      <option>Eko_Sosyal</option>
                    </optgroup>
                    <optgroup label="Genel Kategoriler">
                      <option>Günlük Harcamlar</option>
                      <option>Alışveriş</option>
                      <option>Konut&Faturalar</option>
                      <option>Seyahat</option>
                      <option>Finans</option>
                      <option>Diğer</option>
                    </optgroup>
                  </select>
                  {/* Category Info Button */}
                  <button
                    onClick={() => {
                      if (selectedCategory !== 'Tüm Kategoriler') {
                        handleCategoryInfoClick(selectedCategory);
                      }
                    }}
                    disabled={selectedCategory === 'Tüm Kategoriler'}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedCategory === 'Tüm Kategoriler'
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-indigo-600 hover:bg-indigo-50'
                    }`}
                    title="Kategori hakkında bilgi"
                  >
                    <HelpCircle size={20} />
                  </button>
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
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{tx.name}</p>
                            <button
                              onClick={() => handleCategoryInfoClick(tx.category)}
                              className="text-gray-400 hover:text-indigo-600 transition-colors"
                              title="Kategori bilgisi"
                            >
                              <Info size={16} />  {/* ← BU EKSİKTİ */}
                            </button>
                          </div>
                          <p className="text-sm text-gray-500">{tx.category} • {tx.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                          {tx.amount > 0 ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                        </p>
                        <p className={`text-xs ${tx.status === 'Pending' ? 'text-yellow-600' : 'text-green-600'}`}>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">Hiç işlem bulunamadı</p>
                )}
              </div>

              {!showAllTransactions && filteredTransactions.length > 5 && (
                <button
                  onClick={() => setShowAllTransactions(true)}
                  className="w-full mt-4 text-indigo-600 font-semibold py-2 hover:bg-indigo-50 rounded-lg transition"
                >
                  Tüm İşlemleri Görüntüle →
                </button>
              )}
              {showAllTransactions && (
                <button
                  onClick={() => setShowAllTransactions(false)}
                  className="w-full mt-4 text-indigo-600 font-semibold py-2 hover:bg-indigo-50 rounded-lg transition"
                >
                  Daha Az Göster →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}