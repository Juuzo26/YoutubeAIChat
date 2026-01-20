from google.api_core import exceptions
import os
import torch
import tempfile
import threading
import logging
import shutil
import psutil
import time
import gc
import glob
import re
from faster_whisper import WhisperModel
import yt_dlp
from flask import Flask, request, jsonify
from flask_cors import CORS
from pyngrok import ngrok
from google import genai
from google.colab import userdata
from deep_translator import GoogleTranslator

# --- 1. Configuration & Utilities ---
MAX_CONCURRENT_TASKS = 8
gpu_semaphore = threading.Semaphore(MAX_CONCURRENT_TASKS)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] (Thread-%(thread)d) %(message)s',
    datefmt='%H:%M:%S',
    force=True
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

if DEVICE == "cuda":
    logger.info(f"GPU Detected: Parallel mode enabled (Limit: {MAX_CONCURRENT_TASKS})")
else:
    MAX_CONCURRENT_TASKS = 1
    logger.info("CPU Detected: Queue mode enabled")

# Global Model Placeholders
whisper_model = None
client = None

# --- 2. FAST SCRAPE LOGIC (The New Logic) ---
def try_fast_transcript(url):
    """Attempts to download and clean existing YouTube subtitles."""
    filename_template = 'sub_%(lang)s.%(ext)s'
    base_opts = {
        'skip_download': True,
        'writesubtitles': True,
        'writeautomaticsub': True,
        'outtmpl': filename_template,
        'ignoreerrors': True,
        'no_warnings': True,
        'quiet': True,
    }

    try:
        # Step A: Pre-Check Available Languages
        available_langs = []
        with yt_dlp.YoutubeDL({'quiet': True}) as ydl:
            info = ydl.extract_info(url, download=False)
            if 'subtitles' in info: available_langs.extend(info['subtitles'].keys())
            if 'automatic_captions' in info: available_langs.extend(info['automatic_captions'].keys())

        if not available_langs:
            return None, None

        # Step B: Priority List
        priority_list = ['en', 'en-orig', 'en-en', 'en-US', 'es', 'fr', 'de', 'ja', 'ko', 'zh-Hans']
        to_try = [l for l in priority_list if any(l in ex or ex in l for ex in available_langs)]
        if not to_try: to_try = [available_langs[0]]

        # Step C: Sequential Download
        target_file = None
        for lang in to_try:
            current_opts = base_opts.copy()
            current_opts['subtitleslangs'] = [lang]
            with yt_dlp.YoutubeDL(current_opts) as ydl:
                ydl.download([url])

            time.sleep(0.2)
            found_files = glob.glob("*.vtt")
            if found_files:
                target_file = found_files[0]
                break

        if not target_file: return None, None

        # Step D: Enhanced Process & Clean
        with open(target_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Remove VTT Headers and Metadata
        clean = re.sub(r'WEBVTT|Kind:.*|Language:.*|Style:.*', '', content)
        # 2. Remove Timestamps (00:00:00.000 --> 00:00:00.000)
        clean = re.sub(r'\d{2}:\d{2}:\d{2}.\d{3} --> \d{2}:\d{2}:\d{2}.\d{3}', '', clean)
        # 3. Remove HTML tags and CSS-like curly braces (including position metadata)
        clean = re.sub(r'<[^>]*>|\{.*?\}', '', clean)
        # 4. REMOVE "0%" ARTIFACTS AND COORDINATES
        # This targets things like "0%", "align:start", "position:0%" etc.
        clean = re.sub(r'\d+%', '', clean)
        clean = re.sub(r'align:.*|position:.*|line:.*|size:.*', '', clean)

        # Split into lines and clean up whitespace
        lines = [l.strip() for l in clean.splitlines() if l.strip()]

        # 5. Remove purely numeric lines (remaining line counters)
        lines = [l for l in lines if not re.match(r'^\d+$', l)]

        # 6. De-duplicate repeating lines (common in VTT)
        final_lines = []
        for line in lines:
            if not final_lines or line != final_lines[-1]:
                final_lines.append(line)

        final_text = " ".join(final_lines)

        # Cleanup
        for f in glob.glob("*.vtt"): os.remove(f)

        return final_text, info.get('title')

    except Exception as e:
        logger.error(f"Fast Scrape failed: {e}")
        return None, None

# --- 3. Model Loading & Stats ---

def get_stats():
    process = psutil.Process(os.getpid())
    ram_mb = process.memory_info().rss / (1024 * 1024)
    vram_mb = 0
    if DEVICE == "cuda":
        vram_mb = torch.cuda.memory_allocated() / (1024 * 1024)
    return ram_mb, vram_mb

def is_system_safe():
    available_ram_gb = psutil.virtual_memory().available / (1024**3)
    return available_ram_gb > 1.0

def load_all_models():
    global whisper_model, client
    print(f"--- Loading Optimized Models on {DEVICE} ---")
    try:
        compute_type = "float16" if DEVICE == "cuda" else "int8"
        whisper_model = WhisperModel("base", device=DEVICE, compute_type=compute_type)
        print(f"✅ Faster-Whisper Loaded")
    except Exception as e: print(f"❌ Whisper Load Error: {e}")

    try:
        api_key = userdata.get('MY_GEMINI_API_KEY')
        client = genai.Client(api_key=api_key)
        print("✅ Gemini AI Client Initialized")
    except Exception as e: print(f"❌ Gemini Error: {e}")

def get_video_info(url):
    start_time = time.time()
    tmpdir = tempfile.mkdtemp()
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(tmpdir, 'audio.%(ext)s'),
        'quiet': False,
        'noplaylist': True,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '32',
        }],
        'postprocessor_args': ['-af', 'loudnorm,silenceremove=1:0:-50dB', '-ar', '16000', '-ac', '1'],
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        downloaded_file = os.path.join(tmpdir, 'audio.mp3')
        return info, downloaded_file, tmpdir

# --- 4. API Routes ---

@app.route('/process_full_video', methods=['POST'])
def process_full_video():
    if not is_system_safe():
        return jsonify({"error": "Server overloaded. RAM low."}), 503

    req_start = time.time()
    data = request.get_json()
    url = data.get("url")

    if not url or ("youtube.com" not in url and "youtu.be" not in url):
        return jsonify({"error": "Invalid YouTube URL"}), 400

    # NEW LOGIC: TRY FAST SCRAPE FIRST
    scraped_text, scraped_title = try_fast_transcript(url)
    if scraped_text:
        total_dur = time.time() - req_start
        logger.info(f"🚀 FAST SCRAPE SUCCESS: {scraped_title} in {total_dur:.1f}s")
        return jsonify({
            "video_name": scraped_title,
            "transcript": scraped_text,
            "stats": {"duration": "Unknown (Scraped)", "proc_time": round(total_dur, 2)}
        })

    # FALLBACK TO WHISPER (Original Optimized Logic)
    logger.info("⚠️ No transcript found on YouTube. Falling back to Whisper AI...")
    with gpu_semaphore:
        tmpdir = None
        try:
            info, path, tmpdir = get_video_info(url)
            title = info.get('title', 'Video')

            segments, _ = whisper_model.transcribe(
                path,
                beam_size=1,
                vad_filter=True,
                vad_parameters=dict(min_silence_duration_ms=500),
                condition_on_previous_text=False
            )

            transcript = " ".join([segment.text for segment in segments]).strip()
            total_dur = time.time() - req_start

            return jsonify({
                "video_name": title,
                "transcript": transcript,
                "stats": {"duration": info.get('duration'), "proc_time": round(total_dur, 2)}
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            if tmpdir and os.path.exists(tmpdir): shutil.rmtree(tmpdir)
            gc.collect()
            if DEVICE == "cuda": torch.cuda.empty_cache()

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get("message")
    context_transcript = data.get("transcript")
    history = data.get("history", [])

    # Formatting the prompt for context-aware chat
    memory_block = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in history])
    full_prompt = (
        f"SYSTEM: Use the transcript to answer accurately. Use memory for context.\n"
        f"TRANSCRIPT:\n{context_transcript}\n\n"
        f"MEMORY:\n{memory_block}\n\n"
        f"USER: {user_message}\n"
    )

    # Ordered list of models to try (Fallback Chain)
    #gemini-2.5-flash-lite is often best for speed/cost balance in 2026
    model_priority = [
        'gemini-2.5-flash-lite',
        'gemini-3-flash',
        'gemini-2.5-flash'
    ]

    for model_name in model_priority:
        try:
            logger.info(f"Attempting chat with model: {model_name}")
            response = client.models.generate_content(
                model=model_name,
                contents=full_prompt
            )

            # If successful, return immediately
            return jsonify({
                "response": response.text,
                "model_used": model_name
            })

        except exceptions.ResourceExhausted:
            logger.warning(f"⚠️ Model {model_name} quota exhausted. Trying next fallback...")
            continue
        except Exception as e:
            logger.error(f"❌ Error with {model_name}: {str(e)}")
            continue

    return jsonify({
        "error": "All models exhausted or unavailable. Please try again in a minute.",
        "status": "out_of_tokens"
    }), 429

if __name__ == '__main__':
    load_all_models()
    NGROK_AUTH_TOKEN = userdata.get('NGROK_AUTH_TOKEN')
    ngrok.set_auth_token(NGROK_AUTH_TOKEN)
    public_url = ngrok.connect(5001, bind_tls=True, domain="notably-valid-bunny.ngrok-free.app")
    print(f"\n🚀 API URL: {public_url}\n")
    app.run(port=5001, threaded=True)
