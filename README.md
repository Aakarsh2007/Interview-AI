# 🚀 AI-Powered Interview Strategy & Resume Analyzer

A full-stack, AI-driven application designed to help candidates prepare for technical interviews. By analyzing a user's uploaded PDF resume against a target job description, the application generates a highly tailored interview preparation roadmap, technical questions, behavioral questions, and even dynamically generates an optimized HTML-to-PDF resume.

## ✨ Features

* **Advanced Authentication:** Secure login and registration using JWT (JSON Web Tokens) stored in HTTP-only cookies, coupled with a Redis-backed OTP (One-Time Password) system for secure password resets.
* **Smart PDF Parsing:** Seamlessly handles user PDF uploads using `multer` (memory buffers) and extracts text using `pdf-parse`.
* **Generative AI Integration:** Utilizes Google's `gemini-2.5-flash` model with **Strict JSON Structured Outputs** to guarantee perfectly formatted, predictable data arrays for MongoDB storage.
* **Automated PDF Generation:** Uses a headless Chrome browser (`puppeteer`) to dynamically render AI-generated HTML into a clean, downloadable A4 PDF resume.
* **Responsive Modern UI:** Built with React, Vite, and SCSS, featuring protected routing, loading states, and dynamic data rendering.

## 🛠️ Tech Stack

**Frontend:**
* React 19 (via Vite)
* React Router v7
* Axios (with `withCredentials` for cookie management)
* SCSS (Custom styling)

**Backend:**
* Node.js & Express.js
* MongoDB (Mongoose ODM)
* Redis (For fast, expiring OTP caching)
* Google Gen AI SDK (`@google/genai`)
* Puppeteer (Headless browser PDF rendering)
* Multer (Multipart form data handling)
* JSON Web Tokens (JWT) & bcryptjs

## ⚙️ Local Setup & Installation

### Prerequisites
Make sure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18+)
* [MongoDB](https://www.mongodb.com/) (Local server or Atlas URI)
* [Redis](https://redis.io/) (Local server running on default port 6379)

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/Aakarsh2007/Interview-AI
\`\`\`

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and set up your environment variables.
\`\`\`bash
cd backend
npm install
\`\`\`
Create a `.env` file in the `backend` folder and add the following:
\`\`\`env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/interview_ai
JWT_SECRET=your_super_secret_jwt_string
ACESS_SECRET_KEY = your_secret_key
REFRESH_SECRET_KEY = your_secret_key
JWT_EXPIRES_IN=1d
GOOGLE_GENAI_API_KEY=your_google_gemini_api_key
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
\`\`\`
Start the backend development server:
\`\`\`bash
npm run dev
\`\`\`

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install dependencies.
\`\`\`bash
cd Frontend
npm install
\`\`\`
Start the Vite development server:
\`\`\`bash
npm run dev
\`\`\`

## 🚀 Usage
1. Ensure both MongoDB and Redis are running locally.
2. Open your browser and navigate to `http://localhost:5173`.
3. Register a new account to receive your JWT cookies.
4. On the dashboard, paste a Target Job Description, write a quick self-description (or upload a PDF resume), and click **Generate**.
5. Wait ~20 seconds for the AI and backend to parse, generate, normalize, and save the data.
6. Review your custom Match Score, Skill Gaps, and Day-by-Day Preparation Plan.
7. Click **Download Resume** to trigger the Puppeteer headless browser and receive your tailored PDF.

## 🧠 Architecture Highlights
* **Bulletproof AI Normalization:** The backend enforces native Google GenAI `SchemaType` structures, ensuring the LLM never crashes the Mongoose database with malformed arrays.
* **Stateless Auth:** Auth flow uses stateless JWTs, reserving Redis strictly for short-lived, high-speed OTP validations during the forgot-password flow.
* **Memory Efficiency:** File uploads bypass the disk entirely, going straight from the network into a memory buffer to be parsed and sent to the AI, preventing server storage bloat.