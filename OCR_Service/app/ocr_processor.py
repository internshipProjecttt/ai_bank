import cv2
import pytesseract

class OCRProcessor:
    def __init__(self, languages='tur+eng'):
        self.languages = languages

    def processImage(self, image):
        """Görüntüyü OCR için optimize ediyoruz"""
        gray_img = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        denoised_img = cv2.fastNlMeansDenoising(gray_img, None, 10, 7, 21)

        # Kontrast artırma
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(denoised_img)

        _, thresh = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return thresh

    def readImage(self, img_path, preprocess=True, psm_mode=6):
        """
        Görüntüden metin çıkar

        Args:
            img_path: Görüntü yolu
            preprocess: Ön işleme yapılsın mı?
            psm_mode: Tesseract PSM modu (6=fiş, 11=etiket)
        """
        image = cv2.imread(img_path)
        if image is None:
            raise FileNotFoundError(f"Image not Found: {img_path}")

        if preprocess:
            processed = self.processImage(image)
        else:
            processed = image

        # Tesseract config
        custom_config = f'--oem 3 --psm {psm_mode}'

        # Detaylı veri çıkar
        data = pytesseract.image_to_data(
            processed,
            lang=self.languages,
            config=custom_config,
            output_type=pytesseract.Output.DICT  #datanın döneceği structure seçiyor
        )

        results = []
        n_boxes = len(data['text']) #her bir kutucuk bir text'e denk geliyor çünkü

        for i in range(n_boxes):
            if int(data['conf'][i]) < 0:
                continue

            text = data['text'][i].strip()
            if not text:
                continue

            # Bbox koordinatlarını belirle
            x = data['left'][i]
            y = data['top'][i]
            w = data['width'][i]
            h = data['height'][i]

            bbox = [
                [x, y],         # top-left
                [x+w, y],       # top-right
                [x+w, y+h],     # bottom-right
                [x, y+h]        # bottom-left
            ]
            confidence = float(data['conf'][i]) / 100  # 0-1 arası

            results.append([bbox, text, confidence])

        return results

    def readImageSimple(self, img_path, preprocess=True, psm_mode=6):
        """Sadece metin döndür (bbox olmadan)"""
        image = cv2.imread(img_path)
        if image is None:
            raise FileNotFoundError(f"Image not Found: {img_path}")

        if preprocess:
            processed = self.processImage(image)
        else:
            processed = image

        custom_config = f'--oem 3 --psm {psm_mode}'

        text = pytesseract.image_to_string(
            processed,
            lang=self.languages,
            config=custom_config
        )

        return text.strip()

    def normalize(self, text):
        text = text.upper()
        text = text.replace("İ", "I").replace("ı", "I")
        text = text.replace("Ö", "O").replace("ö", "O")
        text = text.replace("Ü", "U").replace("ü", "U")
        text = text.replace("Ş", "S").replace("ş", "S")
        text = text.replace("Ç", "C").replace("ç", "C")
        text = text.replace("Ğ", "G").replace("ğ", "G")
        return text

    def sortOcrData(self, ocr_out, pixel):
        """OCR çıktısını satırlara göre sırala"""
        words = []
        LIMIT = pixel * 0.01

        for item in ocr_out:
            box = item[0]
            text = self.normalize(item[1])
            xs = [p[0] for p in box]
            ys = [p[1] for p in box]
            x_center = sum(xs) / 4
            y_center = sum(ys) / 4
            words.append({
                "text": text,
                "x_center": x_center,
                "y_center": y_center
            })

        rows = []
        for word in words:
            placed = False
            for row in rows:
                if abs(word["y_center"] - row[0]["y_center"]) < LIMIT:
                    row.append(word)
                    placed = True
                    break
            if not placed:
                rows.append([word])

        for row in rows:
            row.sort(key=lambda item: item["x_center"])
        rows.sort(key=lambda row: row[0]["y_center"])

        line = []
        for row in rows:
            line.append(" ".join(item["text"] for item in row))
        return line