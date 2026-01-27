# Shape Up Pitch: YouTube Video Chat Assistant

---

## 1. Problem

People want to quickly extract insights from YouTube videos without watching the entire content. Currently, users must:

* Watch full videos to locate specific information.
* Manually take notes or remember key points.
* Scrub through timestamps to re-find content.
* Lack a way to ask follow-up questions about the video.

This is increasingly painful as long-form educational and informational videos become more common.

**Who is affected:**
* **Students:** Studying from lecture recordings.
* **Researchers:** Referencing talks or presentations.
* **Professionals:** Reviewing conference sessions.
* **Lifelong Learners:** Anyone consuming educational content who needs fast answers.

---

## 2. Appetite

**Small batch: 1–2 weeks**

The goal of this project is to prove a concept. We want to validate usefulness and technical feasibility while minimizing spending. We will not spend a long time on surrounding technical infrastructure that isn't core to the POC.

---

## 3. Solution

### 3.1 Core Flow
1.  User pastes a YouTube URL.
2.  System searches for an existing audio transcript (Fast Scrape).
3.  If unavailable, system downloads audio and transcribes it using **Whisper**.
4.  User chats naturally about the video content.
5.  System maintains full transcript context throughout the session.

### 3.2 Technical Stack
* **Backend:** Flask
* **Transcription:** OpenAI Whisper (base model)
* **Frontend:** React.js + Vite
* **Hosting:** Temporary hosting with Google Colab (Ngrok tunnel)
* **Video Download:** `yt-dlp`
* **Hardware Constraint:** ~1GB VRAM required for Whisper base
* **Cost:** Completely free

### 3.3 Models and Accuracy
This project intentionally uses the **`base`** model:
* **Multilingual:** Supports 90+ languages.
* **Efficiency:** Acceptable accuracy for v1 while fitting within the 1GB VRAM constraint.
* **Speed:** Significantly faster than `medium` or `large` models.

### 3.4 Key Features
* Automatic transcript extraction.
* Session-based transcript storage.
* Natural chat interface over full video content.
* Persistent conversational context within a single session.

---

## 4. Rabbit Holes

### 4.1 VRAM Constraints
Whisper base requires approximately **1GB VRAM**.
* If VRAM is insufficient, transcription falls back to CPU and becomes much slower.
* Upgrading models (Medium: ~5GB, Large: ~6GB) is not feasible for this cost-free Colab-based approach.

### 4.2 Processing Time Expectations
* **Rough Estimation:** ~30s for a 5-minute video (based on local Postman tests).
* **Cap:** Video length should be capped to maximize runtime stability and minimize context window issues.

### 4.3 Concurrency Limits
The system should process **one transcription at a time**. Additional requests should wait or be rejected with a clear "System Busy" message.

### 4.4 Session Memory Growth
Large transcripts + long chats risk context overflow. We will manage this through video length caps rather than complex memory management or vector databases in this phase.

### 4.5 Colab Tunnel Stability
Google Colab proxies are temporary. If a session expires during a long process, the request will fail. We need to ensure the UI handles a "Disconnected" state gracefully.

---

## 5. No-Gos

To stay within the 2-week appetite, this project explicitly **does not** include:
* Permanent video/audio storage.
* Visual content analysis (audio/text only).
* User authentication or cross-device saved history.
* Playlist or multi-video support.
* Live stream transcription.
* Video editing or clipping.
* Scaling optimizations or complex job queues.
* Whisper model upgrades beyond `base`.

---

## 6. Context / Evidence

### 6.1 Use Cases
* **Student:** Searching for specific topics in a 2-hour lecture.
* **Professional:** Extracting key action items from a recorded town hall.
* **Researcher:** Verifying a specific claim made during a keynote panel.

### 6.2 Adjacent Needs
* Podcast transcript searchability.
* Tutorial step-by-step lookup.
* Meeting recording queries.

---
*--- End of Document ---*