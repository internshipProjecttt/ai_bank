import datetime
import re
from rapidfuzz import fuzz
from app.ocr_processor import OCRProcessor

class ReceiptOCR:
    def __init__(self):
        self.ocr = OCRProcessor('tur+eng')

    def parseDateTime(self, text):
        date = None
        time = None

        time_pattern = re.compile(r"\b\d{1,2}:\d{2}(:\d{2})?\b")
        time_match = time_pattern.search(text)
        if time_match:
            time = time_match.group()
            text = text.replace(time, "")

        if "TARIH" in text:
            tarih_idx = text.find("TARIH")
            after_tarih = text[tarih_idx:]
            numbers = re.findall(r"\b\d+\b", after_tarih)

            if len(numbers) >= 3:
                day = None
                month = None
                year = None

                for num in numbers:
                    num_int = int(num)

                    if len(num) == 4 and 2000 <= num_int <= 2100:
                        year = num
                    elif len(num) == 2 and num_int > 20:
                        year = "20" + num
                    elif 1 <= num_int <= 12 and not month:
                        month = num.zfill(2)
                    elif 1 <= num_int <= 31 and not day:
                        day = num.zfill(2)

                if day and month and year:
                    date = f"{day}/{month}/{year}"
                elif day and month:
                    curr_year = datetime.datetime.now().year
                    date = f"{day}/{month}/{curr_year}"

        return date, time

    def extractInfo(self, image, search_item=None, debug=False):  # ✅ DEĞİŞTİ
        """
        Fiş bilgilerini çıkar
        
        Args:
            image: OpenCV formatında görüntü (numpy array) ✅
            search_item: Aranacak ürün (opsiyonel)
            debug: Debug modu
        """
        # ✅ Görüntüden metin çıkar
        import cv2
        
        # Geçici dosyaya kaydet (Tesseract için)
        import tempfile
        import os
        
        temp_path = None
        try:
            # Geçici dosya oluştur
            fd, temp_path = tempfile.mkstemp(suffix='.jpg')
            os.close(fd)
            
            # Görüntüyü kaydet
            cv2.imwrite(temp_path, image)
            
            # OCR ile oku
            raw_text = self.ocr.readImageSimple(temp_path, preprocess=True, psm_mode=6)
            text = raw_text.split('\n')
            
        finally:
            # Geçici dosyayı sil
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)
        
        date = None
        time = None
        amounts = []
        searched_item = None

        # Pattern'lar
        date_patterns = [
            re.compile(r"\b\d{2}[./-]\d{2}[./-]\d{4}\b"),
            re.compile(r"\b\d{2}[./-]\d{2}[./-]\d{2}\b"),
            re.compile(r"\b\d{4}[./-]\d{2}[./-]\d{2}\b"),
        ]

        time_patterns = [
            re.compile(r"\b\d{2}[.:;]\d{2}([.:,;]\d{2})?\b"),
            re.compile(r"\b\d{1,2}[.:;]\d{2}\b"),
        ]

        amount_patterns = [
            re.compile(r"\*?\d+[.,]\d{2}\b"),
            re.compile(r"\b\d+[.,]\d{2}\s*TL\b"),
            re.compile(r"\b\d+[.,]\d{2}\s*₺\b"),
        ]

        i = 0
        while i < len(text):
            line = text[i]
            line_norm = self.ocr.normalize(line)

            if debug:
                print(f"Satır {i}: {line_norm}")

            # Tarih/Saat satırı
            if "TARIH" in line_norm or "SAAT" in line_norm:
                combined = line_norm
                if i + 1 < len(text):
                    combined += " " + self.ocr.normalize(text[i + 1])
                if i + 2 < len(text):
                    combined += " " + self.ocr.normalize(text[i + 2])

                parsed_date, parsed_time = self.parseDateTime(combined)
                if parsed_date:
                    date = parsed_date
                if parsed_time:
                    time = parsed_time
                i += 1
                continue

            # Saat kontrolü
            if not time:
                for pattern in time_patterns:
                    t = re.search(pattern, line_norm)
                    if t:
                        time = t.group()
                        break

            # Tarih kontrolü
            if not date:
                for pattern in date_patterns:
                    d = re.search(pattern, line_norm)
                    if d:
                        date = d.group()
                        break

            # Tutar kontrolü
            for pattern in amount_patterns:
                for a in re.findall(pattern, line_norm):
                    if "KDV" not in line_norm and "KART" not in line_norm:
                        cleaned_amount = a.replace("*", "").strip()
                        amounts.append(cleaned_amount)

            # Ürün ara
            if search_item and not searched_item:
                if fuzz.partial_ratio(self.ocr.normalize(search_item), line_norm) > 75:
                    searched_item = line

            i += 1

        # En yüksek tutarı bul
        def toFloat(val):
            return float(val.replace("*", "").replace(",", ".").replace("TL", "").replace("₺", "").strip())

        total = max(amounts, key=toFloat) if amounts else None

        return {
            "SEARCHED_ITEM": searched_item,
            "TARIH": date,
            "SAAT": time,
            "AMOUNT": total
        }