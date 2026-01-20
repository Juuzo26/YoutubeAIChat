# Project Task List: Vid2Chat (YouTube Video Chat Assistant)

This document outlines the tasks required to build the **Vid2Chat** assistant, focusing on a functional 1~2-week "Small Batch" cycle. The technical stack includes Flask, Whisper (base), React, and Google Colab.

---

## Phase 1: Development
*Focus: Building the end-to-end functionality from video processing to chat.*

### A. Backend & Core Engine
| Task | Description | Est. Hours |
| :--- | :--- | :--- |
| **Project Setup** | Initialize Flask environment and install `yt-dlp`, `whisper`, and `openai` libraries. | 2 |
| **Audio Extraction** | Implement `yt-dlp` logic to download audio streams from YouTube URLs. | 2 |
| **Transcription Service** | Uses OpenAI Whisper (`base`) with ffmpeg-based audio extraction to convert video/audio input into text transcripts. | 2 |
| **Chat Logic & Prompting** | Setup the LLM prompt to include both the transcript and the conversation as context for user questions. | 3 |
| **API Endpoints** | Build endpoints for `/process-video` (transcription) and `/chat` (messaging). | 3 |

### B. Frontend (React + Vite)

*Focus: Implementing the UI and logic according to the modular folder structure.*

| Task | Description | Est. Hours |
| :--- | :--- | :--- |
| **UI Scaffolding & Config** | Setup Vite, Tailwind, and folder structure (`components`, `hooks`, `utils`). | 2 |
| **Modular Component Build** | Build `VideoInput`, `ChatPanel`, and `TranscriptPanel` as standalone components. | 4 |
| **Custom Hooks Logic** | Implement `useVideoChat` and `useChat` to handle API calls and message states. | 3 |
| **Input & Validation** | Develop `validators.js` for URL checking and `ProcessingIndicator` for feedback. | 2 |
| **State & Context Sync** | Ensure `TranscriptPanel` and `ChatPanel` correctly share the video context. | 2 |

- **Subtotal Development Duration:**  **25 hrs**

---

## Phase 2: Testing
*Focus: Ensuring the app handles real videos and manages hardware constraints.*

| Task | Description | Est. Hours |
| :--- | :--- | :--- |
| **Automation** | Testing performances of the web application with increasing capabilities | 4 |
| **Hardware Optimization** | Test VRAM consumption on Colab to ensure the `base` model runs without crashing. | 2 |
| **Edge Case Handling** | Logic to handle invalid URLs, very long videos, or network timeouts. | 3 |
| **Optimization** | From testing we may find out small details we need to optimize. | 4 |
| **Benchmarking** | Testing how different functions works in terms of runtime, resources usage, capacity, stability and limitations   | 2 |
| **Functional E2E Test** | Conduct "perfect path" testing with 5-minute tutorial demo videos. | 1 |
| **Subtotal Testing Duration** | | **12 hrs** |

---

## Phase 3: Deployment
*Focus: Making the application accessible and documented.*

| Task | Description | Est. Hours |
| :--- | :--- | :--- |
| **Backend Tunneling** | Use Ngrok or LocalTunnel to expose the Colab Flask server while making sure the keys are not exposed. | 2 |
| **Frontend Hosting** | Deploy the React application to Render. | 2 |
| **Setup Documentation** | Create a "How to Start" guide covering the Colab notebook, API keys and Frontend project struture files. | 2 |
| **Subtotal Deployment Duration** | | **6 hrs** |

---

## Final Estimation Summary

| Phase | Total Hours |
| :--- | :--- |
| **1. Development** | 25 |
| **2. Testing** | 11 |
| **3. Deployment** | 6 |
| **TOTAL** | **42 Hours** |

> **Timeline:** Estimated to be ~21 hours per week, this project is estimated for completion in **1 ~ 2 weeks**.

---
*End of Document*