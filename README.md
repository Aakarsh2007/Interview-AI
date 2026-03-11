🚀 AI-Powered Interview Strategy & Resume Analyzer
A full-stack, AI-driven application designed to help candidates prepare for technical interviews. By analyzing a user's uploaded PDF resume against a target job description, the application generates a highly tailored interview preparation roadmap, technical/behavioral questions, dynamically generated PDF resumes, and features a Live AI Mock Interview Arena with voice recognition.

✨ Features
Live AI Mock Interviews: Practice your answers in real-time. The AI shuffles a custom mix of technical and behavioral questions, listens to your responses, and provides an instant grade (out of 10) with actionable feedback.

Voice-Enabled Arena: Utilizes the browser-native Web Speech API for seamless Text-to-Speech (the AI reads questions out loud) and Speech-to-Text (dictate your answers without typing).

Interactive Dashboard & Tracking: A tabbed user interface to separate Strategy Reports and Mock Interview scorecards. Features a dynamic progress bar that updates as you check off daily tasks in your preparation roadmap.

Smart PDF Parsing: Seamlessly handles user PDF uploads using multer (memory buffers) and extracts text using pdf-parse.

Automated PDF Generation: Uses a headless Chrome browser (puppeteer) to dynamically render AI-generated HTML into a clean, downloadable A4 PDF resume.

Advanced Authentication: Secure login and registration using JWT (JSON Web Tokens) stored in HTTP-only cookies, coupled with a Redis-backed OTP (One-Time Password) system for secure password resets.

🛠️ Tech Stack
Frontend:

React 19 (via Vite)

React Router v7

Web Speech API (Native Browser Speech Recognition & Synthesis)

Axios (with withCredentials for cookie management)

React Hot Toast (For standard alerts and custom interactive UI overlays)

SCSS (Custom styling)

Backend:

Node.js & Express.js

MongoDB (Mongoose ODM)

Redis (For fast, expiring OTP caching)

Google Gen AI SDK (@google/genai utilizing gemini-2.5-flash)

Puppeteer (Headless browser PDF rendering)

Multer (Multipart form data handling)

JSON Web Tokens (JWT) & bcryptjs

⚙️ Local Setup & Installation
Prerequisites
Make sure you have the following installed on your machine:

Node.js (v18+)

MongoDB (Local server or Atlas URI)

Redis (Local server running on default port 6379)

1. Clone the Repository
Bash
git clone https://github.com/Aakarsh2007/Interview-AI
2. Backend Setup
Navigate to the backend directory, install dependencies, and set up your environment variables.

Bash
cd backend
npm install
Create a .env file in the backend folder and add the following:

Code snippet
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/interview_ai
JWT_SECRET=your_super_secret_jwt_string
ACESS_SECRET_KEY=your_secret_key
REFRESH_SECRET_KEY=your_secret_key
JWT_EXPIRES_IN=1d
GOOGLE_GENAI_API_KEY=your_google_gemini_api_key
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
Start the backend development server:

Bash
npm run dev
3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install dependencies.

Bash
cd Frontend
npm install
Start the Vite development server:

Bash
npm run dev
🚀 Usage
Ensure both MongoDB and Redis are running locally.

Open your browser and navigate to http://localhost:5173.

Register a new account to receive your JWT cookies.

On the dashboard, paste a Target Job Description, write a quick self-description (or upload a PDF resume), and click Generate.

Review your custom Match Score, Skill Gaps, and interact with your Day-by-Day Preparation Plan.

Click Start Mock Interview to enter the Arena. The AI will read the questions to you. Click the microphone to dictate your answer and receive instant feedback.

Return to the dashboard to view your saved Mock Interview scorecards and download your custom Puppeteer-rendered PDF resume.

🧠 Architecture Highlights
Bulletproof AI Normalization & Parsing: The backend enforces native Google GenAI SchemaType structures. It also includes a custom sanitization layer to strip unexpected Markdown formatting from the LLM response, ensuring the Mongoose database never crashes from malformed JSON.

Stateless Mock Grading: To conserve database writes and maintain a snappy UI, the Mock Interview Arena evaluates individual answers statelessly. Only the final, completed interview scorecard is committed to MongoDB.

Memory Efficiency: File uploads bypass the disk entirely, going straight from the network into a memory buffer to be parsed and sent to the AI, preventing server storage bloat.

Stateless Auth: Auth flow uses stateless JWTs, reserving Redis strictly for short-lived, high-speed OTP validations during the forgot-password flow.