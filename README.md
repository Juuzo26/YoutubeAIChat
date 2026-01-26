# 🎥 YouTube AI Chat Assistant

An end-to-end full-stack application that transforms any YouTube video into an interactive chat experience. Users can process a video to get an AI-polished transcript and then have natural conversations about the content using customizable AI personas.

---

## Project Architecture

This is a monorepo containing both the AI engine (Backend) and the user interface (Frontend).

### [Backend](./Backend)
**The Logic of our project.** A Flask-based API that handles heavy-duty processing:
- **Hybrid Transcription:** Uses `yt-dlp` for fast subtitle scraping with a `Faster-Whisper` fallback for videos without captions.
- **AI Polishing:** Automatically cleans and formats raw transcripts into readable Markdown using Gemini AI.
- **Intelligent Chat:** Manages conversation memory and routes requests through a resilient Gemini model fallback chain.
- **Resource Management:** Optimized for GPU usage with automated garbage collection and RAM health checks.

### [Frontend](./Frontend/vidchat)
**The Interface of our project.** A modern React 19 application built for speed and accessibility:
- **Responsive webpage:** Built with Vite and Tailwind CSS for a smooth, responsive experience.
- **Persona Library:** Allows users to save and switch between custom AI personalities (e.g., "Expert Professor," "Pirate," "Socratic Tutor").
- **Smart Caching:** Features a 5-item LRU local cache to provide instant loading for previously processed videos.
- **Developer Tools:** Includes a hidden panel for secure backend authentication.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons, React Markdown |
| **Backend** | Python, Flask, Faster-Whisper, yt-dlp, FFmpeg |
| **AI Models** | Google Gemini (Pro/Flash/Lite), Whisper AI |
| **Infrastructure** | Ngrok (Tunneling), Dotenv, CUDA (GPU Acceleration) |

---

## Quick Start

### 1. Backend Setup
1. Navigate to `/Backend`.
2. Install requirements: `pip install -r requirements.txt`.
3. Set up your `.env` with your keys.
4. Run `python main.py`.

### 2. Frontend Setup
1. Navigate to `/Frontend/vidchat`.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.
4. Connect to the backend URL via the in-app Developer Settings.

---

## Key Features
- **Context-Aware Chat:** The AI remembers the video content and your previous questions.
- **Multi-Format Support:** Handles standard YouTube links, Shorts, and mobile URLs.
- **High Availability:** Automatically switches Gemini models if rate limits are hit.
- **Accessibility:** WCAG-compliant design with keyboard navigation support.

---

## Authors
- **Tran Dinh Dang** - *Advisor* ---
- **Juuzo26** - *Sole Developer* ---
*Developed for the YouTube to Chat Assistant App Project - 2026*
