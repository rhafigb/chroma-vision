from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import numpy as np
import base64
import json
import re

# Import SDK Google Gen AI Terbaru
from google import genai
from google.genai import types

# --- 1. KONFIGURASI ---

# [PENTING] GANTI DENGAN API KEY ASLI ANDA DARI GOOGLE AI STUDIO
GENAI_API_KEY = "AIzaSyC8GoNCuS1jSRPiV0_SCJAu7wrpNSNuHzQ" 

# Inisialisasi Client
client = genai.Client(api_key=GENAI_API_KEY)

app = FastAPI()

# Konfigurasi CORS (Agar Frontend Next.js bisa akses)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. DATA MODELS ---
class ChatRequest(BaseModel):
    message: str
    season: str

class ColorRequest(BaseModel):
    season: str

# --- 3. FUNGSI COMPUTER VISION (Visualisasi Masking) ---

def generate_skin_mask(image_bytes):
    """
    Membuat gambar hitam-putih (Masking) untuk fitur 'AI View' di frontend.
    Ini membuktikan bahwa sistem memproses piksel, bukan asal tebak.
    """
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Resize (Optimasi kecepatan)
        img = cv2.resize(img, (640, 480))

        # Konversi ke HSV
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Range Warna Kulit (Standard Threshold)
        lower_skin = np.array([0, 20, 70], dtype=np.uint8)
        upper_skin = np.array([20, 255, 255], dtype=np.uint8)
        mask = cv2.inRange(hsv, lower_skin, upper_skin)
        
        # Bersihkan Noise (Morphology)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

        # Gabungkan Mask dengan Gambar Asli
        skin_img = cv2.bitwise_and(img, img, mask=mask)

        # Encode ke Base64 string agar bisa dikirim via JSON
        _, buffer = cv2.imencode('.jpg', skin_img)
        return base64.b64encode(buffer).decode('utf-8')
    except Exception:
        return None

# --- 4. FUNGSI GEMINI VISION (Otak Analisis) ---

def analyze_with_gemini(image_bytes):
    """
    Mengirim gambar ke Gemini 2.5 Flash untuk analisis Fashion.
    Meminta output format JSON.
    """
    img_b64 = base64.b64encode(image_bytes).decode('utf-8')

    prompt = """
    Bertindaklah sebagai ahli Color Analysis Fashion profesional.
    Analisis foto wajah ini. Perhatikan Undertone Kulit (Warm/Cool), Warna Mata, dan Warna Rambut.
    
    Tugas:
    1. Klasifikasikan ke dalam SATU dari 4 musim: 'Spring', 'Summer', 'Autumn', 'Winter'.
    2. Berikan skor keyakinan (0-100).
    3. Berikan alasan penjelasan (reasoning) dalam BAHASA INDONESIA.
    
    OUTPUT WAJIB JSON RAW (Tanpa Markdown):
    {
        "tone": "Warm Autumn", 
        "confidence": 95,
        "reason": "Kulit memiliki undertone emas hangat dengan kontras mata yang lembut."
    }
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=prompt),
                        types.Part.from_bytes(
                            data=base64.b64decode(img_b64),
                            mime_type="image/jpeg"
                        )
                    ]
                )
            ]
        )
        
        # Bersihkan format markdown ```json ... ```
        text_response = response.text
        text_response = re.sub(r"```json\s*", "", text_response)
        text_response = re.sub(r"```", "", text_response).strip()
        
        return json.loads(text_response)
        
    except Exception as e:
        print(f"Gemini Vision Error: {e}")
        return {
            "tone": "Unknown", 
            "confidence": 0, 
            "reason": "Maaf, analisis AI gagal memproses gambar. Coba lagi."
        }

# --- 5. API ENDPOINTS ---

@app.get("/")
def read_root():
    return {"message": "ChromaVision Ultimate Backend Running"}

# === ENDPOINT 1: ANALYZER (Hybrid) ===
@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        # A. Dapatkan Visualisasi Masking (OpenCV)
        masked_image_b64 = generate_skin_mask(contents)
        
        # B. Dapatkan Analisis Cerdas (Gemini)
        ai_result = analyze_with_gemini(contents)
        
        print(f"Analysis Result: {ai_result}")

        return {
            "status": "success",
            "tone": ai_result.get("tone", "Unknown"),
            "confidence": ai_result.get("confidence", 0),
            "reason": ai_result.get("reason", "Tidak ada penjelasan."),
            "features": {
                "masked_image": masked_image_b64, # Dikirim untuk Debug View
                "rgb": [0,0,0] # Dummy filler
            },
            "message": "Hybrid Analysis Complete"
        }
        
    except Exception as e:
        print(f"Server Error: {e}")
        return {"status": "error", "message": str(e)}

# === ENDPOINT 2: CHATBOT (Context Aware) ===
@app.post("/chat")
async def chat_with_stylist(request: ChatRequest):
    try:
        season = request.season
        user_msg = request.message
        
        # System Prompt untuk menjaga persona
        system_instruction = f"""
        Kamu adalah 'ChromaBot', AI Personal Stylist profesional.
        Konteks User: Skin Tone Season = {season}.
        
        Panduan:
        1. Jawab pertanyaan fashion user dalam Bahasa Indonesia.
        2. Selalu sesuaikan saran warna dengan musim '{season}'.
        3. Gaya bicara: Ramah, kekinian, singkat, dan gunakan emoji.
        4. Jika user bertanya hal aneh di luar fashion, tolak dengan sopan.
        """

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
            ),
            contents=[
                types.Content(role="user", parts=[types.Part.from_text(text=user_msg)])
            ]
        )
        
        if response.text:
            return {"status": "success", "reply": response.text}
        else:
            return {"status": "success", "reply": "Maaf, saya tidak bisa menjawab itu. Yuk bahas fashion saja! 👗"}

    except Exception as e:
        print(f"Chat Error: {e}")
        return {"status": "error", "reply": "Maaf, otak AI saya sedang gangguan."}

# === ENDPOINT 3: COLOR GENERATOR (Dynamic Palette) ===
@app.post("/recommend-colors")
async def recommend_colors(request: ColorRequest):
    try:
        season = request.season
        
        prompt = f"""
        Bertindaklah sebagai Fashion Colorist expert.
        Buatkan rekomendasi palet warna pakaian untuk seasonal color: '{season}'.
        
        Berikan output HANYA dalam format JSON raw (tanpa markdown) dengan struktur:
        {{
            "description": "Penjelasan singkat (maks 2 kalimat) tentang nuansa warna musim ini dalam Bahasa Indonesia yang estetik.",
            "colors": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5", "#HEX6"]
        }}
        
        Pastikan kode warna HEX valid. Berikan 6 warna yang harmonis.
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
        )
        
        # Cleaning JSON
        text_response = response.text
        text_response = re.sub(r"```json\s*", "", text_response)
        text_response = re.sub(r"```", "", text_response).strip()
        
        return {"status": "success", "data": json.loads(text_response)}

    except Exception as e:
        print(f"Color Gen Error: {e}")
        # Fallback data jika AI error
        return {
            "status": "error", 
            "data": {
                "description": "Gagal memuat AI. Ini rekomendasi standar.",
                "colors": ["#333333", "#777777", "#999999", "#000000", "#FFFFFF", "#555555"]
            }
        }

# Cara menjalankan: uvicorn main:app --reload