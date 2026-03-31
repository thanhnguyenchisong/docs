# Bài 2: Deep Learning & Neural Networks

## Mục lục
- [1. Neural Network cơ bản](#1-neural-network-cơ-bản)
- [2. Activation Functions](#2-activation-functions)
- [3. Backpropagation & Gradient Descent](#3-backpropagation--gradient-descent)
- [4. CNN — Convolutional Neural Networks](#4-cnn--convolutional-neural-networks)
- [5. RNN, LSTM, GRU](#5-rnn-lstm-gru)
- [6. Regularization Techniques](#6-regularization-techniques)
- [7. PyTorch vs TensorFlow](#7-pytorch-vs-tensorflow)
- [8. Training Best Practices](#8-training-best-practices)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. Neural Network cơ bản

### 1.1 Perceptron → Neural Network

```
Perceptron (1 neuron):
  x₁ ──w₁──┐
  x₂ ──w₂──┤→ Σ(wᵢxᵢ + b) → Activation(z) → output
  x₃ ──w₃──┘
  
  z = w₁x₁ + w₂x₂ + w₃x₃ + b    ← linear combination
  a = σ(z)                         ← activation function
  
Neural Network = Nhiều perceptrons kết nối thành layers:

Input Layer    Hidden Layers       Output Layer
  (x)           (features)          (prediction)
  
  ○──────┐   ┌──○──┐   ┌──○──┐   ┌──○
  ○──────┤───┤──○──┤───┤──○──┤───┤──○
  ○──────┤   ├──○──┤   ├──○──┤   └──○
  ○──────┘   └──○──┘   └──○──┘
  
  Layer 0      Layer 1     Layer 2     Layer 3
  (4 nodes)   (4 nodes)   (4 nodes)   (3 nodes)
```

### 1.2 Deep Neural Network

```
"Deep" = nhiều hidden layers (thường 3+)

Tại sao "deep" tốt hơn "wide"?
├── Layer 1: Học features đơn giản (edges, colors)
├── Layer 2: Kết hợp thành patterns (shapes, textures)
├── Layer 3: Nhận dạng objects (mắt, mũi, tai)
├── Layer 4: Nhận dạng concepts (khuôn mặt, động vật)
└── → Hierarchical feature learning

Số lượng parameters:
├── Layer 1 (input 784 → hidden 256):  784 × 256 + 256 = 200,960
├── Layer 2 (hidden 256 → hidden 128): 256 × 128 + 128 = 32,896
├── Layer 3 (hidden 128 → output 10):  128 × 10  + 10  = 1,290
└── Total: 235,146 parameters
```

### 1.3 Code — Neural Network với PyTorch

```python
import torch
import torch.nn as nn
import torch.optim as optim

class SimpleNN(nn.Module):
    def __init__(self, input_size, hidden_size, num_classes):
        super(SimpleNN, self).__init__()
        self.layer1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()
        self.layer2 = nn.Linear(hidden_size, hidden_size)
        self.layer3 = nn.Linear(hidden_size, num_classes)
        self.dropout = nn.Dropout(0.3)
    
    def forward(self, x):
        x = self.relu(self.layer1(x))
        x = self.dropout(x)
        x = self.relu(self.layer2(x))
        x = self.dropout(x)
        x = self.layer3(x)
        return x

# Khởi tạo
model = SimpleNN(input_size=784, hidden_size=256, num_classes=10)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Training loop
for epoch in range(100):
    model.train()
    optimizer.zero_grad()
    
    outputs = model(X_train)
    loss = criterion(outputs, y_train)
    loss.backward()              # Backpropagation
    optimizer.step()             # Update weights
    
    if (epoch + 1) % 10 == 0:
        print(f'Epoch [{epoch+1}/100], Loss: {loss.item():.4f}')
```

---

## 2. Activation Functions

### 2.1 So sánh Activation Functions

```
Sigmoid: σ(x) = 1 / (1 + e⁻ˣ)
├── Output: (0, 1)
├── Ưu: Probabilistic interpretation
├── Nhược: Vanishing gradient, NOT zero-centered
└── Dùng: Output layer (binary classification)

Tanh: tanh(x) = (eˣ - e⁻ˣ) / (eˣ + e⁻ˣ)
├── Output: (-1, 1)
├── Ưu: Zero-centered
├── Nhược: Vanishing gradient vẫn xảy ra
└── Dùng: Hidden layers (ít dùng hiện tại)

ReLU: f(x) = max(0, x)
├── Output: [0, ∞)
├── Ưu: Nhanh, không vanishing gradient
├── Nhược: "Dying ReLU" — neurons chết (output = 0 forever)
└── Dùng: Default cho hidden layers

Leaky ReLU: f(x) = max(αx, x), α=0.01
├── Output: (-∞, ∞)
├── Ưu: Giải quyết dying ReLU
└── Dùng: Thay thế ReLU khi cần

GELU: f(x) = x × Φ(x) (Gaussian Error Linear Unit)
├── Ưu: Smooth, differentiable everywhere
├── Dùng: Transformer models (BERT, GPT mặc định)
└── Lý do: Tốt hơn ReLU cho NLP tasks

SiLU/Swish: f(x) = x × σ(x)
├── Ưu: Self-gated, smooth
└── Dùng: Vision models (EfficientNet, ConvNeXt)

Softmax: σ(xᵢ) = eˣⁱ / Σeˣʲ
├── Output: [0, 1] cho mỗi class, tổng = 1
└── Dùng: Output layer cho multi-class classification
```

### 2.2 Quy tắc chọn Activation

```
┌──────────────────────────────────────────────────────┐
│ Task / Layer          │ Activation khuyên dùng        │
├───────────────────────┼──────────────────────────────┤
│ Hidden layers (MLP)   │ ReLU hoặc Leaky ReLU         │
│ Hidden (Transformer)  │ GELU                          │
│ Hidden (CNN modern)   │ SiLU / Swish                  │
│ Binary classification │ Sigmoid (output layer)        │
│ Multi-class           │ Softmax (output layer)        │
│ Regression            │ None / Linear (output layer)  │
└──────────────────────────────────────────────────────┘
```

---

## 3. Backpropagation & Gradient Descent

### 3.1 Backpropagation — Thuật toán cốt lõi

```
Training Neural Network = Tối ưu hóa weights để minimize loss

Forward Pass (tính toán):
  Input x → Layer 1 → Layer 2 → ... → Output ŷ → Loss L(y, ŷ)

Backward Pass (học):
  Loss L → ∂L/∂w₃ → ∂L/∂w₂ → ∂L/∂w₁
  (Chain Rule: ∂L/∂w = ∂L/∂a × ∂a/∂z × ∂z/∂w)

Weight Update:
  w_new = w_old - learning_rate × gradient
  w = w - η × ∂L/∂w
```

### 3.2 Gradient Descent Variants

```
1. Batch Gradient Descent (BGD):
   ├── Dùng TOÀN BỘ dataset để tính gradient
   ├── Ưu: Stable convergence
   └── Nhược: Rất chậm, tốn RAM

2. Stochastic Gradient Descent (SGD):
   ├── Dùng 1 sample để tính gradient
   ├── Ưu: Nhanh, có thể escape local minima
   └── Nhược: Noisy, unstable

3. Mini-batch Gradient Descent:  ← THỰC TẾ DÙNG
   ├── Dùng batch_size samples (32, 64, 128, 256)
   ├── Cân bằng giữa BGD và SGD
   └── GPU-friendly (parallel computation)
```

### 3.3 Optimizers

```python
# SGD + Momentum
optimizer = optim.SGD(model.parameters(), lr=0.01, momentum=0.9)
# Momentum: dùng "quán tính" từ gradient trước → nhanh converge

# Adam (Adaptive Moment Estimation) — MẶC ĐỊNH CHỌN
optimizer = optim.Adam(model.parameters(), lr=0.001, betas=(0.9, 0.999))
# Kết hợp Momentum + Adaptive learning rate per parameter

# AdamW (Adam with Weight Decay) — CHO TRANSFORMER
optimizer = optim.AdamW(model.parameters(), lr=5e-5, weight_decay=0.01)
# Decoupled weight decay → tốt hơn Adam cho fine-tuning LLMs

# Learning Rate Scheduler
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=100)
# Giảm lr theo cosine → smooth convergence

# Quy tắc vàng chọn optimizer:
# ┌───────────────────────────────────────────────┐
# │ Task                  │ Optimizer khuyên dùng  │
# ├───────────────────────┼───────────────────────┤
# │ General / Default     │ Adam (lr=1e-3)         │
# │ Fine-tuning LLM       │ AdamW (lr=5e-5)        │
# │ Computer Vision       │ SGD + Momentum          │
# │ Small dataset         │ Adam → switch SGD       │
# └───────────────────────────────────────────────┘
```

---

## 4. CNN — Convolutional Neural Networks

### 4.1 Kiến trúc CNN

```
CNN dùng cho dữ liệu có "spatial structure" (image, signal)

Input Image (3×224×224)
  │
  ▼ Conv2d(3, 64, kernel=3×3) + ReLU
  │ ← Feature Maps: phát hiện edges
  ▼ Conv2d(64, 64, kernel=3×3) + ReLU
  │
  ▼ MaxPool2d(2×2) — giảm resolution
  │
  ▼ Conv2d(64, 128, kernel=3×3) + ReLU
  │ ← Feature Maps: phát hiện shapes
  ▼ Conv2d(128, 128, kernel=3×3) + ReLU
  │
  ▼ MaxPool2d(2×2)
  │
  ▼ Flatten()
  ▼ Linear(128×56×56, 512) + ReLU + Dropout
  ▼ Linear(512, num_classes)
  ▼ Softmax → Prediction

Các khái niệm CNN:
├── Convolution: "cửa sổ trượt" trích xuất features
├── Kernel/Filter: ma trận weights (3×3, 5×5)
├── Stride: bước nhảy kernel
├── Padding: thêm zeros viền ngoài
├── Pooling: giảm kích thước (Max, Average)
└── Feature Map: output của convolution
```

### 4.2 Code — CNN với PyTorch

```python
class CNN(nn.Module):
    def __init__(self, num_classes=10):
        super(CNN, self).__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
        )
        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(128 * 56 * 56, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes)
        )
    
    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)   # Flatten
        x = self.classifier(x)
        return x
```

### 4.3 CNN Architectures Timeline

| Năm | Model | Đặc điểm | Params |
|-----|-------|-----------|--------|
| 2012 | AlexNet | Khởi đầu Deep Learning revolution | 60M |
| 2014 | VGG-16 | Deep stacking 3×3 convolutions | 138M |
| 2014 | GoogLeNet | Inception modules (multi-scale) | 6.8M |
| 2015 | ResNet | Skip connections → train 152 layers | 25M |
| 2017 | DenseNet | Dense connections → feature reuse | 8M |
| 2019 | EfficientNet | Compound scaling | 5.3M |
| 2022 | ConvNeXt | "Modernized ResNet" → compete ViT | 88M |
| 2024 | ConvNeXt V2 | + MAE pre-training | 88M |

---

## 5. RNN, LSTM, GRU

### 5.1 RNN — Recurrent Neural Network

```
RNN: Xử lý dữ liệu tuần tự (text, time series, speech)

  x₁ → [h₁] → x₂ → [h₂] → x₃ → [h₃] → ... → output
         ↑            ↑            ↑
       HIDDEN STATE truyền thông tin qua thời gian

  hₜ = tanh(Wₓxₜ + Wₕhₜ₋₁ + b)
  
  ⚠️ Vấn đề: Vanishing/Exploding Gradients
  → Không nhớ được thông tin dài hạn
  → Giải pháp: LSTM, GRU
```

### 5.2 LSTM — Long Short-Term Memory

```
LSTM giải quyết vanishing gradient bằng "cell state" + 3 gates:

  ┌─────────────────────────────────────────┐
  │                Cell State (Cₜ)           │
  │  ← Forget Gate ── Input Gate ──→         │
  │                                          │
  │  Forget Gate (fₜ): Quên thông tin cũ     │
  │  Input Gate (iₜ):  Thêm thông tin mới    │
  │  Output Gate (oₜ): Quyết định output     │
  └─────────────────────────────────────────┘

  fₜ = σ(Wf · [hₜ₋₁, xₜ] + bf)     ← Forget: quên gì?
  iₜ = σ(Wi · [hₜ₋₁, xₜ] + bi)     ← Input: nhớ gì mới?
  C̃ₜ = tanh(Wc · [hₜ₋₁, xₜ] + bc)  ← Candidate cell state
  Cₜ = fₜ ⊙ Cₜ₋₁ + iₜ ⊙ C̃ₜ         ← Update cell state
  oₜ = σ(Wo · [hₜ₋₁, xₜ] + bo)     ← Output: trả ra gì?
  hₜ = oₜ ⊙ tanh(Cₜ)               ← Hidden state
```

### 5.3 GRU — Gated Recurrent Unit

```
GRU = LSTM đơn giản hóa (2 gates thay vì 3):

  Reset Gate (rₜ): Quyết định quên hidden state cũ
  Update Gate (zₜ): Quyết định giữ state cũ hay thêm mới
  
  Ít parameters hơn LSTM → nhanh hơn
  Thường performance tương đương LSTM
```

### 5.4 RNN vs LSTM vs GRU vs Transformer

| Tiêu chí | RNN | LSTM | GRU | Transformer |
|----------|-----|------|-----|-------------|
| Long-range | ❌ | ✅ | ✅ | ✅✅ |
| Speed | ✅ | ❌ | ⚡ | ✅✅ (parallel) |
| Params | Ít | Nhiều | Trung bình | Rất nhiều |
| Parallelizable | ❌ | ❌ | ❌ | ✅ |
| Phổ biến 2026 | ❌ | ⚠️ Legacy | ⚠️ Legacy | ✅✅ Dominant |

```
⚠️ LƯU Ý QUAN TRỌNG (2026):
  Transformer đã THAY THẾ RNN/LSTM cho hầu hết NLP tasks.
  LSTM/GRU vẫn dùng cho:
  - Time series forecasting (edge devices, low latency)
  - Embedded systems (ít memory)
  - Simple sequence tasks
  
  Còn lại → Transformer-based models
```

---

## 6. Regularization Techniques

### 6.1 Chống Overfitting trong Deep Learning

```
1. Dropout
   ├── Ngẫu nhiên "tắt" neurons trong training
   ├── Thường: p=0.3–0.5
   ├── ⚠️ Chỉ active khi model.train()
   └── model.eval() → tắt dropout

2. Batch Normalization
   ├── Normalize activation giữa layers
   ├── Giảm "Internal Covariate Shift"
   ├── Cho phép learning rate lớn hơn
   └── Dùng TRƯỚC activation (hoặc sau — cả hai đều ok)

3. Layer Normalization
   ├── Normalize across features (thay vì across batch)
   ├── Dùng cho Transformer (thay BatchNorm)
   └── Không phụ thuộc batch size

4. Weight Decay (L2 Regularization)
   ├── Thêm ||w||² vào loss → penalize large weights
   └── AdamW: decoupled weight decay → chuẩn cho LLMs

5. Data Augmentation
   ├── Image: rotate, flip, crop, color jitter
   ├── Text: synonym replacement, back-translation
   └── Tạo thêm data giả từ data thật

6. Early Stopping
   ├── Dừng training khi validation loss tăng
   ├── Patience: chờ N epochs trước khi dừng
   └── Restore best model weights
```

### 6.2 Code — Regularization

```python
class RegularizedModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.layer1 = nn.Linear(784, 256)
        self.bn1 = nn.BatchNorm1d(256)     # Batch Norm
        self.layer2 = nn.Linear(256, 128)
        self.ln2 = nn.LayerNorm(128)        # Layer Norm
        self.layer3 = nn.Linear(128, 10)
        self.dropout = nn.Dropout(0.4)      # Dropout
    
    def forward(self, x):
        x = self.dropout(torch.relu(self.bn1(self.layer1(x))))
        x = self.dropout(torch.relu(self.ln2(self.layer2(x))))
        return self.layer3(x)

# Training với Early Stopping
best_val_loss = float('inf')
patience = 10
counter = 0

for epoch in range(1000):
    model.train()
    # ... training ...
    
    model.eval()
    with torch.no_grad():
        val_loss = criterion(model(X_val), y_val)
    
    if val_loss < best_val_loss:
        best_val_loss = val_loss
        counter = 0
        torch.save(model.state_dict(), 'best_model.pth')
    else:
        counter += 1
        if counter >= patience:
            print(f'Early stopping at epoch {epoch}')
            model.load_state_dict(torch.load('best_model.pth'))
            break
```

---

## 7. PyTorch vs TensorFlow

### 7.1 So sánh (Tình hình 2026)

| Tiêu chí | PyTorch | TensorFlow |
|----------|---------|------------|
| **Phổ biến** | ✅✅ Research + Production | ⚠️ Giảm dần |
| **API style** | Pythonic, imperative | Declarative + Keras |
| **Debug** | ✅ Easy (standard Python) | ⚠️ Graph mode khó debug |
| **Research** | ✅✅ Dominant (90%+ papers) | ❌ Ít dùng |
| **Production** | ✅ TorchServe, ONNX | ✅ TF Serving, TF Lite |
| **Mobile/Edge** | ⚡ PyTorch Mobile | ⚡ TF Lite (mature) |
| **Community** | ✅ Lớn, active | ⚠️ Đang shrink |
| **LLM ecosystem** | ✅ Hugging Face mặc định | ❌ Ít hỗ trợ |

```
💡 KẾT LUẬN 2026:
  ✅ PyTorch là LỰA CHỌN MẶC ĐỊNH cho hầu hết mọi thứ
  ✅ Edge/Mobile: xem xét TF Lite hoặc ONNX
  ✅ Hugging Face (LLMs) → PyTorch là first-class
  
  Bắt đầu mới → CHỌN PYTORCH
```

### 7.2 PyTorch Training Template

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

# Device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Model
model = SimpleNN(input_size=784, hidden_size=256, num_classes=10).to(device)

# Loss & Optimizer
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=50)

# Data Loader
train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)

# Training Loop
for epoch in range(50):
    model.train()
    total_loss = 0
    correct = 0
    total = 0
    
    for batch_X, batch_y in train_loader:
        batch_X, batch_y = batch_X.to(device), batch_y.to(device)
        
        optimizer.zero_grad()
        outputs = model(batch_X)
        loss = criterion(outputs, batch_y)
        loss.backward()
        
        # Gradient clipping — chống exploding gradients
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        
        optimizer.step()
        
        total_loss += loss.item()
        _, predicted = outputs.max(1)
        total += batch_y.size(0)
        correct += predicted.eq(batch_y).sum().item()
    
    scheduler.step()
    
    acc = 100. * correct / total
    print(f'Epoch {epoch+1}: Loss={total_loss/len(train_loader):.4f}, Acc={acc:.2f}%')
```

---

## 8. Training Best Practices

### 8.1 Hyperparameter Tuning

```
Các Hyperparameters quan trọng:

1. Learning Rate (lr) — QUAN TRỌNG NHẤT
   ├── Quá lớn: loss oscillate, diverge
   ├── Quá nhỏ: converge chậm, stuck local minima
   ├── Khuyên: Bắt đầu 1e-3 (Adam), 1e-2 (SGD)
   └── Kỹ thuật: Learning Rate Finder, Warm-up + Cosine Decay

2. Batch Size
   ├── Nhỏ (16-32): Regularization tốt, chậm
   ├── Lớn (128-512): Nhanh, cần lr lớn hơn
   └── Thực tế: 32-128 (GPU memory dependent)

3. Number of Layers & Hidden Units
   ├── Deeper ≠ always better
   ├── Start small → scale up nếu underfitting
   └── Rule of thumb: [input/2, ..., output]

4. Dropout Rate
   ├── 0.1-0.3: nếu model nhỏ
   ├── 0.3-0.5: nếu model lớn
   └── 0: nếu data rất nhiều

5. Weight Initialization
   ├── Xavier/Glorot: cho Sigmoid, Tanh
   ├── He (Kaiming): cho ReLU → ĐẶC BIỆT QUAN TRỌNG
   └── PyTorch mặc định: Kaiming uniform
```

### 8.2 Mixed Precision Training

```python
# AMP (Automatic Mixed Precision) — faster training, less memory
from torch.amp import autocast, GradScaler

scaler = GradScaler('cuda')

for batch_X, batch_y in train_loader:
    optimizer.zero_grad()
    
    with autocast('cuda'):  # FP16 forward pass
        outputs = model(batch_X)
        loss = criterion(outputs, batch_y)
    
    scaler.scale(loss).backward()   # Scale gradients
    scaler.step(optimizer)           # Unscale & update
    scaler.update()
    
# Lợi ích:
# ├── 2-3× faster training
# ├── 50% less GPU memory
# └── Gần như không mất accuracy
```

---

## FAQ & Best Practices

### Q1: GPU nào nên mua cho Deep Learning?
**A:** (Tình hình 2026)
- **Học tập/Hobby:** NVIDIA RTX 4060 (8GB) hoặc RTX 4070 (12GB)
- **Nghiêm túc:** RTX 4090 (24GB) hoặc RTX 5090 (32GB)
- **Enterprise:** A100 (80GB), H100 (80GB), H200
- **Cloud:** Google Colab (miễn phí), AWS/GCP spot instances
- **⚠️ AMD GPU:** Hỗ trợ PyTorch (ROCm) nhưng ít stable hơn NVIDIA

### Q2: Nên học PyTorch hay TensorFlow?
**A:** **PyTorch.** Lý do: dominant trong research, Hugging Face ecosystem, dễ debug, community lớn hơn. TF vẫn ok cho edge/mobile nhưng đang giảm dần.

### Q3: Khi nào dùng CNN, khi nào dùng Transformer cho image?
**A:**
- **Image Classification/Detection:** ViT (Transformer) cho large models, ConvNeXt cho efficiency
- **Small dataset / Fine-tune:** CNN (ResNet, EfficientNet) vẫn tốt
- **Production (speed):** CNN thường inference nhanh hơn ViT

### Best Practices

1. **Start simple** — MLP trước, CNN/Transformer sau nếu cần
2. **Normalize input** — mean=0, std=1 hoặc [0,1]
3. **Use pretrained models** — Transfer Learning thay vì train from scratch
4. **Monitor training** — TensorBoard, Weights & Biases
5. **Gradient clipping** — `clip_grad_norm_(params, 1.0)` chống exploding
6. **Mixed Precision** — luôn dùng AMP khi có GPU
7. **Reproducibility** — set seeds: `torch.manual_seed(42)`
8. **Save checkpoints** — `torch.save()` theo validation score

---

## Bài tập thực hành

### Bài 1: MLP cơ bản
1. Train MLP trên MNIST (handwritten digits)
2. Thử thay đổi: activation (ReLU vs GELU), depth, width
3. Plot training/validation loss curves
4. Đạt accuracy > 98%

### Bài 2: CNN
1. Train CNN trên CIFAR-10 (color images)
2. Implement Batch Normalization + Dropout
3. Thử Data Augmentation (RandomFlip, RandomRotation)
4. So sánh với pretrained ResNet-18 (Transfer Learning)

### Bài 3: Training Optimization
1. Implement Learning Rate Finder
2. So sánh Adam vs SGD+Momentum vs AdamW
3. Implement Early Stopping với patience=10
4. Dùng Mixed Precision Training → đo speedup

---

**Tiếp theo:** [Bài 3: NLP Fundamentals →](./03-NLP-Fundamentals.md)
