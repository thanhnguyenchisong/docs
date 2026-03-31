# Bài 1: AI & Machine Learning Fundamentals

## Mục lục
- [1. AI là gì?](#1-ai-là-gì)
- [2. Machine Learning Paradigms](#2-machine-learning-paradigms)
- [3. Supervised Learning](#3-supervised-learning)
- [4. Unsupervised Learning](#4-unsupervised-learning)
- [5. Reinforcement Learning](#5-reinforcement-learning)
- [6. Thuật toán ML cổ điển](#6-thuật-toán-ml-cổ-điển)
- [7. Feature Engineering & Data Pipeline](#7-feature-engineering--data-pipeline)
- [8. Evaluation Metrics](#8-evaluation-metrics)
- [9. Bias-Variance Tradeoff](#9-bias-variance-tradeoff)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. AI là gì?

### 1.1 Định nghĩa & Phân loại AI

```
Trí tuệ Nhân tạo (Artificial Intelligence):
  Khả năng của máy tính thực hiện các tác vụ đòi hỏi trí thông minh con người
  — nhận dạng, suy luận, học hỏi, ra quyết định.

Phân loại theo khả năng:
├── ANI (Artificial Narrow Intelligence)  ← HIỆN TẠI — chuyên biệt 1 tác vụ
│   Ví dụ: ChatGPT, Google Translate, AlphaGo
├── AGI (Artificial General Intelligence) ← ĐANG NGHIÊN CỨU — ngang người
│   Khả năng giải quyết bất kỳ tác vụ trí tuệ nào
└── ASI (Artificial Super Intelligence)   ← LÝ THUYẾT — vượt người
    Vượt xa khả năng con người ở mọi lĩnh vực
```

### 1.2 Mối quan hệ AI, ML, DL, GenAI

```
┌─────────────────────────────────────────────────────┐
│  Artificial Intelligence (AI)                        │
│  ┌─────────────────────────────────────────────┐    │
│  │  Machine Learning (ML)                       │    │
│  │  ┌─────────────────────────────────────┐    │    │
│  │  │  Deep Learning (DL)                  │    │    │
│  │  │  ┌─────────────────────────────┐    │    │    │
│  │  │  │  Generative AI (GenAI)       │    │    │    │
│  │  │  │  LLMs, Diffusion Models     │    │    │    │
│  │  │  └─────────────────────────────┘    │    │    │
│  │  └─────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘

- AI: Bất kỳ hệ thống nào bắt chước trí thông minh con người
- ML: Hệ thống HỌC từ dữ liệu thay vì lập trình cứng
- DL: ML sử dụng neural networks nhiều lớp
- GenAI: DL tạo ra nội dung mới (text, image, video, code)
```

### 1.3 Lịch sử phát triển AI — Timeline

| Năm | Sự kiện |
|-----|---------|
| 1956 | Thuật ngữ "AI" ra đời tại Dartmouth Conference |
| 1997 | Deep Blue (IBM) đánh bại Kasparov (cờ vua) |
| 2012 | AlexNet — Deep Learning bùng nổ (ImageNet) |
| 2017 | **Paper "Attention Is All You Need"** → Transformer |
| 2018 | BERT (Google) — pre-trained NLP |
| 2020 | GPT-3 — 175B params, few-shot learning |
| 2022 | ChatGPT ra mắt — AI mainstream |
| 2023 | GPT-4, Claude, Llama 2 — multimodal, open-source |
| 2024 | Agentic AI, RAG enterprise, AI coding assistants |
| 2025 | MCP Protocol, GRPO, AI Agents production-ready |
| 2026 | Multi-Agent orchestration, AI-native workflows |

---

## 2. Machine Learning Paradigms

### 2.1 Ba mô hình học chính

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ SUPERVISED       │    │ UNSUPERVISED     │    │ REINFORCEMENT   │
│ LEARNING         │    │ LEARNING         │    │ LEARNING        │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ Có label (nhãn)  │    │ Không có label   │    │ Thưởng / Phạt   │
│                  │    │                  │    │                  │
│ Input → Output   │    │ Tìm pattern ẩn   │    │ Agent ↔ Env     │
│                  │    │                  │    │                  │
│ ~80% ứng dụng    │    │ ~15% ứng dụng    │    │ ~5% ứng dụng    │
│ thực tế          │    │ thực tế          │    │ thực tế          │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ Ví dụ:           │    │ Ví dụ:           │    │ Ví dụ:           │
│ • Spam detection │    │ • Customer       │    │ • AlphaGo        │
│ • Price predict  │    │   segmentation   │    │ • Self-driving   │
│ • Image classify │    │ • Anomaly detect │    │ • Robot control  │
│ • NLP tasks      │    │ • Topic modeling │    │ • RLHF cho LLMs  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2.2 Semi-Supervised & Self-Supervised Learning

```
Semi-Supervised Learning:
  ├── Kết hợp dữ liệu có label (ít) + không label (nhiều)
  ├── Dùng khi labeling đắt/tốn thời gian
  └── Ví dụ: Medical imaging — bác sĩ label vài trăm, model học thêm từ hàng ngàn

Self-Supervised Learning (SSL):
  ├── Model tự tạo label từ dữ liệu
  ├── NỀN TẢNG của LLMs hiện đại
  ├── GPT: "Predict next word" → self-supervised
  ├── BERT: "Fill in the blank" → self-supervised
  └── Contrastive Learning: Học biểu diễn bằng cách so sánh cặp dữ liệu
```

---

## 3. Supervised Learning

### 3.1 Classification vs Regression

| Đặc điểm | Classification | Regression |
|-----------|---------------|------------|
| **Output** | Nhãn rời rạc (0/1, cat/dog) | Giá trị liên tục (giá nhà, nhiệt độ) |
| **Ví dụ** | Spam detection, Image classification | Stock prediction, Price estimation |
| **Thuật toán** | Logistic Regression, SVM, Random Forest | Linear Regression, Ridge, Lasso |
| **Metric** | Accuracy, F1, AUC-ROC | MSE, RMSE, MAE, R² |
| **Loss function** | Cross-Entropy Loss | Mean Squared Error |

### 3.2 Workflow Supervised Learning

```python
# Workflow chuẩn Machine Learning

# 1. LOAD DATA
import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.read_csv('data.csv')
X = df.drop('target', axis=1)  # Features
y = df['target']               # Labels

# 2. SPLIT DATA — Train/Test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 3. PREPROCESS
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)  # ⚠️ chỉ transform, KHÔNG fit

# 4. TRAIN MODEL
from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)

# 5. EVALUATE
from sklearn.metrics import classification_report, accuracy_score
y_pred = model.predict(X_test_scaled)
print(classification_report(y_test, y_pred))
print(f'Accuracy: {accuracy_score(y_test, y_pred):.4f}')

# 6. PREDICT
new_data = scaler.transform([[5.1, 3.5, 1.4, 0.2]])
prediction = model.predict(new_data)
probability = model.predict_proba(new_data)
```

---

## 4. Unsupervised Learning

### 4.1 Clustering

```python
# K-Means Clustering
from sklearn.cluster import KMeans
import numpy as np

# Data không có label
X = np.array([[1, 2], [1.5, 1.8], [5, 8], [8, 8], [1, 0.6], [9, 11]])

# Chọn K=2 clusters
kmeans = KMeans(n_clusters=2, random_state=42, n_init=10)
kmeans.fit(X)

labels = kmeans.labels_        # [0, 0, 1, 1, 0, 1]
centers = kmeans.cluster_centers_  # Tâm cluster

# ⚠️ Chọn K tối ưu — Elbow Method
inertias = []
for k in range(1, 10):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    km.fit(X)
    inertias.append(km.inertia_)
# Plot inertias → tìm "khuỷu tay" (elbow)
```

### 4.2 Dimensionality Reduction

```python
# PCA — Principal Component Analysis
from sklearn.decomposition import PCA

# Data có 50 features → giảm xuống 2D để visualize
pca = PCA(n_components=2)
X_reduced = pca.fit_transform(X)

# Xem tỷ lệ variance giữ lại
print(f'Explained variance: {pca.explained_variance_ratio_}')
# [0.72, 0.15] → 87% information giữ lại với 2 components

# t-SNE — cho visualization
from sklearn.manifold import TSNE
tsne = TSNE(n_components=2, random_state=42, perplexity=30)
X_tsne = tsne.fit_transform(X)
```

### 4.3 Anomaly Detection

```python
# Isolation Forest — phát hiện outlier
from sklearn.ensemble import IsolationForest

model = IsolationForest(contamination=0.05, random_state=42)
model.fit(X_train)

# -1 = anomaly, 1 = normal
predictions = model.predict(X_test)
anomalies = X_test[predictions == -1]
```

---

## 5. Reinforcement Learning

### 5.1 Khái niệm cốt lõi

```
┌──────────┐    action     ┌──────────────┐
│  AGENT   │──────────────→│ ENVIRONMENT  │
│ (Model)  │               │  (World)     │
│          │←──────────────│              │
└──────────┘  state +      └──────────────┘
              reward

Agent: Đưa ra quyết định (policy π)
Environment: Thế giới mà agent tương tác
State (s): Trạng thái hiện tại
Action (a): Hành động agent thực hiện
Reward (r): Phản hồi từ environment
Policy (π): Chiến lược ánh xạ state → action

Mục tiêu: Maximize tổng reward tích lũy (cumulative reward)
```

### 5.2 Ứng dụng RL trong AI 2026

```
RL trong Thực tế:
├── RLHF (RL from Human Feedback)
│   └── Fine-tune LLMs để align với human preferences
│       ChatGPT, Claude đều dùng RLHF
│
├── GRPO (Group Relative Policy Optimization) — MỚI 2025
│   └── Tối ưu hóa reasoning capability
│       Không cần reward model riêng
│
├── Robotics
│   └── Dạy robot thao tác phức tạp
│
├── Game AI
│   └── AlphaGo, OpenAI Five (Dota 2)
│
└── Autonomous Agents
    └── Agent tự học cách sử dụng tools
```

---

## 6. Thuật toán ML Cổ điển

### 6.1 So sánh các thuật toán phổ biến

| Thuật toán | Loại | Ưu điểm | Nhược điểm | Use case |
|-----------|------|---------|------------|----------|
| **Linear Regression** | Regression | Đơn giản, interpretable | Chỉ linear relationships | Dự đoán giá, trend |
| **Logistic Regression** | Classification | Nhanh, probabilistic | Linear decision boundary | Spam, churn prediction |
| **Decision Tree** | Cả hai | Interpretable, không cần scale | Dễ overfit | Feature importance |
| **Random Forest** | Cả hai | Robust, ít overfit | Chậm, black-box | General purpose ML |
| **Gradient Boosting** | Cả hai | Accuracy cao nhất (tabular) | Chậm train, hyperparameter | Competitions, production |
| **SVM** | Classification | Tốt với high-dim data | Chậm với dataset lớn | Text classification |
| **K-Means** | Clustering | Đơn giản, nhanh | Phải chọn K trước | Customer segmentation |
| **KNN** | Classification | Không cần training | Chậm predict, curse of dim | Recommendation |
| **Naive Bayes** | Classification | Rất nhanh, ít data | Giả định independence | Text classification |
| **XGBoost** | Cả hai | State-of-art cho tabular | Phức tạp tuning | Kaggle, production |

### 6.2 Code — Gradient Boosting (XGBoost)

```python
# XGBoost — "vua" của tabular data
import xgboost as xgb
from sklearn.model_selection import cross_val_score

model = xgb.XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    eval_metric='logloss',
    random_state=42
)

# Cross-validation — đánh giá chính xác hơn train/test split
scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
print(f'CV Accuracy: {scores.mean():.4f} ± {scores.std():.4f}')

# Train cuối cùng
model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

# Feature importance
importances = model.feature_importances_
for feat, imp in sorted(zip(feature_names, importances), key=lambda x: -x[1]):
    print(f'{feat}: {imp:.4f}')
```

---

## 7. Feature Engineering & Data Pipeline

### 7.1 Feature Engineering — Tối quan trọng

```
⚠️ Quy tắc vàng:
"Garbage in, garbage out" — Dữ liệu tốt > Thuật toán phức tạp

Feature Engineering Pipeline:
├── 1. Handling Missing Values
│   ├── Drop (nếu ít)
│   ├── Imputation: mean, median, mode
│   └── Model-based: KNN Imputer
│
├── 2. Encoding Categorical Variables
│   ├── One-Hot Encoding (ít category)
│   ├── Label Encoding (ordinal data)
│   └── Target Encoding (many categories)
│
├── 3. Feature Scaling
│   ├── StandardScaler: (x - mean) / std — cho SVM, NN
│   ├── MinMaxScaler: (x - min) / (max - min) — cho [0,1]
│   └── RobustScaler: dùng median/IQR — chống outlier
│
├── 4. Feature Creation
│   ├── Polynomial features
│   ├── Interaction features
│   ├── Date extraction (year, month, day_of_week)
│   └── Text features (TF-IDF, word count)
│
└── 5. Feature Selection
    ├── Correlation analysis (drop highly correlated)
    ├── Mutual Information
    ├── Recursive Feature Elimination (RFE)
    └── L1 Regularization (Lasso)
```

### 7.2 Code — Data Pipeline

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

# Định nghĩa pipeline cho từng loại feature
numeric_features = ['age', 'salary', 'experience']
categorical_features = ['department', 'city']

numeric_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('encoder', OneHotEncoder(handle_unknown='ignore'))
])

# Kết hợp
preprocessor = ColumnTransformer([
    ('num', numeric_transformer, numeric_features),
    ('cat', categorical_transformer, categorical_features)
])

# Full Pipeline: preprocess + model
full_pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100))
])

# Fit & predict
full_pipeline.fit(X_train, y_train)
predictions = full_pipeline.predict(X_test)
```

---

## 8. Evaluation Metrics

### 8.1 Classification Metrics

```
Confusion Matrix:
                    Predicted
                  Pos    |   Neg
Actual  Pos   |   TP     |   FN   |    ← Recall = TP / (TP + FN)
        Neg   |   FP     |   TN   |
              ↑
          Precision = TP / (TP + FP)

Accuracy = (TP + TN) / Total
  ⚠️ KHÔNG dùng khi data imbalanced!
  Ví dụ: 99% legitimate → model predict "all legitimate" = 99% accuracy nhưng vô dụng

Precision = TP / (TP + FP) — "Khi predict Positive, đúng bao nhiêu?"
  → Quan trọng khi False Positive costive (spam → inbox)

Recall = TP / (TP + FN) — "Bắt được bao nhiêu Positive thật?"
  → Quan trọng khi False Negative costly (bỏ sót ung thư)

F1-Score = 2 × (Precision × Recall) / (Precision + Recall)
  → Cân bằng Precision & Recall

AUC-ROC = Area Under ROC Curve
  → Đánh giá khả năng phân biệt ở mọi threshold
  → 1.0 = hoàn hảo, 0.5 = random
```

### 8.2 Regression Metrics

```python
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import numpy as np

y_true = [3, -0.5, 2, 7]
y_pred = [2.5, 0.0, 2, 8]

# MAE — Mean Absolute Error
mae = mean_absolute_error(y_true, y_pred)  # 0.5

# MSE — Mean Squared Error
mse = mean_squared_error(y_true, y_pred)   # 0.375

# RMSE — Root Mean Squared Error
rmse = np.sqrt(mse)                        # 0.612

# R² — Coefficient of Determination
r2 = r2_score(y_true, y_pred)              # 0.948
# R²=1 hoàn hảo, R²=0 = predict mean, R²<0 = tệ hơn mean
```

---

## 9. Bias-Variance Tradeoff

### 9.1 Khái niệm

```
Error = Bias² + Variance + Irreducible Error

┌──────────────────────────────────────────────────┐
│                                                   │
│   High Bias          Sweet Spot        High Var   │
│   (Underfitting)     (Just Right)     (Overfitting)│
│                                                   │
│   ────────          ~~~~~~~~~~        ∿∿∿∿∿∿∿∿    │
│   Quá đơn giản      Vừa phải         Quá phức tạp │
│                                                   │
│   • Linear model    • Regularized     • Deep tree  │
│     cho nonlinear   • Cross-validated • No regularize│
│   • Ít features     • Pruned          • Quá nhiều   │
│                                         features    │
│                                                   │
│   Training error:   Training error:   Training err: │
│   CAO               TRUNG BÌNH        RẤT THẤP     │
│   Test error:       Test error:       Test error:   │
│   CAO               TRUNG BÌNH        RẤT CAO      │
└──────────────────────────────────────────────────┘
```

### 9.2 Cách xử lý

```
Overfitting (High Variance):
├── Thêm data
├── Feature selection (giảm features)
├── Regularization (L1/Lasso, L2/Ridge)
├── Cross-validation
├── Early stopping
├── Dropout (Neural Networks)
├── Ensemble methods (Random Forest, Bagging)
└── Đơn giản hóa model

Underfitting (High Bias):
├── Model phức tạp hơn
├── Thêm features
├── Feature engineering
├── Giảm regularization
├── Tăng training time
└── Ensemble methods (Boosting)
```

---

## FAQ & Best Practices

### Q1: Nên dùng thuật toán nào cho dự án đầu tiên?
**A:** Bắt đầu với **baseline đơn giản**:
- Classification → Logistic Regression hoặc Random Forest
- Regression → Linear Regression hoặc XGBoost
- Clustering → K-Means
- Sau đó thử các model phức tạp hơn để so sánh

### Q2: Data bao nhiêu là đủ?
**A:** Quy tắc ước lượng:
- ML cổ điển: **10× số features** (tối thiểu)
- Deep Learning: **1,000–10,000+** samples per class
- LLMs: **Billions** of tokens (nhưng bạn dùng pretrained, không cần tự train)

### Q3: Khi nào dùng ML, khi nào dùng rule-based?
**A:**
```
Dùng ML khi:
✅ Pattern phức tạp, khó viết rules
✅ Data nhiều và đa dạng
✅ Pattern thay đổi theo thời gian
✅ Scale lớn

Dùng Rule-based khi:
✅ Logic rõ ràng, ít ngoại lệ
✅ Data ít
✅ Cần explainability 100%
✅ Compliance/audit requirements
```

### Q4: ML truyền thống vs Deep Learning?
**A:**

| Tiêu chí | ML Truyền thống | Deep Learning |
|----------|----------------|---------------|
| **Data nhỏ (<10K)** | ✅ Tốt hơn | ❌ Dễ overfit |
| **Tabular data** | ✅ XGBoost vẫn king | ⚠️ Chưa vượt XGBoost |
| **Image/Text/Audio** | ❌ Yếu | ✅ Dominant |
| **Interpretability** | ✅ Dễ giải thích | ❌ Black box |
| **Training time** | ✅ Nhanh | ❌ Chậm, cần GPU |

### Best Practices

1. **Luôn bắt đầu với EDA** (Exploratory Data Analysis) — hiểu data trước khi model
2. **Baseline first** — model đơn giản nhất, rồi cải tiến dần
3. **Cross-validation** — không chỉ dùng 1 train/test split
4. **Data quality > Model complexity** — clean data quan trọng hơn model phức tạp
5. **Track experiments** — dùng MLflow, Weights & Biases
6. **Reproducibility** — set random_state, version control data
7. **Monitor production** — model decay theo thời gian, cần retrain

---

## Bài tập thực hành

### Bài 1: Supervised Learning Pipeline
1. Download Titanic dataset từ Kaggle
2. EDA: phân tích missing values, distribution, correlation
3. Feature engineering: tạo ít nhất 3 features mới
4. Train 3 models: Logistic Regression, Random Forest, XGBoost
5. So sánh bằng cross-validation (CV=5)
6. Điều chỉnh hyperparameters với GridSearchCV

### Bài 2: Clustering
1. Download Customer dataset
2. Preprocessing: scale features
3. Tìm số cluster tối ưu bằng Elbow Method + Silhouette Score
4. K-Means clustering → visualize kết quả
5. So sánh với DBSCAN

### Bài 3: End-to-End Pipeline
1. Chọn 1 dataset từ Kaggle
2. Xây dựng Pipeline hoàn chỉnh (preprocessing + model)
3. Evaluate với nhiều metrics
4. Lưu model với `joblib` hoặc `pickle`
5. Viết script inference cho new data

---

**Tiếp theo:** [Bài 2: Deep Learning & Neural Networks →](./02-Deep-Learning-Neural-Networks.md)
