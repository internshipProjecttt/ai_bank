import React, { useState } from 'react';
import { Camera, Upload, X, CheckCircle, AlertCircle, Loader, Sparkles, TrendingUp } from 'lucide-react';

interface RecyclingBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccountId: number;
}

const RecyclingBonusModal: React.FC<RecyclingBonusModalProps> = ({ isOpen, onClose, userAccountId }) => {
  const [step, setStep] = useState(1);
  const [binImage, setBinImage] = useState<File | null>(null);
  const [binImagePreview, setBinImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    bottleCount: number;
    earnedPoints: number;
    totalBonusPoints: number;
    message: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleBinImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBinImage(file);
      setError('');
      
      // Preview oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setBinImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Backend'e fotoğraf gönder ve doğrula
      setIsVerifying(true);
      try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('http://localhost:5000/api/Recycle/check-recycle-bin', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Sunucu hatası oluştu');
        }
        
        const data = await response.json();
        console.log('Geri dönüşüm kutusu kontrol sonucu:', data);
        
        if (data.isRecycleBin) {
          setStep(2);
          setError('');
        } else {
          setError(data.message || 'Geri dönüşüm kutusu tespit edilemedi. Lütfen tekrar deneyiniz.');
          setBinImage(null);
          setBinImagePreview(null);
        }
      } catch (err) {
        console.error('Hata:', err);
        setError('Bir hata oluştu. Lütfen tekrar deneyiniz.');
        setBinImage(null);
        setBinImagePreview(null);
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setError('');
      
      // Preview oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Video işleme
      setIsProcessing(true);
      try {
        const formData = new FormData();
        formData.append('video', file);
        formData.append('userAccountId', userAccountId.toString());
        
        const response = await fetch('http://localhost:5000/api/Recycle/count-bottles', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Video işleme hatası');
        }
        
        const data = await response.json();
        console.log('Şişe sayma sonucu:', data);
        
        setResult({
          bottleCount: data.bottleCount,
          earnedPoints: data.earnedPoints,
          totalBonusPoints: data.totalBonusPoints,
          message: data.message
        });
        setStep(3);
      } catch (err) {
        console.error('Video işleme hatası:', err);
        setError('Video işlenirken bir hata oluştu. Lütfen tekrar deneyiniz.');
        setVideoFile(null);
        setVideoPreview(null);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setBinImage(null);
    setBinImagePreview(null);
    setVideoFile(null);
    setVideoPreview(null);
    setError('');
    setResult(null);
    setIsVerifying(false);
    setIsProcessing(false);
    onClose();
  };

  const retryBinPhoto = () => {
    setBinImage(null);
    setBinImagePreview(null);
    setError('');
  };

  const retryVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white p-6 rounded-t-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles size={28} className="animate-pulse" />
                Geri Dönüşüm Bonusu
              </h2>
              <p className="text-green-50 text-sm mt-1">Adım {step} / 3</p>
            </div>
            <button
              onClick={resetAndClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all hover:rotate-90 duration-300"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                  step >= stepNum ? 'bg-white scale-105' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Bin Verification */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mb-4 shadow-md">
                  <Camera className="text-green-600" size={36} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Geri Dönüşüm Kutusunu Doğrula
                </h3>
                <p className="text-gray-600 text-sm">
                  Lütfen geri dönüşüm kutusunun fotoğrafını çekin veya yükleyin
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 hover:bg-green-50/30 transition-all duration-300 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleBinImageUpload}
                  className="hidden"
                  id="bin-image-upload"
                  disabled={isVerifying}
                />
                <label
                  htmlFor="bin-image-upload"
                  className="cursor-pointer block"
                >
                  {binImagePreview ? (
                    <div className="space-y-3">
                      <img 
                        src={binImagePreview} 
                        alt="Geri dönüşüm kutusu" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <CheckCircle className="mx-auto text-green-600" size={48} />
                      <p className="font-semibold text-gray-900">Fotoğraf yüklendi</p>
                      <p className="text-sm text-gray-500">{binImage?.name}</p>
                      {!isVerifying && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            retryBinPhoto();
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Farklı fotoğraf seç
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="mx-auto text-gray-400" size={56} />
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">
                          Fotoğraf yüklemek için tıklayın
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          veya kamera ile çekin
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <Camera size={14} />
                        <span>JPG, PNG formatları desteklenir</span>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {isVerifying && (
                <div className="flex items-center justify-center gap-3 text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 py-4 rounded-xl border border-green-200 shadow-sm animate-pulse">
                  <Loader className="animate-spin" size={22} />
                  <span className="font-semibold">Geri dönüşüm kutusu doğrulanıyor...</span>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 text-red-700 bg-red-50 p-4 rounded-xl border border-red-200 animate-shake">
                  <AlertCircle size={22} className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{error}</p>
                    <button
                      onClick={retryBinPhoto}
                      className="text-sm text-red-600 hover:text-red-700 font-medium mt-2 underline"
                    >
                      Tekrar dene
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Video Upload */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mb-4 shadow-md">
                  <Camera className="text-green-600" size={36} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Geri Dönüşüm Videosu
                </h3>
                <p className="text-gray-600 text-sm">
                  Atıkları geri dönüşüm kutusuna atarken video çekin
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={24} />
                  <div>
                    <p className="font-bold text-green-900">Geri dönüşüm kutusu doğrulandı! ✓</p>
                    <p className="text-sm text-green-700 mt-1">
                      Şimdi videoyu yükleyebilirsiniz
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 hover:bg-green-50/30 transition-all duration-300 cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  capture="environment"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer block"
                >
                  {videoPreview ? (
                    <div className="space-y-3">
                      <video 
                        src={videoPreview} 
                        className="w-full h-48 object-cover rounded-lg bg-black"
                        controls
                      />
                      <CheckCircle className="mx-auto text-green-600" size={48} />
                      <p className="font-semibold text-gray-900">Video yüklendi</p>
                      <p className="text-sm text-gray-500">{videoFile?.name}</p>
                      {!isProcessing && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            retryVideo();
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Farklı video seç
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Camera className="mx-auto text-gray-400" size={56} />
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">
                          Video çekmek veya yüklemek için tıklayın
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Geri dönüşüm atıklarınızı atarken kaydedin
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                        <p className="text-xs text-blue-800">
                          💡 <strong>İpucu:</strong> Şişeleri net görebilmek için yakından çekin
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {isProcessing && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3 text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 py-4 rounded-xl border border-green-200 shadow-sm">
                    <Loader className="animate-spin" size={22} />
                    <span className="font-semibold">Video işleniyor ve şişeler sayılıyor...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 text-red-700 bg-red-50 p-4 rounded-xl border border-red-200 animate-shake">
                  <AlertCircle size={22} className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{error}</p>
                    <button
                      onClick={retryVideo}
                      className="text-sm text-red-600 hover:text-red-700 font-medium mt-2 underline"
                    >
                      Tekrar dene
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep(1)}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
                disabled={isProcessing}
              >
                ← Geri Dön
              </button>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && result && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Tebrikler! 🎉
                </h3>
                <p className="text-gray-600">
                  Geri dönüşüm bonusunuz hesabınıza eklendi
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-2 border-green-300 rounded-2xl p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between pb-4 border-b-2 border-green-200">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      🍾
                    </div>
                    <span className="text-gray-800 font-semibold">Tespit Edilen Şişe</span>
                  </div>
                  <span className="text-3xl font-bold text-green-600">
                    {result.bottleCount} adet
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Sparkles className="text-yellow-500" size={20} />
                    </div>
                    <span className="text-gray-800 font-semibold">Kazanılan Bonus</span>
                  </div>
                  <span className="text-4xl font-bold text-green-600">
                    +{result.earnedPoints}
                  </span>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="text-blue-600" size={20} />
                      <span className="text-gray-700 font-medium">Toplam Bonus Puanınız</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {result.totalBonusPoints}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  💡 <strong>Harika!</strong> Daha fazla geri dönüşüm yaparak daha çok bonus puan kazanabilirsiniz!
                </p>
              </div>

              <button
                onClick={resetAndClose}
                className="w-full bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                Anasayfaya Dön 🏠
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        .animate-progress {
          animation: progress 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Ana bileşen
interface RecyclingBonusCardProps {
  userAccountId: number;
}

const RecyclingBonusCard: React.FC<RecyclingBonusCardProps> = ({ userAccountId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Geri Dönüşüm</h3>
          <Camera className="text-green-600" size={20} />
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Yeniden dönüştürülebilir atıklarınızı atarken video kaydedin ve bonus puan kazanın!
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full border border-green-600 bg-transparent text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition flex items-center justify-center space-x-2"
        >
          <Camera size={18} />
          <span>Video Kaydet</span>
        </button>
      </div>

      <RecyclingBonusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userAccountId={userAccountId}
      />
    </>
  );
};

export default RecyclingBonusCard;