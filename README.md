# 🚀 Interview-AI: Intelligent Strategy & Mock Interview Platform

<p align="center">
  <em>An enterprise-grade, production-ready AI application designed to analyze resumes, generate tailored preparation roadmaps, and conduct live, voice-enabled technical mock interviews with adaptive difficulty and real-time delivery analytics.</em>
</p>

<p align="center">
  <strong>Frontend Architecture</strong><br>
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <br><br>
  <strong>Backend & API</strong><br>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <br><br>
  <strong>Database & Caching</strong><br>
  <img src="https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Redis_Upstash-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <br><br>
  <strong>AI & Security</strong><br>
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Zod_Validation-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" />
  <img src="https://img.shields.io/badge/Helmet_Security-000000?style=for-the-badge&logo=express&logoColor=white" alt="Helmet" />
  <img src="https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
</p>

---

## 🌐 Live Demo
🔗 **[Experience the Live Application Here](https://interview-ai-frontend-1ets.onrender.com)**

---

## 📸 Application Preview

### 🖥 The Command Center (Dashboard)
Upload your resume (PDF) and target job description. The AI parses the data to calculate match scores and skill gaps.
<p align="center"><img src="screenshots/home.png" width="900" alt="Main Dashboard"/></p>

### 🗺️ AI Strategy, Roadmap & Preparation Questions
Generates a highly tailored, interactive preparation roadmap based on your exact skill gaps. Includes customized technical and behavioural questions to guide your preparation.
<p align="center"><img src="screenshots/roadmap.png" width="900" alt="Interactive Roadmap"/></p>
<p align="center">
  <img src="screenshots/technical.png" width="445" alt="Technical Questions"/>
  <img src="screenshots/behavioural.png" width="445" alt="Behavioural Questions"/>
</p>

### 🎙️ Live AI Mock Interview Arena (Voice-Enabled)
Practice under pressure. The AI generates a custom mix of questions, reads them aloud using native Web Speech Synthesis, and allows you to dictate your answers seamlessly without touching your keyboard.
<p align="center"><img src="screenshots/mock-interview.png" width="900" alt="Mock Arena"/></p>

### 📊 Instant AI Grading & Detailed Reports
Once the interview concludes, receive an instant grade (out of 10) on your verbal answers, complete with actionable feedback and a comprehensive scorecard.
<p align="center"><img src="screenshots/report.png" width="900" alt="Strategy Report"/></p>
<p align="center"><img src="screenshots/mock-feedback.png" width="900" alt="Mock Feedback"/></p>

### 📜 Persistent History & SVG Analytics
Track your progress over time. View all past mock interviews and generated strategies, alongside custom performance metrics charted dynamically using SVGs.
<p align="center"><img src="screenshots/history.png" width="900" alt="Interview History"/></p>

---

## 🔐 Secure Authentication Architecture
Features a robust, cookie-based JWT authentication flow with an enterprise-grade password recovery system.

<p align="center">
  <img src="screenshots/login.png" width="220" alt="Login"/>
  <img src="screenshots/register.png" width="220" alt="Register"/>
  <img src="screenshots/otp.png" width="220" alt="OTP Verification"/>
  <img src="screenshots/reset.png" width="220" alt="Reset Password"/>
</p>

### 🔄 Advanced Password Reset Flow (Redis + Resend API)
1. User requests a password reset.
2. A cryptographic 6-digit OTP is generated and sent via **Resend HTTP API** (bypassing strict cloud SMTP firewalls).
3. The OTP is cached in **Redis** with a strict 5-minute Time-To-Live (TTL).
4. Backend verifies the user's input against the Redis cache in milliseconds.

---

## ✨ Standout Elite Features

* **🛡️ End-to-End TypeScript Migration:** The entire codebase has been converted to TypeScript, providing compile-time type-safety across all components, API schemas, Express requests, and database models.
* **🎯 Zod Schema Validation & Helmet:** Strict HTTP request body schema checks using Zod and secure response header configuration with Helmet to defend against XSS and clickjacking.
* **⚡ Redis AI Caching:** Integrates Upstash Redis caching for expensive AI generation calls, drastically reducing mock session latency and cost.
* **🧠 Adaptive AI Questioning:** Rather than reading a static list of questions, the mock arena fetches questions dynamically from `/api/interview/mock/next-question`. The AI automatically selects a harder question if the candidate scores $\ge 7$, or a foundational/easier question if they score $< 5$.
* **🎙️ Live Audio Pacing & Delivery Analytics:** Features real-time Web Audio API voice visualizers, WPM pace tracking, filler word detection, hesitation calculations, and candidate confidence metrics.
* **🗣️ Voice-Enabled Arena & Interruption Handler:** Uses native Speech Recognition and Speech Synthesis. Utterances are automatically canceled immediately if the user starts speaking over the AI voice.
* **📄 Automated PDF Generation:** Uses `puppeteer` to dynamically render AI-generated strategies into downloadable PDFs.

---

## 🏗 System Architecture

```text
[ Frontend (React 19 + TypeScript + Vite) ] 
       │ (Axios + Credentials)
       ▼ 
[ Backend (Express + TypeScript) ] ──▶ [ Redis Cache ] (Upstash Session Cache)
       │
       ├─▶ [ MongoDB Atlas ] (Persistent Profiles & Interview History)
       │
       ├─▶ [ Resend API ] (Secure SMTP Email Delivery)
       │
       ├─▶ [ Puppeteer ] (Headless PDF Rendering)
       │
       ▼ 
[ Google Gemini 2.5 Flash SDK ] (Adaptive Questioning & Response Grading)
```

---

## 📂 Project Structure

```text
Interview-AI/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── app.routes.tsx
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── auth.context.tsx
│   │   │   │   ├── services/auth.api.ts
│   │   │   │   └── pages/
│   │   │   └── interview/
│   │   │       ├── components/MockAnalytics.tsx
│   │   │       ├── hooks/useInterview.ts
│   │   │       ├── pages/Home.tsx
│   │   │       ├── pages/Interview.tsx
│   │   │       ├── pages/MockInterviewArena.tsx
│   │   │       ├── pages/MockInterviewResult.tsx
│   │   │       └── services/interview.api.ts
│   │   ├── main.tsx
│   │   └── style/
│   ├── index.html
│   ├── tsconfig.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── redis.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── interview.controller.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── file.middleware.ts
│   │   │   └── rateLimit.middleware.ts
│   │   ├── models/
│   │   │   ├── interviewReport.model.ts
│   │   │   ├── mockInterview.model.ts
│   │   │   └── user.model.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   └── interview.routes.ts
│   │   ├── services/
│   │   │   └── ai.service.ts
│   │   ├── utils/
│   │   │   └── sendEmail.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tsconfig.json
│   └── package.json
└── screenshots/
```

---

## ⚙️ Local Installation & Setup

**Prerequisites:** Node.js (v18+), MongoDB (Local or Atlas), and Redis (running on port `6379`).

**1. Clone the repository**
```bash
git clone https://github.com/Aakarsh2007/Interview-AI.git
```

**2. Backend Setup**
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/interview_ai
REDIS_URL=redis://127.0.0.1:6379

JWT_SECRET=your_super_secret_jwt_string
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

GOOGLE_GENAI_API_KEY=your_google_gemini_api_key
RESEND_API_KEY=your_resend_api_key
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```

**3. Frontend Setup**
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

---

## 🚀 Step-by-Step Production Deployment Guide

Deploying a multi-service setup requiring Redis caching and Puppeteer PDF generation needs careful environment and database setup. Here is how to configure it in production:

### 1. Database Provisioning
* **MongoDB**: Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Whitelist all connection IPs (`0.0.0.0/0`) and copy your connection string.
* **Redis**: Provision a secure serverless database on [Upstash Redis](https://upstash.com/). Copy the TLS-enabled connection string (`rediss://...`).

### 2. Backend API Deployment on Railway
Since the backend uses **Puppeteer** for PDF generation, Railway is highly recommended as it handles headless Chrome dependencies automatically via Nixpacks.
* Log in to [Railway](https://railway.app/).
* Click **New Project** $\rightarrow$ **Deploy from GitHub repo** and select `Interview-AI`.
* In settings, configure the **Root Directory** as `backend`.
* Under the **Variables** tab, add the following production variables:
  ```env
  PORT=3000
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/prod
  REDIS_URL=rediss://default:<password>@<upstash-endpoint>.upstash.io:6379
  JWT_SECRET=production_random_jwt_hash_string
  ACCESS_TOKEN_SECRET=production_access_token_secret
  REFRESH_TOKEN_SECRET=production_refresh_token_secret
  GOOGLE_GENAI_API_KEY=your_production_gemini_api_key
  RESEND_API_KEY=your_production_resend_api_key
  FRONTEND_URL=https://your-frontend-domain.vercel.app
  ```

### 3. Frontend Deployment on Vercel
* Log in to [Vercel](https://vercel.com/).
* Click **Add New** $\rightarrow$ **Project**, link your GitHub account, and select the `Interview-AI` repository.
* Configure the **Root Directory** to `frontend`.
* Keep the Framework Preset as **Vite**.
* Add the following Environment Variable:
  * `VITE_API_BASE_URL` = `https://your-backend-api.up.railway.app` (Your live backend endpoint).
* Click **Deploy**. Vercel automatically compiles your TypeScript application and hosts the static bundle on their global Edge CDN.

---

## 👨‍💻 Author

**Aakarsh Saxena**  
*Aspiring AI Engineer & Full Stack Developer*  
*B.Tech in Information Technology | IIIT Lucknow*

---

## ⭐ Support

If you found this project helpful or inspiring, please consider leaving a ⭐ on the repository!
