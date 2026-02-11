import cv2
import numpy as np
from ultralytics import YOLO
import tempfile
import os

class BottleCounter:
    def __init__(self, model_name="yolov8n.pt"):
        self.model = YOLO(model_name)

        # Sadece bottle class
        self.target_classes = ["bottle"]

        # Tracking
        self.tracks = {}
        self.next_id = 0
        self.counted_ids = set()
        self.total_count = 0

        # Ayarlar
        self.iou_threshold = 0.2   # tracking hassasiyeti
        self.line_ratio = 0.6      # çizgi yüksekliği (frame * 0.6)
        self.min_move = 15         # minimum hareket (px)

    def iou(self, box1, box2):
        x1, y1, x2, y2 = box1
        x1b, y1b, x2b, y2b = box2

        xi1 = max(x1, x1b)
        yi1 = max(y1, y1b)
        xi2 = min(x2, x2b)
        yi2 = min(y2, y2b)

        if xi2 < xi1 or yi2 < yi1:
            return 0

        inter = (xi2 - xi1) * (yi2 - yi1)
        area1 = (x2 - x1) * (y2 - y1)
        area2 = (x2b - x1b) * (y2b - y1b)

        return inter / (area1 + area2 - inter + 1e-6)

    def detect(self, frame):
        results = self.model(frame, verbose=False)[0]
        detections = []

        for box in results.boxes:
            cls_id = int(box.cls[0])
            cls_name = results.names[cls_id]
            conf = float(box.conf[0])

            if cls_name in self.target_classes and conf > 0.5:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                cx = int((x1 + x2) / 2)
                cy = int((y1 + y2) / 2)

                detections.append({
                    "bbox": (int(x1), int(y1), int(x2), int(y2)),
                    "center": (cx, cy)
                })

        return detections

    def update_tracks(self, detections, frame_height):
        line_y = int(frame_height * self.line_ratio)

        matched_ids = set()

        for det in detections:
            best_id = None
            best_iou = 0

            for tid, track in self.tracks.items():
                score = self.iou(det["bbox"], track["bbox"])
                if score > self.iou_threshold and score > best_iou:
                    best_iou = score
                    best_id = tid

            if best_id is not None:
                # mevcut track güncelle
                track = self.tracks[best_id]
                track["bbox"] = det["bbox"]
                track["centers"].append(det["center"])
                matched_ids.add(best_id)

                # çizgi geçme kontrolü
                if len(track["centers"]) >= 2:
                    y_prev = track["centers"][-2][1]
                    y_curr = track["centers"][-1][1]

                    if (y_prev < line_y and y_curr > line_y and
                        abs(y_curr - y_prev) > self.min_move and
                        best_id not in self.counted_ids):

                        self.total_count += 1
                        self.counted_ids.add(best_id)
                        print(f"🍾 Şişe sayıldı! Toplam = {self.total_count}")

            else:
                # yeni track
                self.tracks[self.next_id] = {
                    "bbox": det["bbox"],
                    "centers": [det["center"]]
                }
                self.next_id += 1

        # eski trackleri temizle (çok eskiyse)
        remove_ids = []
        for tid in self.tracks:
            if tid not in matched_ids:
                if len(self.tracks[tid]["centers"]) > 10:
                    remove_ids.append(tid)

        for tid in remove_ids:
            del self.tracks[tid]

        return line_y

def count_bottles(video_path):
    cap = cv2.VideoCapture(video_path)
    counter = BottleCounter("yolov8n.pt")

    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        detections = counter.detect(frame)
        line_y = counter.update_tracks(detections, h)

        # çizgi çiz
        cv2.line(frame, (0, line_y), (frame.shape[1], line_y), (0, 0, 255), 2)

        # bbox çiz
        for det in detections:
            x1, y1, x2, y2 = det["bbox"]
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

        cv2.putText(frame, f"Count: {counter.total_count}",
                    (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)

        # cv2.imshow("Bottle Counter", frame)

        # if cv2.waitKey(1) & 0xFF == 27:  # ESC
        #     break

    cap.release()
    # cv2.destroyAllWindows()

    print(f"\n✅ Toplam şişe sayısı: {counter.total_count}")

    return counter.total_count


if __name__ == "__main__":
    video_path = input("Video yolu: ").strip().strip('"')
    count_bottles(video_path)

def count_bottles_from_video(video_bytes):
    
    # Geçici bir dosya yolu oluştur
    temp_video_path = tempfile.mktemp(suffix=".mp4")
    
    # Gönderilen videoyu bu dosyaya kaydet
    with open(temp_video_path, "wb") as f:
        f.write(video_bytes)  # Artık gerçekten gönderilen videoyu kaydediyoruz
    
    # Videoyu analiz et
    result = count_bottles(temp_video_path)
    
    # Geçici dosyayı sil
    if os.path.exists(temp_video_path):
        os.remove(temp_video_path)
    
    return result

