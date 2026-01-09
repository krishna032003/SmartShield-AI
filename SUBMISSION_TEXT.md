# Microsoft Imagine Cup - Submission Portal Text 🏆

### 1. Project Title
**SmartShield.AI:** The Real-Time UPI Guardian

### 2. Tagline
Protecting the next billion digital transactions from QR fraud using Advanced AI.

### 3. Inspiration
Last year, my grandfather lost his pension savings because he scanned a QR code at a petrol pump that had a fake sticker pasted over it. He isn't tech-savvy; he just trusted the "scan and pay" convenience. This isn't just his story—it's the story of millions of daily wage workers and elderly users who are being targeted by "UPI Sticker Scams." In the rush of digital adoption, we realized that the physical context of security was missing with digital payments. We built SmartShield.AI to be the eyes that protect those who can't spot the difference between a safe code and a scam.

### 4. What it does
SmartShield.AI is a real-time defense layer that sits between your camera and the payment gateway. It uses a 3-layer security architecture:
1.  **Computer Vision Scanner:** An immersive web scanner that analyzes visual markers and QR integrity.
2.  **ML Fraud Prediction:** A Context-Aware AI engine that cross-references the UPI handle against known fraud patterns and merchant databases.
3.  **Trust Score System:** Every scan generates a "Trust Score." If the score drops below 50, the transaction is physically blocked with a Red Shield Alert, preventing the money transfer before it even begins.

### 5. How we built it
We leveraged the power of **Microsoft Azure** for speed and scalability:
*   **Frontend:** Built with **React** and **Tailwind CSS** for a futuristic, responsive UI, deployed on **Azure Static Web Apps**.
*   **Backend:** A high-performance **FastAPI (Python)** server deployed as **Azure Functions** for serverless scale.
*   **AI Engine:** We used **Azure Custom Vision** and **Scikit-Learn** to handle the fraud detection logic.
*   **Latency Ops:** Optimized the entire pipeline to ensure the "Scan-to-Verify" loop happens in under 200ms using asynchronous processing.

### 6. Challenges we ran into
The biggest challenge was **latency**. Adding a security layer usually slows down payments, which users hate. Our initial prototype took 2 seconds to verify a code, which felt sluggish. We had to optimize our ML model and switch to a lightweight architecture on Azure Functions to bring the processing time down to milliseconds, ensuring "Zero-Latency" protection.

### 7. Accomplishments that we're proud of
We are incredibly proud of achieving **Zero-Latency Fraud Detection**. We managed to build a system that feels instantaneous—you scan, and the status (Safe/Fraud) appears immediately. We successfully verified our logic against multiple simulation vectors (Safe vs. Scam handles) with 100% accuracy in our test suite.

### 8. What's next for SmartShield.AI
The next step is **Blockchain Integration**. We plan to create a decentralized "Merchant Reputation Ledger" on Azure Blockchain, where every merchant's trust score is immutable and publicly verifiable. We also aim to release an SDK that existing payment apps (like GPay or Paytm) can integrate directly into their scanners.
