"""
Gelişmiş Lokal Geri Dönüşüm Kutusu Tespiti
Renk + Şekil + YAZI TESPİTİ (OCR)
100% Offline - API Gerektirmez!
"""

import cv2
import numpy as np
import os
from PIL import Image
import tempfile
import os

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    print("⚠️  pytesseract bulunamadı. Yazı tespiti çalışmayacak.")
    print("   Yüklemek için: pip install pytesseract")

def detect_text_in_image(image_path):
    """
    OCR ile görüntüdeki yazıları tespit eder
    "Sıfır Atık", "Geri Dönüşüm", "Recycling" gibi kelimeler arar
    
    Args:
        image_path: Fotoğraf yolu
    
    Returns:
        Tespit edilen yazılar ve skor
    """
    if not TESSERACT_AVAILABLE:
        return {
            'text_detected': False,
            'score': 0,
            'detected_keywords': [],
            'full_text': ''
        }
    
    try:
        # Görüntüyü oku
        img = cv2.imread(image_path)
        
        if img is None:
            return {'text_detected': False, 'score': 0, 'detected_keywords': [], 'full_text': ''}
        
        # Gri tonlamaya çevir (OCR için daha iyi)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Kontrast artır
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(gray)
        
        # Gürültü azaltma
        denoised = cv2.fastNlMeansDenoising(enhanced)
        
        # Binary threshold (yazıları daha net yapar)
        _, binary = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # OCR ile yazıları oku (Türkçe + İngilizce)
        # pytesseract.pytesseract.tesseract_cmd = '/opt/homebrew/bin/tesseract'  # Mac için
        custom_config = r'--oem 3 --psm 6'
        
        try:
            # Önce Türkçe ile dene
            text_tr = pytesseract.image_to_string(binary, lang='tur', config=custom_config)
        except:
            text_tr = ""
        
        try:
            # Sonra İngilizce ile dene
            text_en = pytesseract.image_to_string(binary, lang='eng', config=custom_config)
        except:
            text_en = ""
        
        # İki sonucu birleştir
        full_text = (text_tr + " " + text_en).lower()
        
        # Geri dönüşüm ile ilgili anahtar kelimeler
        keywords_turkish = [
            'sıfır atık',
            'geri dönüşüm',
            'geri donuşum',  # Türkçe karakter olmadan
            'atık',
            'plastik',
            'cam',
            'kağıt',
            'kagit',
            'metal',
            'ambalaj',
            'pet şişe',
            'pet sise',
            '♻️'
        ]
        
        keywords_english = [
            'recycling',
            'recycle',
            'waste',
            'trash',
            'plastic',
            'glass',
            'paper',
            'metal',
            'bottle',
            'can',
            'recyclable'
        ]
        
        all_keywords = keywords_turkish + keywords_english
        
        detected_keywords = []
        max_keyword_score = 0
        
        for keyword in all_keywords:
            if keyword in full_text:
                detected_keywords.append(keyword)
                # "sıfır atık" ve "geri dönüşüm" en güçlü göstergeler
                if keyword in ['sıfır atık', 'geri dönüşüm', 'geri donuşum', 'recycling']:
                    max_keyword_score = 50  # Çok yüksek skor!
                elif keyword in ['atık', 'waste', 'recycle']:
                    max_keyword_score = max(max_keyword_score, 40)
                else:
                    max_keyword_score = max(max_keyword_score, 10)
        
        return {
            'text_detected': len(detected_keywords) > 0,
            'score': max_keyword_score,
            'detected_keywords': detected_keywords,
            'full_text': full_text.strip()[:200]  # İlk 200 karakter
        }
    
    except Exception as e:
        print(f"⚠️  OCR hatası: {e}")
        return {
            'text_detected': False,
            'score': 0,
            'detected_keywords': [],
            'full_text': ''
        }


def detect_rectangular_shapes(image_path):
    """
    Dikdörtgen şekilleri tespit eder
    """
    img = cv2.imread(image_path)
    
    if img is None:
        return None
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    rectangles = []
    
    for contour in contours:
        area = cv2.contourArea(contour)
        if area < 1000:
            continue
        
        peri = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, 0.02 * peri, True)
        
        if len(approx) == 4:
            rectangles.append({'area': area, 'perimeter': peri})
    
    return {
        'num_rectangles': len(rectangles),
        'rectangles': rectangles
    }

def analyze_image_comprehensive(image_path):
    """
    Görüntüyü kapsamlı analiz eder: Renk + Şekil + Yazı
    """
    print(f"\n{'='*60}")
    print("KAPSAMLI GÖRÜNTÜ ANALİZİ")
    print("Şekil + Yazı Tespiti!")
    print(f"{'='*60}")
    
    if not os.path.exists(image_path):
        print(f"❌ Fotoğraf bulunamadı: {image_path}")
        return None
    
    print(f"\n📸 Fotoğraf: {image_path}")
    
    try:
        img = Image.open(image_path)
        print(f"📐 Boyut: {img.size[0]}x{img.size[1]} piksel")
    except Exception as e:
        print(f"❌ Görüntü okunamadı: {e}")
        return None
    
    # 1. YAZI TESPİTİ (EN ÖNEMLİ!)
    print("\n📝 Yazı Tespiti (OCR)...")
    if TESSERACT_AVAILABLE:
        text_results = detect_text_in_image(image_path)
        if text_results['text_detected']:
            print(f"   ✅ Yazı tespit edildi!")
            print(f"   Bulunan kelimeler: {', '.join(text_results['detected_keywords'])}")
            if text_results['full_text']:
                print(f"   Okunan metin (ilk 100 karakter): {text_results['full_text'][:100]}...")
        else:
            print(f"   ℹ️  Geri dönüşüm ile ilgili yazı bulunamadı")
    else:
        print(f"   ⚠️  OCR mevcut değil (pytesseract kurulu değil)")
        text_results = {'text_detected': False, 'score': 0, 'detected_keywords': [], 'full_text': ''}
    
    
    # 3. Şekil analizi
    print("\n📐 Şekil Analizi...")
    shape_results = detect_rectangular_shapes(image_path)
    
    if shape_results:
        print(f"   Dikdörtgen sayısı: {shape_results['num_rectangles']}")
    
    # SKORLAMA SİSTEMİ
    score = 0
    reasons = []
    
    # YAZI TESPİTİ (EN GÜÇLÜ KANIT!)
    if text_results['text_detected']:
        score += text_results['score']
        for keyword in text_results['detected_keywords']:
            reasons.append(f"✨ YAZI TESPİT EDİLDİ: '{keyword}' (ÇOK GÜÇLÜ KANIT!)")
    
  
    
    # Dikdörtgen
    if shape_results and shape_results['num_rectangles'] > 0:
        score += 10
        reasons.append(f"{shape_results['num_rectangles']} dikdörtgen şekil")
    
    # SONUÇ BELİRLEME
    # Eğer "sıfır atık" veya "geri dönüşüm" yazısı varsa, neredeyse kesin!
    if text_results['text_detected'] and any(kw in ['sıfır atık', 'geri dönüşüm', 'geri donuşum', 'recycling'] 
                                              for kw in text_results['detected_keywords']):
        detected = True
        confidence = 'çok yüksek'
    else:
        detected = score >= 40  # Yazı yoksa skor eşiği biraz daha yüksek
        confidence = 'yüksek' if score >= 60 else 'orta' if score >= 40 else 'düşük'
    
    return {
        'detected': detected,
        'score': score,
        'confidence': confidence,
        'reasons': reasons,
        'text_analysis': text_results,
        'shape_analysis': shape_results
    }

def detect_recycling_bin_local(image_path):
    """
    Ana fonksiyon: Gelişmiş lokal geri dönüşüm kutusu tespiti
    """
    print(f"\n{'='*60}")
    print("GELİŞMİŞ LOKAL GERİ DÖNÜŞÜM KUTUSU TESPİTİ")
    print(" Şekil + Yazı Tespiti!")
    print(f"{'='*60}")
    
    result = analyze_image_comprehensive(image_path)
    
    if not result:
        return None
    
    # SONUÇ
    print(f"\n{'='*60}")
    print("SONUÇ")
    print(f"{'='*60}")
    
    if result['detected']:
        print(f"✅ GERİ DÖNÜŞÜM KUTUSU TESPİT EDİLDİ!")
        print(f"📊 Güven seviyesi: {result['confidence']}")
        print(f"🎯 Skor: {result['score']}/100")
        print(f"\n🔍 Tespit sebepleri:")
        for reason in result['reasons']:
            print(f"   {reason}")
    else:
        print(f"❌ Geri dönüşüm kutusu tespit edilemedi")
        print(f"📝 Skor: {result['score']}/100 (minimum 40 gerekli)")
        if result['reasons']:
            print(f"\n🔍 Tespit edilenler:")
            for reason in result['reasons']:
                print(f"   - {reason}")
    
    print(f"{'='*60}")
    
    return result

def main():
    print("="*60)
    print("GELİŞMİŞ LOKAL GERİ DÖNÜŞÜM KUTUSU TESPİTİ")
    print("100% Offline -  Şekil + YAZI!")
    print("="*60)
    
    
    if not TESSERACT_AVAILABLE:
        print("\n⚠️  UYARI: pytesseract kurulu değil!")
        print("   Yazı tespiti çalışmayacak. Kurmak için:")
        print("   1. pip install pytesseract")
        print("   2. Tesseract OCR'ı yükleyin:")
        print("      Mac: brew install tesseract tesseract-lang")
        print("      Windows: https://github.com/UB-Mannheim/tesseract/wiki")
        print("      Linux: sudo apt-get install tesseract-ocr tesseract-ocr-tur")
    
    # Fotoğraf yolu
    print("\n" + "="*60)
    image_path = input("Fotoğraf dosyasının yolunu girin: ").strip()
    image_path = image_path.strip('"').strip("'")
    
    # Tespit
    result = detect_recycling_bin_local(image_path)
    
    if result and result['detected']:
        print("\n✅ Test başarıyla tamamlandı!")
        print("\n💡 İPUCU:")
        print("   Yazı tespiti en güçlü kanıttır!")
        print("   'Sıfır Atık' yazısı varsa %50 puan!")
    else:
        print("\n⚠️  Tespit yapılamadı.")
        print("\n💡 Öneriler:")
        print("   - Üzerindeki yazılar net görünsün")
        print("   - Mavi/yeşil renk belirgin olsun")
        print("   - İyi ışıklandırma")

if __name__ == "__main__":
    main()

# kututespit.py içinde yeni fonksiyon
def detect_recycling_bin_from_array(img_array):

    temp_file = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
    temp_path = temp_file.name
    temp_file.close()
    
    try:
        cv2.imwrite(temp_path, img_array)
        result = analyze_image_comprehensive(temp_path)
        return result
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
