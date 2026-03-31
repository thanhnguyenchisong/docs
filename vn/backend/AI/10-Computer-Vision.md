# Bài 10: Computer Vision & Multimodal AI

## Mục lục
- [1. Computer Vision Overview](#1-computer-vision-overview)
- [2. Image Classification & Object Detection](#2-image-classification--object-detection)
- [3. Segmentation](#3-segmentation)
- [4. Vision-Language Models (VLMs)](#4-vision-language-models-vlms)
- [5. OCR & Document AI](#5-ocr--document-ai)
- [6. Multimodal AI](#6-multimodal-ai)
- [7. Video Understanding](#7-video-understanding)
- [8. Edge Deployment](#8-edge-deployment)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. Computer Vision Overview

### 1.1 Các task CV chính

```
Computer Vision Tasks:
├── Image Classification
│   "Ảnh này là gì?" → "Cat" (1 label per image)
│
├── Object Detection
│   "Vật thể nào ở đâu?" → Bounding boxes + labels
│   [x, y, width, height, class, confidence]
│
├── Semantic Segmentation
│   "Mỗi pixel thuộc class nào?" → Pixel-level classification
│   Mỗi pixel: sky / road / car / person / ...
│
├── Instance Segmentation
│   "Chia từng object riêng?" → Mask per instance
│   Person 1, Person 2, Car 1, Car 2
│
├── Panoptic Segmentation
│   Semantic + Instance combined
│
├── Pose Estimation
│   "Skeleton/keypoints ở đâu?" → Human body joints
│
├── Depth Estimation
│   "Khoảng cách?" → Depth map from single image
│
└── Image Generation (→ Bài 9)
    "Tạo ảnh mới"
```

---

## 2. Image Classification & Object Detection

### 2.1 YOLO (You Only Look Once)

```
YOLO — Real-time Object Detection

Evolution:
├── YOLOv1 (2015): Khởi đầu real-time detection
├── YOLOv3 (2018): Multi-scale detection
├── YOLOv5 (2020): PyTorch, production-ready
├── YOLOv8 (2023): Ultralytics, unified API
├── YOLOv9 (2024): PGI, GELAN architecture
├── YOLO11 (2024): Latest Ultralytics
└── YOLOv10+ (2025-2026): NMS-free, efficiency improvements

Đặc điểm:
├── Single forward pass → real-time (30-100+ FPS)
├── Detect + Classify cùng lúc
├── Tốt cho edge devices (mobile, cameras)
└── Industry standard cho real-time detection
```

### 2.2 Code — YOLO Object Detection

```python
from ultralytics import YOLO

# Load model
model = YOLO("yolo11n.pt")  # nano (fastest)
# model = YOLO("yolo11s.pt")  # small (balanced)
# model = YOLO("yolo11m.pt")  # medium
# model = YOLO("yolo11x.pt")  # extra large (most accurate)

# Predict
results = model("image.jpg")

# Process results
for result in results:
    boxes = result.boxes
    for box in boxes:
        cls = int(box.cls[0])
        conf = float(box.conf[0])
        xyxy = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
        label = model.names[cls]
        print(f"{label}: {conf:.2f} at {xyxy}")

# Train custom model
model = YOLO("yolo11n.pt")
results = model.train(
    data="dataset.yaml",    # Custom dataset
    epochs=100,
    imgsz=640,
    batch=16,
    device="cuda"
)

# Export for deployment
model.export(format="onnx")       # ONNX (cross-platform)
model.export(format="tflite")     # TensorFlow Lite (mobile)
model.export(format="coreml")     # CoreML (iOS)
```

### 2.3 So sánh Detection Models 2026

| Model | mAP | Speed | Use Case |
|-------|-----|-------|----------|
| **YOLO11x** | ~55.0 | 100+ FPS | Real-time, general |
| **DINO + Swin** | ~63.0 | 5 FPS | High accuracy, offline |
| **Grounding DINO** | Open-vocab | 10 FPS | Zero-shot detection |
| **RT-DETR** | ~54.0 | 100+ FPS | Transformer-based, real-time |
| **Co-DETR** | ~64.0 | 5 FPS | SOTA accuracy |

---

## 3. Segmentation

### 3.1 SAM 2 — Segment Anything Model 2

```
SAM 2 (Meta, 2024-2025):
├── Segment ANY object trong image/video
├── Zero-shot: không cần training trên specific objects
├── Prompt types:
│   ├── Point prompt: Click on object
│   ├── Box prompt: Draw bounding box
│   ├── Text prompt: Describe object
│   └── Auto: Segment everything
├── Video: Track objects across frames
└── Foundation model cho segmentation

Applications:
├── Medical imaging: Segment tumors, organs
├── Autonomous driving: Segment road, pedestrians
├── Video editing: Background removal
├── Agriculture: Crop analysis
└── Manufacturing: Defect detection
```

### 3.2 Code — SAM 2

```python
from segment_anything import sam_model_registry, SamPredictor

# Load SAM
sam = sam_model_registry["vit_h"](checkpoint="sam_vit_h.pth")
predictor = SamPredictor(sam)

# Set image
predictor.set_image(image)

# Point prompt — click vào object
masks, scores, logits = predictor.predict(
    point_coords=np.array([[500, 375]]),  # [x, y]
    point_labels=np.array([1]),           # 1=foreground, 0=background
    multimask_output=True                 # Return 3 masks
)

# Box prompt — bounding box
masks, scores, logits = predictor.predict(
    box=np.array([100, 100, 400, 400]),  # [x1, y1, x2, y2]
    multimask_output=False
)

# Automatic mask generation — segment everything
from segment_anything import SamAutomaticMaskGenerator
mask_generator = SamAutomaticMaskGenerator(sam)
masks = mask_generator.generate(image)
# Returns list of masks for ALL objects in image
```

---

## 4. Vision-Language Models (VLMs)

### 4.1 VLMs — Image + Text Understanding

```
VLM: Model hiểu CẢ hình ảnh VÀ ngôn ngữ

Capabilities:
├── Image Description: "Describe this image"
├── Visual Q&A: "How many people in this photo?"
├── OCR: Read text from images  
├── Charts/Diagrams: Interpret charts, graphs, diagrams
├── Screenshot Analysis: Understand UIs, websites
├── Comparison: "What's different between these 2 images?"
└── Reasoning: "What will happen next in this scene?"

Top VLMs 2026:
├── GPT-4o/4V (OpenAI) — Strong general understanding
├── Claude 4 Vision (Anthropic) — Document analysis, charts
├── Gemini 2.5 Vision (Google) — Video understanding, multi-image  
├── Llama 4 Vision (Meta) — Open-weight
├── Qwen-VL 3 (Alibaba) — Multilingual, open
└── InternVL 3 (Shanghai AI Lab) — Open, competitive
```

### 4.2 Code — Using VLMs

```python
import anthropic
import base64

client = anthropic.Anthropic()

# Read image
with open("chart.png", "rb") as f:
    image_data = base64.standard_b64encode(f.read()).decode("utf-8")

# Analyze image with Claude Vision
response = client.messages.create(
    model="claude-4-sonnet",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": image_data
                }
            },
            {
                "type": "text",
                "text": "Analyze this chart. What are the key trends? Extract all data points."
            }
        ]
    }]
)

print(response.content[0].text)
# Detailed analysis of chart with extracted data
```

---

## 5. OCR & Document AI

### 5.1 OCR Evolution

```
Traditional OCR → Document AI:

Traditional OCR (Tesseract):
├── Text extraction only
├── Requires good image quality
├── No layout understanding
└── Limited language support

Modern Document AI (2026):
├── Layout understanding (tables, forms, headers)
├── Key-Value extraction (name: John, date: 2026-01-01)
├── Table extraction → structured data
├── Handwriting OCR
├── Multi-language support
├── VLM-based: "Read this receipt and extract items + prices"
└── End-to-end: Image → Structured JSON

Tools:
├── Google Document AI — Enterprise, accurate
├── AWS Textract — Tables, forms, handwriting
├── Azure Document Intelligence — Forms, invoices
├── PaddleOCR — Open-source, multi-language (good for Vietnamese)
├── EasyOCR — Open-source, 80+ languages
├── Surya OCR — Open-source, accurate
└── VLMs (GPT-4V, Claude Vision) — Most flexible, general
```

### 5.2 Document Processing Pipeline

```python
# Modern approach: VLM for Document AI

def process_invoice(image_path: str) -> dict:
    """Extract structured data from invoice image"""
    
    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode()
    
    response = client.messages.create(
        model="claude-4-sonnet",
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": image_data}},
                {"type": "text", "text": """
                Extract from this invoice:
                {
                    "invoice_number": "",
                    "date": "",
                    "vendor": "",
                    "items": [{"name": "", "quantity": 0, "price": 0.0}],
                    "subtotal": 0.0,
                    "tax": 0.0,
                    "total": 0.0
                }
                Return ONLY valid JSON.
                """}
            ]
        }],
        response_format={"type": "json_object"}
    )
    return json.loads(response.content[0].text)
```

---

## 6. Multimodal AI

### 6.1 Multimodal = Hiểu nhiều loại dữ liệu

```
Multimodal AI: Process text + image + audio + video CÙNG LÚC

Unified Architecture (2026):
├── KHÔNG phải: Text model + Image model + Audio model (stitched)
├── MÀ LÀ: Single model that natively processes ALL modalities

GPT-4o: Text + Image + Audio → Text + Audio
Gemini 2.5: Text + Image + Audio + Video → Text + Audio + Image
Claude 4: Text + Image → Text (+ future audio)

Multimodal Embeddings:
  Text:  "a cat on a mat" → [0.5, 0.3, ...]
  Image: 🐱🧶             → [0.48, 0.31, ...]  ← similar!
  Audio: "meow" sound     → [0.45, 0.28, ...]  ← similar!
  
  → Same vector space for ALL modalities
  → Cross-modal search: text query → find images/videos
```

### 6.2 Applications

```
Multimodal Applications:
├── Visual Q&A: "What brand is this product?" (image + text)
├── Video Analysis: Summarize meeting recording (video + audio + text)
├── Accessibility: Image descriptions for blind users
├── E-commerce: Product search by image
├── Healthcare: Medical image + patient history → diagnosis support
├── Robotics: See + hear + understand environment
├── Security: Video surveillance + anomaly detection
└── Education: Interactive learning with images + diagrams
```

---

## 7. Video Understanding

### 7.1 Video Analysis Tasks

```
Video Understanding Tasks:
├── Action Recognition: "What activity?" (running, cooking)
├── Video Classification: Categorize video content
├── Temporal Segmentation: Where does scene change?
├── Video QA: Answer questions about video content
├── Video Summarization: Key frames / summary
├── Object Tracking: Follow object across frames
├── Event Detection: Detect specific events (fall, fight)
└── Video Captioning: Generate text description

Models:
├── Gemini 2.5 Pro — Natively processes video (up to hours)
├── GPT-4o — Frame-based video understanding
├── VideoLLaMA — Open-source video LLM
├── InternVideo — Video foundation model
└── TimeSformer — Video Transformer
```

---

## 8. Edge Deployment

### 8.1 Deploy CV Models lên Edge

```
Edge = Deploy models on device (phone, camera, IoT)

Why Edge?
├── Latency: No network round-trip → real-time
├── Privacy: Data stays on device
├── Cost: No cloud compute fees
├── Offline: Works without internet
└── Scale: Millions of devices

Optimization Pipeline:
  Full Model (FP32)
    ↓ Quantization (INT8/INT4)
    ↓ Pruning (remove unnecessary weights)
    ↓ Knowledge Distillation (train smaller model)  
    ↓ ONNX Export (cross-platform)
    ↓ TensorRT / CoreML / TFLite conversion
    ↓ Deploy on Edge Device

Frameworks:
├── ONNX Runtime — Cross-platform inference
├── TensorRT — NVIDIA GPU (Jetson, data center)
├── CoreML — Apple devices (iPhone, iPad)
├── TFLite — Android, embedded
├── OpenVINO — Intel hardware
└── NCNN — Mobile (Tencent, lightweight)

Model Size Guidelines:
├── Mobile: < 10 MB (MobileNet, EfficientNet-Lite)
├── Edge GPU (Jetson): < 100 MB (YOLO, ResNet-50)
├── Desktop GPU: < 1 GB (any model)
└── Cloud: Unlimited
```

---

## FAQ & Best Practices

### Q1: YOLO hay Transformer-based detection?
**A:**
```
YOLO (CNN-based):
├── ✅ Real-time (30-100+ FPS)
├── ✅ Edge deployment friendly
├── ✅ Well-established ecosystem
└── Dùng: Real-time apps, cameras, mobile

Transformer-based (DETR, DINO):
├── ✅ Higher accuracy
├── ✅ Better at complex scenes
├── ❌ Slower (5-15 FPS)
└── Dùng: Offline analysis, high-accuracy requirements
```

### Q2: Khi nào dùng VLM thay vì specialized CV model?
**A:**
```
Dùng VLM (GPT-4V, Claude Vision) khi:
├── General understanding (describe, Q&A)
├── Document/chart analysis
├── Rapid prototyping
├── No labeled data for training
└── One-off analysis

Dùng Specialized Model (YOLO, SAM) khi:
├── Real-time requirements
├── High throughput (1000+ images/sec)
├── Edge deployment
├── Specific task (detection, segmentation)
└── Cost-sensitive (VLM API expensive per image)
```

### Best Practices

1. **Pre-trained models first** — Don't train from scratch
2. **Data augmentation** — Rotate, flip, crop, color jitter
3. **Quantize for edge** — INT8 giảm 4× size, gần 0 accuracy loss
4. **YOLO for real-time** — Industry standard, well-supported
5. **VLM for understanding** — Best for general analysis
6. **SAM for segmentation** — Zero-shot, versatile

---

## Bài tập thực hành

### Bài 1: Object Detection
1. Train YOLO11 trên custom dataset (10-20 classes)
2. Test real-time detection với webcam
3. Export model → ONNX → measure inference speed

### Bài 2: VLM Analysis
1. Dùng Claude Vision / GPT-4V phân tích 10 charts
2. Extract structured data (JSON) từ invoice images
3. Build document processing pipeline

### Bài 3: Multimodal Search
1. Build image search engine: text query → find similar images
2. Dùng CLIP embeddings
3. Compare with VLM-based search

---

**Tiếp theo:** [Bài 11: Vector Databases & Embeddings →](./11-Vector-Databases-Embeddings.md)
