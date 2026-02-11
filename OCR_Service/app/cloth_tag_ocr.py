import time
import re
from app.ocr_processor import OCRProcessor
import numpy as np
import cv2

class ClothingLabelOCR:

    def __init__(self):
        self.ocr = OCRProcessor('tur+eng')

    def identifyLabelType(self, image_input):
        """Etiket tipini otomatik tanı (ürün mü, kumaş mü)"""
        import tempfile
        import os
        
        # Eğer numpy array ise geçici dosyaya kaydet
        if isinstance(image_input, np.ndarray):
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
            cv2.imwrite(temp_file.name, image_input)
            image_path = temp_file.name
            should_delete = True
        else:
            image_path = image_input
            should_delete = False
        
        try:
            text = self.ocr.readImageSimple(image_path, preprocess=True, psm_mode=6)
            text_upper = text.upper()

            # Kumaş etiketi işaretleri
            fabric_keywords = ['POLYESTER', 'POLIESTER', 'COTTON', 'PAMUK',
                            'WOOL', 'YÜN', 'ELASTANE', 'VISCOSE',
                            'ANA KUMAS', 'MAIN FABRIC', '%100', '100%']

            # Ürün etiketi işaretleri
            product_keywords = ['SIZE', 'BEDEN', 'KPN', 'O.N', 'BARCODE',
                            'MODEL', 'SKU', 'CM', 'WAIKIKI', 'DEFACTO',
                            'KOTON', 'MANGO', 'ZARA', 'H&M']

            fabric_score = sum(1 for keyword in fabric_keywords if keyword in text_upper)
            product_score = sum(1 for keyword in product_keywords if keyword in text_upper)

            if fabric_score > product_score:
                return 'fabric'
            else:
                return 'product'
        
        finally:
            if should_delete and os.path.exists(image_path):
                os.unlink(image_path)

    def extractProductInfo(self, image_input, debug=True):
        """Ürün etiketinden bilgileri çıkar"""
        import tempfile
        import os
        
        # Eğer numpy array ise geçici dosyaya kaydet
        if isinstance(image_input, np.ndarray):
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
            cv2.imwrite(temp_file.name, image_input)
            image_path = temp_file.name
            should_delete = True
        else:
            # Zaten bir dosya yolu
            image_path = image_input
            should_delete = False
        
        try:
            # PSM 6 kullan (düzgün metin bloğu)
            text = self.ocr.readImageSimple(image_path, preprocess=True, psm_mode=6)

            # Bilgileri çıkar
            brand = None
            product_type = None
            model_code = None
            order_number = None
            size = None
            dimensions = None
            barcode = None

            lines = text.split('\n')

            for i, line in enumerate(lines):
                line_upper = line.upper().strip()

                # Marka (bilinen markalar)
                known_brands = ['LC WAIKIKI', 'WAIKIKI', 'DEFACTO', 'KOTON',
                            'MANGO', 'ZARA', 'H&M', 'PULL&BEAR']

                for known_brand in known_brands:
                    if known_brand in line_upper and not brand:
                        brand = known_brand
                        break

                # Ürün tipi
                product_types = {
                    'ATK': 'ATKI',
                    'TALYA': 'ATKI',
                    'KAZAK': 'KAZAK',
                    'SWEATSHIRT': 'SWEATSHIRT',
                    'TISORT': 'TİŞÖRT',
                    'PANTOLON': 'PANTOLON',
                    'GOMLEK': 'GÖMLEK',
                    'CEKET': 'CEKET'
                }

                for key, value in product_types.items():
                    if key in line_upper and not product_type:
                        product_type = value

                # Model kodu (W4FO58Z8 gibi)
                model_match = re.search(r'\b[A-Z]\d[A-Z0-9]{5,8}\b', line_upper)
                if model_match and not model_code:
                    model_code = model_match.group()

                # Sipariş numarası (O.N: 1060072)
                on_match = re.search(r'O\.?N\.?[:\s]*(\d{6,8})', line_upper)
                if on_match:
                    order_number = on_match.group(1)

                # Beden (SIZE: ONE SIZE)
                size_match = re.search(r'SIZE[:\s]+([\w\s]+?)(?:\n|$)', line_upper)
                if size_match:
                    size = size_match.group(1).strip()

                # Boyut (40x225 CM)
                dim_match = re.search(r'(\d+)\s*[xX×]\s*(\d+)\s*(CM|MM)?', line_upper)
                if dim_match:
                    dimensions = f"{dim_match.group(1)}x{dim_match.group(2)} CM"

                # Barkod (13 haneli)
                barcode_match = re.search(r'\b\d{13}\b', line)
                if barcode_match:
                    barcode = barcode_match.group()

            return {
                "MARKA": brand,
                "ÜRÜN_TİPİ": product_type,
                "MODEL_KODU": model_code,
                "SİPARİŞ_NO": order_number,
                "BEDEN": size,
                "BOYUT": dimensions,
                "BARKOD": barcode
            }
        
        finally:
            # Geçici dosyayı sil
            if should_delete and os.path.exists(image_path):
                os.unlink(image_path)

    def extractFabricInfo(self, image_input, debug=True):
        import tempfile
        import os
        
        # Eğer numpy array ise geçici dosyaya kaydet
        if isinstance(image_input, np.ndarray):
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
            cv2.imwrite(temp_file.name, image_input)
            temp_file.close()
            image_path = temp_file.name
            should_delete = True
        else:
            # Zaten bir dosya yolu
            image_path = image_input
            should_delete = False
        
        try:
            # PSM 11 kullan (dağınık metin)
            text = self.ocr.readImageSimple(image_path, preprocess=True, psm_mode=11)

            fabrics = []
            # Pattern: %100 POLYESTER, 100% COTTON gibi
            fabric_materials = [
                'POLYESTER', 'POLIESTER', 'POLİESTER',
                'COTTON', 'PAMUK',
                'WOOL', 'YÜN', 'YUN',
                'ELASTANE', 'ELASTAN',
                'VISCOSE', 'VİSKOZ', 'VISKOZ',
                'ACRYLIC', 'AKRİLİK', 'AKRILIK',
                'NYLON', 'NAYLON',
                'POLYAMIDE', 'POLİAMİD'
            ]

            for material in fabric_materials:
                # %XX MATERIAL veya MATERIAL %XX formatı
                pattern1 = re.compile(rf'%?\s*(\d+)\s*%?\s*{material}', re.IGNORECASE)
                pattern2 = re.compile(rf'{material}\s*%?\s*(\d+)\s*%?', re.IGNORECASE)

                match = pattern1.search(text) or pattern2.search(text)
                if match:
                    percentage = match.group(1)
                    fabrics.append({
                        "ORAN": f"%{percentage}",
                        "MALZEME": material.upper()
                    })

            # Ana kumaş 
            main_fabric = None
            if fabrics:
                main_fabric = max(fabrics, key=lambda x: int(x["ORAN"].replace("%", "")))

            return {
                "KUMAŞ_KOMPOZİSYONU": fabrics,
                "ANA_KUMAŞ": main_fabric
            }
        
        finally:
            # Geçici dosyayı sil
            if should_delete and os.path.exists(image_path):
                try:
                    time.sleep(0.1)  # ✅ Kısa bekle
                    os.unlink(image_path)
                except PermissionError:
                    pass
