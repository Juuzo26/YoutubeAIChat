Here is a clean, professional `README.md` for your backend. It focuses on technical clarity, architecture, and deployment instructions without the use of excessive emojis or icons.

---

# YouTube Chat Assistant - Backend API

This repository contains the backend service for the YouTube to Chat Assistant application. It is built with Flask and leverages a hybrid transcription pipeline and Google Gemini AI to provide interactive, context-aware conversations based on YouTube video content.

## Technical Overview

The backend is designed for efficiency and reliability, featuring a multi-stage transcription logic and an automated LLM fallback system for high availability.

### 1. Hybrid Transcription Pipeline

To minimize latency and resource consumption, the system uses a two-tier approach:

* **Fast Scrape (Primary):** Attempts to extract and clean existing YouTube subtitles/captions using `yt-dlp`. It includes a custom regex-based cleaning engine to remove VTT metadata and timestamp artifacts.
* **Whisper AI (Fallback):** If no subtitles are available, the system utilizes `Faster-Whisper` (running on CUDA if available) to perform local audio-to-text transcription.

### 2. Intelligent Transcript Refinement

Raw transcripts (from both scraping and Whisper) are passed through an LLM-based polishing stage. This ensures the text is formatted into readable Markdown paragraphs with corrected punctuation and capitalization without altering the original speaker's words.

### 3. Resilient LLM Chat System

The chat interface implements a fallback chain across multiple Google Gemini models (`gemini-2.5-flash-lite`, `gemini-3-flash`, etc.). This ensures that if a specific model's quota is exhausted, the request is automatically routed to the next available model.

---

## Core Requirements

* **Python:** 3.10 or higher
* **FFmpeg:** Required for audio processing and normalization.
* **Hardware:** NVIDIA GPU with CUDA support is recommended for Whisper transcription, though the system will automatically fallback to CPU mode.

---

## Installation and Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd backend

```


2. **Install dependencies:**
```bash
pip install -r requirements.txt

```


3. **Configure Environment Variables:**
Create a `.env` file in the project root with the following keys:
```env
GOOGLE_API_KEY=your_gemini_api_key
NGROK_AUTH_TOKEN=your_ngrok_token
LoggingLevel=INFO

```


4. **Start the Application:**
```bash
python main.py

```



---

## API Documentation

### POST `/process_full_video`

Retrieves the transcript for a given YouTube video.

* **Request Body:** `{"url": "string"}`
* **Returns:** JSON object containing the `video_name`, `transcript`, and processing `stats`.

### POST `/chat`

Generates a response based on the transcript and chat history.

* **Request Body:**
```json
{
  "message": "string",
  "transcript": "string",
  "history": [{"role": "user", "content": "..."}],
  "reply_style": "string"
}

```


* **Returns:** JSON object containing the AI `response` and the `model_used`.

### GET `/health`

Returns the operational status of the server and model initialization.

---

## Resource Management

The backend includes several safeguards for production stability:

* **GPU Semaphore:** Limits concurrent transcription tasks to prevent VRAM fragmentation.
* **System Health Check:** Rejects new transcription requests if available system RAM falls below 1.0 GB.
* **Memory Cleanup:** Explicitly invokes Python Garbage Collection and CUDA cache clearing after each video processing cycle.


