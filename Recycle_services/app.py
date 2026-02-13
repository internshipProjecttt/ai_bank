from flask import Flask, request, jsonify
import cv2
import numpy as np

from kututespit import detect_recycling_bin_from_array
from sisesayma import count_bottles_from_video

app = Flask(__name__)

#geri dönüşüm kutusu kontrolü
@app.route('/check-recycle-bin', methods=['POST'])
def check_recycle_bin():
    image = request.files.get('image')

    if not image:
        return jsonify({'error': 'No image provided'}), 400
    
    #fotoğrafı okuma işlemi
    image_data = image.read()
    np_arr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    #ocr ile kontrol et
    result = detect_recycling_bin_from_array(img)
    is_recycle_bin = result['detected'] 

    return jsonify({
        'isRecycleBin': is_recycle_bin,
        'score': result["score"],
        'confidence': result["confidence"],
        'message': "Geri dönüşüm kutusu tespit edildi." if is_recycle_bin else "Geri dönüşüm kutusu tespit edilmedi."
    })

#şişe sayma kontrolü
@app.route('/count-bottles', methods=['POST'])
def count_bottles():
    video = request.files.get('video')

    if not video:
        return jsonify({'error': 'No video provided'}), 400
    
    #videoyu okuma işlemi
    video_data = video.read()
    
    #şişe sayma işlemi
    bottle_count = count_bottles_from_video(video_data)

    return jsonify({
        'bottleCount': bottle_count,
    })

if __name__ == '__main__':
    app.run(debug=True,port=5001)
