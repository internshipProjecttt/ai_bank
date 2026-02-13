'use client';
import React, { useState, useRef } from 'react';
import { Camera, CheckCircle, XCircle, Upload, ArrowRight, Loader2, Receipt, Tag, AlertCircle } from 'lucide-react';

interface OcrReceiptResult {
  ocr: {
    date: string | null;
    time: string | null;
    amount: number | null;
    searchedItem: string | null;
  };
  existsInDb: boolean;
}

interface OcrLabelResult {
  materials: {
    KUMAŞ_KOMPOZİSYONU: { ORAN: string; MALZEME: string }[];
    ANA_KUMAŞ: { ORAN: string; MALZEME: string } | null;
  };
  bonusPoints: number;
  newTotalPoints?: number;
  message: string;
}

type Step = 'upload_receipt' | 'receipt_result' | 'upload_label' | 'label_result' | 'done';

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps = [
    { key: 'upload_receipt', label: 'Fiş Tara' },
    { key: 'receipt_result', label: 'Fiş Sonucu' },
    { key: 'upload_label', label: 'Etiket Tara' },
    { key: 'label_result', label: 'Sonuç' },
  ];

  const stepIndex = {
    upload_receipt: 0,
    receipt_result: 1,
    upload_label: 2,
    label_result: 3,
    done: 3,
  };

  const current = stepIndex[currentStep];

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, i) => (
        <React.Fragment key={step.key}>
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                i < current
                  ? 'bg-green-500 border-green-500 text-white'
                  : i === current
                  ? 'bg-indigo-600 border-indigo-600 text-white scale-110'
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}
            >
              {i < current ? <CheckCircle size={18} /> : i + 1}
            </div>
            <span
              className={`text-xs mt-1 font-medium ${
                i === current ? 'text-indigo-600' : i < current ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 w-16 mx-1 mb-4 transition-all duration-500 ${
                i < current ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function ImageUploadArea({
  onImageSelect,
  preview,
  label,
  loading,
}: {
  onImageSelect: (file: File) => void;
  preview: string | null;
  label: string;
  loading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onImageSelect(file);
  };

  return (
    <div
      onClick={() => !loading && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer
        ${preview ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50'}
        ${loading ? 'opacity-60 cursor-not-allowed' : ''}
      `}
      style={{ minHeight: 220 }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
        disabled={loading}
      />

      {preview ? (
        <div className="relative w-full h-full flex items-center justify-center p-2">
          <img
            src={preview}
            alt="Yüklenen görüntü"
            className="max-h-48 max-w-full rounded-xl object-contain shadow"
          />
          {!loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded-2xl">
              <span className="opacity-0 hover:opacity-100 text-white text-sm font-medium bg-black bg-opacity-50 px-3 py-1 rounded-full">
                Değiştir
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
            <Upload className="text-indigo-500" size={28} />
          </div>
          <p className="text-gray-700 font-semibold mb-1">{label}</p>
          <p className="text-gray-400 text-sm">Galeriden seç</p>
          <div className="flex items-center gap-2 mt-4">
            <span className="flex items-center gap-1 text-xs text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              <Upload size={13} /> Dosya
            </span>
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-2xl">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <span className="text-sm text-indigo-600 font-medium">İşleniyor...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OcrScanModalContent() {
  const [step, setStep] = useState<Step>('upload_receipt');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [labelFile, setLabelFile] = useState<File | null>(null);
  const [labelPreview, setLabelPreview] = useState<string | null>(null);
  const [receiptResult, setReceiptResult] = useState<OcrReceiptResult | null>(null);
  const [labelResult, setLabelResult] = useState<OcrLabelResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accountId = typeof window !== 'undefined'
    ? parseInt(localStorage.getItem('selectedAccountId') || '1')
    : 1;

  // ---- Fiş seçimi
  const handleReceiptSelect = (file: File) => {
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
    setError(null);
  };

  // ---- Fiş gönder
  const handleReceiptSubmit = async () => {
    if (!receiptFile) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', receiptFile);

      const res = await fetch('http://localhost:5000/api/OCR/process-receipt', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Fiş işlenemedi');
      }

      const data: OcrReceiptResult = await res.json();
      setReceiptResult(data);
      setStep('receipt_result');
    } catch (e: any) {
      setError(e.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // ---- Etiket seçimi
  const handleLabelSelect = (file: File) => {
    setLabelFile(file);
    setLabelPreview(URL.createObjectURL(file));
    setError(null);
  };

  // ---- Etiket gönder
  const handleLabelSubmit = async () => {
    if (!labelFile) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', labelFile);
      formData.append('accountId', accountId.toString());

      const res = await fetch('http://localhost:5000/api/OCR/process-label', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Etiket işlenemedi');
      }

      const data: OcrLabelResult = await res.json();
      setLabelResult(data);
      setStep('label_result');
    } catch (e: any) {
      setError(e.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // ---- Sıfırla
  const handleReset = () => {
    setStep('upload_receipt');
    setReceiptFile(null);
    setReceiptPreview(null);
    setLabelFile(null);
    setLabelPreview(null);
    setReceiptResult(null);
    setLabelResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-lg">

        {/* Başlık */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Fiş & Etiket Tarayıcı</h1>
          <p className="text-gray-500 text-sm mt-1">
            Fişinizi tarayın, etiketinizden bonus puan kazanın
          </p>
        </div>

        {/* Adım göstergesi */}
        <StepIndicator currentStep={step} />

        {/* Kart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          {/* ---- ADIM 1: Fiş Yükle ---- */}
          {step === 'upload_receipt' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Receipt className="text-indigo-600" size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Fişi Yükle</h2>
                  <p className="text-xs text-gray-500">JPEG veya PNG, max 10MB</p>
                </div>
              </div>

              <ImageUploadArea
                onImageSelect={handleReceiptSelect}
                preview={receiptPreview}
                label="Fiş fotoğrafını buraya yükleyin"
                loading={loading}
              />

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button
                onClick={handleReceiptSubmit}
                disabled={!receiptFile || loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Analiz Ediliyor...
                  </>
                ) : (
                  <>
                    Fişi Tara
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ---- ADIM 2: Fiş Sonucu ---- */}
          {step === 'receipt_result' && receiptResult && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  receiptResult.existsInDb ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {receiptResult.existsInDb
                    ? <CheckCircle className="text-green-600" size={20} />
                    : <AlertCircle className="text-yellow-500" size={20} />
                  }
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Fiş Analizi Tamamlandı</h2>
                  <p className="text-xs text-gray-500">OCR tarafından okunan bilgiler</p>
                </div>
              </div>

              {/* OCR Bilgileri */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <OcrInfoRow label="📅 Tarih" value={receiptResult.ocr.date || 'Bulunamadı'} />
                <OcrInfoRow label="🕐 Saat" value={receiptResult.ocr.time || 'Bulunamadı'} />
                <OcrInfoRow
                  label="💰 Tutar"
                  value={
                    receiptResult.ocr.amount != null
                      ? `${receiptResult.ocr.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`
                      : 'Bulunamadı'
                  }
                />
              </div>

              {/* DB Eşleşme Durumu */}
              <div className={`rounded-xl p-4 border ${
                receiptResult.existsInDb
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start gap-3">
                  {receiptResult.existsInDb ? (
                    <>
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="font-semibold text-green-800">İşlem Kayıtlarda Bulundu</p>
                        <p className="text-sm text-green-700 mt-1">
                          Bu fişe ait işlem veritabanınızda mevcut.
                          Şimdi ürün etiketini tarayarak bonus puan kazanabilirsiniz!
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="font-semibold text-yellow-800">İşlem Bulunamadı</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Bu fişe ait bir işlem kayıtlarda bulunamadı.
                          Yine de etiket tarayarak bonus puan kazanabilirsiniz.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition"
                >
                  Yeniden Başla
                </button>
                <button
                  onClick={() => setStep('upload_label')}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  Etiket Tara
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ---- ADIM 3: Etiket Yükle ---- */}
          {step === 'upload_label' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Tag className="text-emerald-600" size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Ürün Etiketini Yükle</h2>
                  <p className="text-xs text-gray-500">Kumaş içerik etiketini tarayın</p>
                </div>
              </div>

              {/* Bilgi kutusu */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-sm text-emerald-700">
                  <span className="font-semibold">💡 Nasıl çalışır?</span><br />
                  Organik, doğal veya geri dönüştürülebilir kumaşlar içeren ürünler için
                  bonus puan kazanırsınız. Pamuk, yün ve viskon gibi malzemeler yeşil kategoridedir.
                </p>
              </div>

              <ImageUploadArea
                onImageSelect={handleLabelSelect}
                preview={labelPreview}
                label="Kumaş içerik etiketini yükleyin"
                loading={loading}
              />

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('receipt_result')}
                  disabled={loading}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition disabled:opacity-50"
                >
                  Geri Dön
                </button>
                <button
                  onClick={handleLabelSubmit}
                  disabled={!labelFile || loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Analiz Ediliyor...
                    </>
                  ) : (
                    <>
                      Etiketi Tara
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ---- ADIM 4: Etiket Sonucu ---- */}
          {step === 'label_result' && labelResult && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <span className="text-xl">⭐</span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Bonus Puanlar Hesaplandı!</h2>
                  <p className="text-xs text-gray-500">{labelResult.message}</p>
                </div>
              </div>

              {/* Puan Kartı */}
              {labelResult.bonusPoints > 0 ? (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 text-white text-center shadow">
                  <p className="text-5xl font-extrabold mb-1">+{labelResult.bonusPoints}</p>
                  <p className="text-lg font-semibold opacity-90">Bonus Puan Kazandınız!</p>
                  {labelResult.newTotalPoints != null && (
                    <p className="text-sm opacity-80 mt-2">
                      Toplam puanınız: <span className="font-bold">{labelResult.newTotalPoints}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-2xl p-6 text-center">
                  <p className="text-4xl mb-2">😕</p>
                  <p className="font-semibold text-gray-700">Bu ürün için bonus puan yok</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Organik ve doğal kumaşlı ürünler tercih edin!
                  </p>
                </div>
              )}

              {/* Kumaş Bilgileri */}
              {labelResult.materials?.KUMAŞ_KOMPOZİSYONU?.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">🧵 Kumaş Kompozisyonu</p>
                  <div className="space-y-2">
                    {labelResult.materials.KUMAŞ_KOMPOZİSYONU.map((fabric, i) => {
                      const isGreen = ['COTTON', 'PAMUK', 'WOOL', 'YÜN', 'VISCOSE', 'VİSKOZ'].includes(fabric.MALZEME);
                      const isYellow = ['POLYAMIDE', 'POLİAMİD'].includes(fabric.MALZEME);
                      return (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                              isGreen ? 'bg-green-500' : isYellow ? 'bg-yellow-500' : 'bg-red-400'
                            }`} />
                            <span className="text-sm text-gray-700">{fabric.MALZEME}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{fabric.ORAN}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Renk Açıklaması */}
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-200">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <span className="w-2 h-2 bg-green-500 rounded-full" /> Yeşil (+10 puan)
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full" /> Sarı (+5 puan)
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <span className="w-2 h-2 bg-red-400 rounded-full" /> Kırmızı (0 puan)
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition"
              >
                Yeni Tarama Başlat
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ---- Yardımcı bileşen
function OcrInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}