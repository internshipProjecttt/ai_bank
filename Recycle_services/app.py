from flask import Flask, request, jsonify
import cv2
import numpy as np
import os

from kututespit import detect_recycling_bin_from_array
from sisesayma import count_bottles_from_video

app = Flask(__name__)


@app.route("/")
def home():
    return "API çalışıyor 🚀"

@app.route("/analyze", methods=["POST"])
def analyze():
    try:  # Hata yakalamak için try-except ekledim
        # Fotoğrafı al
        image_file = request.files.get("image")
        video_file = request.files.get("video")

        if not image_file or not video_file:
            return jsonify({"error": "Hem fotoğraf hem de video gereklidir."}), 400

        # Fotoğrafı OpenCV formatına çevir
        img_bytes = image_file.read()
        np_arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Kutu tespiti - FONKSİYON ADI DÜZELTİLDİ
        bin_found = detect_recycling_bin_from_array(img)

        if not bin_found:
            return jsonify({
                "bin_detected": False,
                "bottle_count": 0
            })

        # Video şişe sayma
        video_bytes = video_file.read()
        count = count_bottles_from_video(video_bytes)

        return jsonify({
            "bin_detected": True,
            "bottle_count": count
        })
    
    except Exception as e:
        # Hataları görmek için log ekledim
        print(f"HATA: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)