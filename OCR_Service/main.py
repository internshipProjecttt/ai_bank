from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
from app.receipt_ocr import ReceiptOCR
from app.cloth_tag_ocr import ClothingLabelOCR

app = Flask(__name__)
CORS(app)

receipt_ocr = ReceiptOCR()
label_ocr = ClothingLabelOCR()

# Helper Function - Resmi HTTP'den al
def get_image_from_request():
    """Flask request'inden görüntüyü al"""
    if 'file' not in request.files:
        raise ValueError("No file in request")
    
    file = request.files['file']
    if file.filename == '':
        raise ValueError("Empty filename")
    
    # Byte array'e çevir
    file_bytes = file.read()
    
    # Numpy array'e çevir
    nparr = np.frombuffer(file_bytes, np.uint8)
    
    # OpenCV görüntüsüne decode et
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Failed to decode image")
    
    return img


@app.route('/health', methods=['GET'])
def health():
    """Servis sağlık kontrolü"""
    return jsonify({"status": "healthy", "service": "OCR Service"}), 200


@app.route('/api/ocr/receipt', methods=['POST'])
def processReceipt():
    """Fiş işleme endpoint"""
    try:
        # 1. Görüntüyü al (numpy array)
        img = get_image_from_request()
        
        # 2. Search item (opsiyonel)
        search_item = request.form.get("searchItem", None)

        # 3. OCR işlemi - IMAGE GÖNDERİYORUZ (string değil)
        result = receipt_ocr.extractInfo(img, search_item)  # ✅ img (numpy array)

        # 4. JSON döndür
        return jsonify({
            "success": True,
            "data": result
        }), 200

    except ValueError as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400
    except Exception as e:
        import traceback
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

    
@app.route('/api/ocr/label', methods=['POST'])
def processLabel():
    """Etiket işleme endpoint"""
    try:
        # 1. Görüntüyü al (numpy array)
        img = get_image_from_request()

        # 2. OCR işlemi - IMAGE GÖNDERİYORUZ
        result = label_ocr.extractInfo(img)  # ✅ img (numpy array)

        # 3. JSON döndür
        return jsonify({
            "success": True,
            "data": result
        }), 200

    except ValueError as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400
    except Exception as e:
        import traceback
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

    
if __name__ == '__main__':
    print("🚀 OCR Service starting on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)