# Technical Design Document: YouTube Video Chat Assistant

**Date:** January 21, 2026

---

## 1. Executive Summary

### 1.1 Project Objective
The **YouTube-to-Chat Assistant** is an AI-powered platform designed to transform long-form video content into an interactive, conversational experience. By providing a YouTube URL, users can instantly retrieve a video transcript and engage with a chatbot to extract specific insights, summarize key takeaways, and ask follow-up questions. A core feature of the system is the ability for users to define a **desired style of reply** (e.g., academic, ELI5, or bulleted summary), ensuring the learning experience is tailored to their specific needs.

### 1.2 Problem Statement
Currently, consumers of informational video content face several inefficiencies:
* **Time Inefficiency:** Users must watch full videos to locate specific information, often wasting time on non-relevant segments.
* **Cognitive Load:** Manually taking notes or attempting to remember key points from a 60-minute lecture is prone to error.
* **Searchability Issues:** Scrubbing through timestamps to re-find specific content is tedious and imprecise.
* **Static Consumption:** Traditional video platforms lack a mechanism for users to ask clarifying or follow-up questions regarding the content.

### 1.3 Target Audience
This solution addresses the needs of individuals who consume high-density information on YouTube, including:
* **Students:** Reviewing lecture recordings or educational tutorials for exam preparation.
* **Researchers:** Referencing keynote talks, panel discussions, or technical presentations.
* **Professionals:** Reviewing recorded conference sessions, industry webinars, or town hall meetings.
* **Lifelong Learners:** Anyone seeking to optimize their learning speed and extract fast, actionable answers from video data.

---

## 2. System Architecture
The system utilizes a decoupled architecture where the React frontend manages long-term persistence, and the Python backend provides high-performance, ephemeral inference.

* **Frontend:** React.js + Vite utilizing Context API for state management.
* **Backend:** Flask running on Google Colab, exposed via Ngrok tunneling.
* **Processing Pipeline:** Dual-pathway logic (Fast Scrape via `yt-dlp` → Fallback to `Faster-Whisper` on GPU).

> **Architecture Note:** The interaction occurs between the Client Browser, Flask API, and the Colab Filesystem.

---

## 3. User Experience & Logic

### 3.1 Use Case Diagram
The system orchestrates external API services while defining functional boundaries for user interaction, primarily focusing on URL ingestion and AI-driven dialogue.

### 3.2 User Flow
The logical journey ensures that the system prioritizes speed by checking for existing data (Fast Scrape) before engaging heavy GPU resources for transcription.

### 3.3 Sequence Diagram (Data Lifecycle)
1.  **UI:** User submits URL.
2.  **Backend:** Checks for subtitles; if none, downloads audio and runs Whisper.
3.  **LLM Phase:** Gemini polishes the transcript for readability.
4.  **UI:** Displays formatted transcript and enables chat.

---

## 4. Data Storage Specification & Backend

### 4.1 Data Storage Model
This application does not use a traditional database service.
* **Global Video Data (`yt_ai_chat_history`):** Stores the URL, Title, and Transcript of the last 5 videos using an LRU (Least Recently Used) cache in LocalStorage.
* **Dynamic Chat Memory (`chat_history_{name}`):** Persists individual message threads and user-selected AI reply styles per video in LocalStorage.
* **Backend Temp Storage:** Creates isolated directories using `tempfile.mkdtemp()` for audio processing, wiped immediately after transcription.

### 4.2 API Endpoints

| Method | Endpoint | Description | Target |
| :--- | :--- | :--- | :--- |
| POST | `/process_full_video` | Scrapes/Transcribes video | Colab GPU/Disk |
| POST | `/chat` | Generates AI response via Gemini | Gemini API |
| GET | `/health` | Verifies tunnel connectivity | Backend Status |

### 4.3 Backend Logic & Processing
The backend is a Python engine hosted on Google Colab, utilizing Flask for orchestration and asynchronous threading.

#### Resource Orchestration
* **Concurrency Control:** Limits the system to `MAX_CONCURRENT_TASKS` (default: 8) using a threading semaphore.
* **Memory Management:** Forces garbage collection (`gc.collect()`) and clears CUDA cache (`torch.cuda.empty_cache()`) after every cycle.
* **System Safety:** Health-check returns a `503 Service Unavailable` if system RAM falls below 1.0GB.

#### Transcription Pipeline (The Dual-Pathway)
1.  **Tier 1 (Fast Scrape):** Utilizes `yt-dlp` to extract existing VTT/SRT subtitles. Cleans metadata using RegEx.
2.  **Tier 2 (AI Inference):** Fallback to **Faster-Whisper** using `float16` precision on GPU.
3.  **Refinement:** **Gemini Flash** reformats raw text into readable Markdown without altering the original words.

#### AI Model Fallback Chain
| Priority | Model Name | Reason for Selection |
| :--- | :--- | :--- |
| 1 (Primary) | `gemini-3-flash-preview` | Superior reasoning for complex transcripts. |
| 2 (Secondary) | `gemini-2.5-flash` | High-reliability fallback. |
| 3 (Tertiary) | `gemini-2.5-flash-lite` | Lowest latency, high rate limits. |

---

## 5. Frontend Specification

### 5.1 Component Architecture
Built on atomic design principles using **React 19** and **Vite**, styled with **Tailwind CSS**.

| Component Layer | Responsibility |
| :--- | :--- |
| `App.jsx` | Root orchestrator for the application lifecycle. |
| `VideoInput.jsx` | Entry point for URL ingestion and cache validation. |
| `TranscriptPanel.jsx` | Renders processed data using `react-markdown`. |
| `ChatPanel.jsx` | Interactive messaging interface with persona management. |
| `SettingsModal.jsx` | Configuration for backend auth and session cookies. |

### 5.2 Global State Management
State is managed via the **React Context API**.
* **Data Flow:** User Action → Context Reducer → API Service → State Update → Re-render.
* **Persistency:** Data is partitioned into `yt_ai_chat_history`, `chat_history_{name}`, and `ai_style_library` within `LocalStorage`.

---

## 6. Limitations & Future Directions

### 6.1 Current Technical Limitations
* **Ephemeral Backend:** Google Colab environments are non-persistent.
* **Stateless Authentication:** No OAuth/Login; no personalized cloud profiles.
* **Storage Volatility:** Data is "siloed" to the specific browser/device.

### 6.2 Future Directions & Simple Scaling
* **Integrated Video Visualization:** Synchronized video rendering alongside transcripts.
* **Voice-to-Query Interface:** Hands-free voice-input for mobile users.
* **Hybrid Serverless Architecture:** Moving "Fast Scrape" to AWS Lambda to save GPU costs.
* **Orchestration with Haystack:** Transitioning to industry-standard RAG components for document indexing and retrieval.

---
*--- End of Document ---*