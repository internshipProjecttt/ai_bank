"""
SÜPER GELİŞTİRİLMİŞ Lokal Geri Dönüşüm Kutusu Tespiti
✨ YENİ: Agresif Logo İçi Yazı Tespiti + 10 Katman OCR
100% Offline - API Gerektirmez!
"""

import cv2
import numpy as np
import os
from PIL import Image
import tempfile
try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    print("⚠️  pytesseract bulunamadı. Yazı tespiti çalışmayacak.")
    print("   Yüklemek için: pip install pytesseract")


def extract_text_regions(img):
    """
    Beyaz yazı bölgelerini bul ve çıkar
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Beyaz bölgeleri bul (yazılar genelde beyaz)
    _, white_mask = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)
    
    # Morfolojik işlemlerle bağla
    kernel = np.ones((3, 3), np.uint8)
    white_mask = cv2.morphologyEx(white_mask, cv2.MORPH_CLOSE, kernel)
    white_mask = cv2.dilate(white_mask, kernel, iterations=2)
    
    # Sadece beyaz bölgeleri al
    text_only = cv2.bitwise_and(gray, gray, mask=white_mask)
    
    # Siyah zemin üzerine beyaz yazı yap
    text_enhanced = np.zeros_like(gray)
    text_enhanced[white_mask > 0] = 255
    
    return text_enhanced


def isolate_logo_text(img):
    """
    Logonun içindeki metni izole et
    """
    # HSV'ye çevir
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # Sadece düşük saturasyonlu (beyaz/gri) bölgeleri al
    lower = np.array([0, 0, 180])
    upper = np.array([180, 50, 255])
    white_mask = cv2.inRange(hsv, lower, upper)
    
    # Beyaz bölgeleri izole et
    isolated = cv2.bitwise_and(img, img, mask=white_mask)
    gray = cv2.cvtColor(isolated, cv2.COLOR_BGR2GRAY)
    
    # Kontrastı maksimuma çıkar
    _, high_contrast = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
    
    return high_contrast


def detect_text_in_image(image_path):
    """
    SÜPER AGRESİF OCR - 10+ farklı yaklaşım
    """
    if not TESSERACT_AVAILABLE:
        return {
            'text_detected': False,
            'score': 0,
            'detected_keywords': [],
            'full_text': '',
            'all_detected_words': []
        }
    
    try:
        img = cv2.imread(image_path)
        
        if img is None:
            return {
                'text_detected': False, 
                'score': 0, 
                'detected_keywords': [], 
                'full_text': '',
                'all_detected_words': []
            }
        
        all_texts = []
        
        # Farklı OCR konfigürasyonları
        configs = [
            r'--oem 3 --psm 6',   # Varsayılan
            r'--oem 3 --psm 11',  # Sparse text
            r'--oem 3 --psm 12',  # Sparse text with OSD
            r'--oem 3 --psm 3',   # Fully automatic
        ]
        
        print("   🔍 Katman 1: Orijinal görüntü...")
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        for config in configs:
            try:
                text = pytesseract.image_to_string(gray, lang='tur+eng', config=config)
                all_texts.append(text)
            except:
                pass
        
        print("   🔍 Katman 2: Beyaz yazı izolasyonu...")
        text_only = extract_text_regions(img)
        for config in configs:
            try:
                text = pytesseract.image_to_string(text_only, lang='tur+eng', config=config)
                all_texts.append(text)
            except:
                pass
        
        print("   🔍 Katman 3: Logo içi yazı...")
        logo_text = isolate_logo_text(img)
        for config in configs:
            try:
                text = pytesseract.image_to_string(logo_text, lang='tur+eng', config=config)
                all_texts.append(text)
            except:
                pass
        
        print("   🔍 Katman 4: Yüksek kontrast...")
        _, high_contrast = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
        for config in configs:
            try:
                text = pytesseract.image_to_string(high_contrast, lang='tur+eng', config=config)
                all_texts.append(text)
            except:
                pass
        
        print("   🔍 Katman 5: Inverse...")
        _, inv = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)
        for config in configs:
            try:
                text = pytesseract.image_to_string(inv, lang='tur+eng', config=config)
                all_texts.append(text)
            except:
                pass
        
        print("   🔍 Katman 6: CLAHE...")
        clahe = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(8,8))
        enhanced = clahe.apply(gray)
        for config in configs:
            try:
                text = pytesseract.image_to_string(enhanced, lang='tur+eng', config=config)
                all_texts.append(text)
            except:
                pass
        
        print("   🔍 Katman 7: Adaptive threshold...")
        adaptive = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                        cv2.THRESH_BINARY, 11, 2)
        for config in configs:
            try:
                text = pytesseract.image_to_string(adaptive, lang='tur+eng', config=config)
                all_texts.append(text)
            except:
                pass
        
        print("   🔍 Katman 8: Morfolojik işlemler...")
        kernel = np.ones((2,2), np.uint8)
        morph = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, kernel)
        for config in configs:
            try:
                text = pytesseract.image_to_string(morph, lang='tur+eng', config=config)
                all_texts.append(text)
            except:
                pass
        
        print("   🔍 Katman 9: Gürültü azaltma...")
        denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
        for config in configs:
            try:
                text = pytesseract.image_to_string(denoised, lang='tur+eng', config=config)
                all_texts.append(text)
            except:
                pass
        
        print("   🔍 Katman 10: Büyütme + keskinleştirme...")
        # Görüntüyü 2x büyüt
        resized = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        # Keskinleştir
        kernel_sharp = np.array([[-1,-1,-1],
                                 [-1, 9,-1],
                                 [-1,-1,-1]])
        sharpened = cv2.filter2D(resized, -1, kernel_sharp)
        for config in configs:
            try:
                text = pytesseract.image_to_string(sharpened, lang='tur+eng', config=config)
                all_texts.append(text)
            except:
                pass
        
        # Tüm sonuçları birleştir
        full_text = " ".join(all_texts).lower()
        
        # Tespit edilen tüm kelimeler
        all_words = set(full_text.split())
        # Çok kısa ve anlamsız kelimeleri filtrele
        all_words = {w for w in all_words if len(w) >= 2 and not w.isdigit()}
        
        # ANAHTAR KELİMELER - ÇOK GENİŞ FUZZY MATCHING
        keywords_map = {
            'sıfır atık': [
                # Türkçe varyasyonlar
                'sıfır atık', 'sifir atik', 'sifir atık', 'sıfır atik',
                's1fir atik', 'sıfır', 'sifir', 'sifır', 'sıfır',
                # Ayrı kelimeler
                'atık', 'atik', 'atik', 'atık',
                # İngilizce
                'zero waste', 'zero', 'waste',
                # Logo içinde olabilecek hatalı okumalar
                'sifie', 'atik', 'sifir', 'atix',
                # Büyük harf varyasyonları
                'SIFIR', 'ATIK', 'sIfIr', 'aTiK'
            ],
            'geri dönüşüm': [
                'geri dönüşüm', 'geri donusum', 'geri dönüşüm', 'geridönüşüm',
                'geridonusum', 'recycling', 'recycle', 'geri', 'donusum', 'dönüşüm',
                'RECYCLING', 'RECYCLE'
            ],
            'plastik': ['plastik', 'plastic', 'plastık', 'PLASTIC', 'PLASTİK', 'PLASTIK'],
            'cam': ['cam', 'glass', 'CAM', 'GLASS'],
            'kağıt': ['kağıt', 'kagit', 'kağıt', 'paper', 'KAGIT', 'KAĞIT', 'PAPER'],
            'metal': ['metal', 'METAL'],
            'organik': ['organik', 'organic', 'ORGANİK', 'ORGANIK', 'ORGANIC'],
        }
        
        detected_keywords = []
        max_keyword_score = 0
        
        # Her ana kelime için varyasyonları kontrol et
        for main_keyword, variations in keywords_map.items():
            found = False
            for variant in variations:
                # Case-insensitive arama
                if variant.lower() in full_text:
                    if main_keyword not in detected_keywords:
                        detected_keywords.append(main_keyword)
                        print(f"      ✅ BULUNDU: '{variant}' → '{main_keyword}'")
                    found = True
                    break
            
            if found:
                # Skorlama
                if main_keyword in ['sıfır atık', 'geri dönüşüm']:
                    max_keyword_score = max(max_keyword_score, 70)  # ÇOK YÜKSEK!
                elif main_keyword in ['plastik', 'cam', 'kağıt', 'metal', 'organik']:
                    max_keyword_score = max(max_keyword_score, 40)
                else:
                    max_keyword_score = max(max_keyword_score, 20)
        
        return {
            'text_detected': len(detected_keywords) > 0,
            'score': max_keyword_score,
            'detected_keywords': detected_keywords,
            'full_text': full_text.strip()[:500],
            'all_detected_words': sorted(list(all_words))
        }
    
    except Exception as e:
        print(f"⚠️  OCR hatası: {e}")
        return {
            'text_detected': False,
            'score': 0,
            'detected_keywords': [],
            'full_text': '',
            'all_detected_words': []
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
    Görüntüyü kapsamlı analiz eder
    """
    print(f"\n{'='*60}")
    print("KAPSAMLI GÖRÜNTÜ ANALİZİ")
    print("Süper Agresif Logo İçi Yazı Tespiti!")
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
    
    # 1. YAZI TESPİTİ
    print("\n📝 Süper Agresif Yazı Tespiti (10+ Katman OCR)...")
    if TESSERACT_AVAILABLE:
        text_results = detect_text_in_image(image_path)
        if text_results['text_detected']:
            print(f"\n   ✅ ✅ ✅ YAZI TESPİT EDİLDİ! ✅ ✅ ✅")
            print(f"   🎯 Bulunan anahtar kelimeler: {', '.join(text_results['detected_keywords'])}")
            
            # Tespit edilen TÜM kelimeleri yazdır
            if text_results.get('all_detected_words'):
                print(f"\n   📋 OCR tarafından okunan tüm kelimeler ({len(text_results['all_detected_words'])} adet):")
                words = text_results['all_detected_words']
                for i in range(0, min(len(words), 50), 10):
                    chunk = words[i:i+10]
                    print(f"      {', '.join(chunk)}")
                if len(words) > 50:
                    print(f"      ... ve {len(words)-50} kelime daha")
        else:
            print(f"\n   ❌ Geri dönüşüm ile ilgili yazı bulunamadı")
            if text_results.get('all_detected_words'):
                print(f"   📋 OCR tarafından okunan kelimeler ({len(text_results['all_detected_words'])} adet):")
                words = text_results['all_detected_words']
                for i in range(0, min(len(words), 30), 10):
                    chunk = words[i:i+10]
                    print(f"      {', '.join(chunk)}")
    else:
        print(f"   ⚠️  OCR mevcut değil (pytesseract kurulu değil)")
        text_results = {'text_detected': False, 'score': 0, 'detected_keywords': [], 'full_text': '', 'all_detected_words': []}
    
    # 2. Şekil analizi
    print("\n📐 Şekil Analizi...")
    shape_results = detect_rectangular_shapes(image_path)
    
    if shape_results:
        print(f"   Dikdörtgen sayısı: {shape_results['num_rectangles']}")
    
    # SKORLAMA
    score = 0
    reasons = []
    
    if text_results['text_detected']:
        score += text_results['score']
        for keyword in text_results['detected_keywords']:
            reasons.append(f"✨ YAZI: '{keyword}'")
    
    if shape_results and shape_results['num_rectangles'] > 0:
        score += 10
        reasons.append(f"📐 {shape_results['num_rectangles']} dikdörtgen")

    # SONUÇ
    detected = (score >= 30 and shape_results and shape_results['num_rectangles'] > 0)
    confidence = 'çok yüksek' if score >= 70 else 'yüksek' if score >= 50 else 'orta' if score >= 30 else 'düşük'
    
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
    Ana fonksiyon
    """
    print(f"\n{'='*60}")
    print("SÜPER GELİŞTİRİLMİŞ GERİ DÖNÜŞÜM KUTUSU TESPİTİ")
    print("✨ 10+ Katman Agresif OCR + Logo İçi Yazı Tespiti!")
    print(f"{'='*60}")
    
    result = analyze_image_comprehensive(image_path)
    
    if not result:
        return None
    
    # SONUÇ
    print(f"\n{'='*60}")
    print("SONUÇ")
    print(f"{'='*60}")
    
    if result['detected']:
        print(f"✅ ✅ ✅ GERİ DÖNÜŞÜM KUTUSU TESPİT EDİLDİ! ✅ ✅ ✅")
        print(f"📊 Güven seviyesi: {result['confidence']}")
        print(f"🎯 Skor: {result['score']}/100")
        print(f"\n🔍 Tespit sebepleri:")
        for reason in result['reasons']:
            print(f"   {reason}")
    else:
        print(f"❌ Geri dönüşüm kutusu tespit edilemedi")
        print(f"📝 Skor: {result['score']}/100 (minimum 30 gerekli)")
        if result['reasons']:
            print(f"\n🔍 Tespit edilenler:")
            for reason in result['reasons']:
                print(f"   - {reason}")
    
    print(f"{'='*60}")
    
    return result


def main():
    print("="*60)
    print("SÜPER GELİŞTİRİLMİŞ GERİ DÖNÜŞÜM KUTUSU TESPİTİ")
    print("100% Offline - 10+ Katman Agresif OCR!")
    print("="*60)
    
    if not TESSERACT_AVAILABLE:
        print("\n⚠️  UYARI: pytesseract kurulu değil!")
        print("   Kurmak için:")
        print("   1. pip install pytesseract")
        print("   2. Tesseract OCR + Türkçe dil paketi:")
        print("      Mac: brew install tesseract tesseract-lang")
        print("      Linux: sudo apt-get install tesseract-ocr tesseract-ocr-tur")
    
    print("\n" + "="*60)
    image_path = input("Fotoğraf dosyasının yolunu girin: ").strip()
    image_path = image_path.strip('"').strip("'")
    
    result = detect_recycling_bin_local(image_path)
    
    if result and result['detected']:
        print("\n🎉 🎉 🎉 BAŞARILI! 🎉 🎉 🎉")


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
