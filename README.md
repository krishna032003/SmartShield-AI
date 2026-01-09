# SmartShield.AI - The UPI Guardian 🛡️

![SmartShield Banner](https://img.shields.io/badge/SmartShield.AI-The_UPI_Guardian-blue?style=social)

> **Winner of the Microsoft Imagine Cup (Target)** 🏆
> *Protecting millions of daily digital transactions from QR fraud using Advanced AI.*

---

## 🚀 Tech Stack

![Azure](https://img.shields.io/badge/azure-%230072C6.svg?style=for-the-badge&logo=microsoftazure&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 🛑 The Problem
In the era of digital payments, **UPI Sticker Scams** are rising exponentially. Fraudsters paste their own QR codes over legitimate merchant codes (e.g., at coffee shops or fuel stations). Unsuspecting users scan these codes and transfer money directly to scammers. Current payment apps lack real-time context awareness to detect these physical overlay attacks.

## 💡 The Solution
**SmartShield.AI** is a real-time defense layer that sits between the camera and the payment gateway. We use a 3-tier security architecture:

1.  **Computer Vision Scanner**: An immersive, high-performance web scanner (built with React 18 & `@yudiel/react-qr-scanner`) that instantly captures QR data.
2.  **ML Fraud Prediction**: A robust Python backend (FastAPI + Scikit-Learn) that analyzes the UPI handle, merchant patterns, and transaction context to detect anomalies.
3.  **Merchant Trust Score**: Every scan generates a "Trust Score" (0-100).
    *   **90-100**: ✅ Verified Safe (Green Shield)
    *   **0-50**: 🚨 High Risk Fraud (Red Shield) - *Transaction Blocked*

---

## 🏗️ Architecture & Deployment

This project leverages the power of the **Microsoft Azure Cloud**:

*   **Frontend**: Built with **React + Vite + Tailwind CSS**, deployed on **Azure Static Web Apps** for global low-latency access.
*   **Backend**: Powered by **FastAPI**, deployed as **Azure Functions** (Serverless) for infinite scalability.
*   **AI Engine**: Integrates **Azure Custom Vision** for analyzing physical QR sticker tampering and **Azure Anomaly Detector** for transaction pattern analysis.

---

## ⚡ Installation & Local Setup

Prerequisites: Node.js (v18+) and Python (v3.10+).

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/smartshield-ai.git
cd smartshield-ai
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
*Server runs at: `http://127.0.0.1:8000`*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*App runs at: `http://localhost:5173`*

---

## 🔐 Demo Credentials

To access the Admin SOC Dashboard:

*   **Username:** `admin`
*   **Password:** `admin`

---

## 📸 Screenshots

| Dashboard | Live Scanner | Threat Detected |
|:---:|:---:|:---:|
| *(Place Dashboard Screenshot)* | *(Place Scanner Screenshot)* | *(Place Alert Screenshot)* |

---

*Built with ❤️ for the Microsoft Imagine Cup.*
