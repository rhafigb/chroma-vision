"use client";

import { useState, useEffect, useRef } from "react";
// Lucide Icons
import { RefreshCw, Loader2, AlertTriangle, Eye, EyeOff, Upload, Sparkles } from "lucide-react";
// Phosphor Icons
import { Scan, UserFocus, Aperture, Camera, CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// --- HELPER: Convert Base64 to Blob ---
function dataURLtoBlob(dataurl: string) {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'; 
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export default function AnalyzerPage() {
  // --- STATE ---
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // State Hasil (Updated dengan field 'reason')
  const [result, setResult] = useState<null | { 
    tone: string; 
    confidence: number; 
    maskedImage?: string; 
    reason?: string; 
  }>(null);

  // --- REFS ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. KAMERA SETUP ---
  const startCamera = async () => {
    setPermissionError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreamActive(true);
      }
    } catch (err) {
      console.error("Camera Error:", err);
      setPermissionError(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreamActive(false);
    }
  };

  // --- 2. PROSES UTAMA (API CALL) ---
  const processImage = async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    setShowDebug(false); // Reset tampilan debug

    try {
      // A. Persiapan Data
      const blob = dataURLtoBlob(imageDataUrl);
      const formData = new FormData();
      formData.append("file", blob, "scan.png");

      // B. Kirim ke Backend Python (Ganti URL jika sudah deploy)
      const response = await fetch("https://cytotrophoblastic-marita-topazine.ngrok-free.dev/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "success") {
        // C. Simpan ke Supabase
        // Kita simpan 'reason' di kolom 'rgb_value' agar tidak perlu ubah struktur tabel
        const { error: dbError } = await supabase.from('scans').insert([{ 
            tone_result: data.tone,
            confidence: data.confidence,
            rgb_value: data.reason || "Analisis AI Vision"
        }]);
          
        if (dbError) console.error("DB Error:", dbError);

        // D. Update UI
        setResult({ 
          tone: data.tone, 
          confidence: data.confidence,
          maskedImage: data.features?.masked_image,
          reason: data.reason 
        });

      } else {
        alert("Gagal: " + (data.message || "Unknown Error"));
        handleReset();
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Gagal terhubung ke Backend Python.");
      handleReset();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- 3. INPUT HANDLERS ---
  
  // Handler Webcam
  const captureFromWebcam = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (context) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1); // Mirroring
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageDataUrl = canvas.toDataURL('image/png');
      setCapturedImage(imageDataUrl);
      stopCamera();
      processImage(imageDataUrl);
    }
  };

  // Handler Upload File
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCapturedImage(base64String);
        stopCamera();
        processImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler Reset
  const handleReset = () => {
    setCapturedImage(null);
    setResult(null);
    setIsAnalyzing(false);
    startCamera();
  };

  // Lifecycle
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white pt-24 pb-10 px-4 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        
        {/* HEADER */}
        <header className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/50 text-brand-300 text-xs font-bold uppercase border border-brand-700/50">
             <Aperture size={16} /> Hybrid AI Vision
          </div>
          <h1 className="text-3xl font-bold">AI Skin Analyzer</h1>
          <p className="text-slate-400">Posisikan wajah di bingkai atau unggah foto close-up.</p>
        </header>

        {/* VIEWPORT AREA */}
        <div className="relative aspect-3/4 md:aspect-video bg-black rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl mb-8 group">
          
          {/* Permission Error */}
          {permissionError && !capturedImage && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-20 bg-slate-900">
               <AlertTriangle size={32} className="text-red-500 mb-2"/>
               <p>Akses kamera ditolak. Silakan gunakan tombol Upload.</p>
             </div>
          )}

          {/* Video Stream */}
          {!capturedImage && (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
          )}

          {/* Captured Image Result */}
          {capturedImage && (
            <div className="relative w-full h-full">
                <img 
                    src={showDebug && result?.maskedImage ? `data:image/jpeg;base64,${result.maskedImage}` : capturedImage} 
                    alt="Captured" 
                    className={`w-full h-full object-cover transition-all duration-500 ${isAnalyzing ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                />
                {/* Toggle Debug View (Hanya jika ada masked image) */}
                {result?.maskedImage && (
                    <button onClick={() => setShowDebug(!showDebug)} className="absolute top-4 right-4 z-30 bg-black/60 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2 hover:bg-brand-600 transition-colors">
                        {showDebug ? <><Eye size={14} className="text-green-400"/> AI View</> : <><EyeOff size={14}/> Original</>}
                    </button>
                )}
            </div>
          )}

          {/* Face Guide Overlay (Hanya saat live camera) */}
          {!capturedImage && !permissionError && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                 <UserFocus size={32} className="text-white/50 animate-pulse" />
                 {/* Bingkai Sudut */}
                 <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-500 rounded-tl-2xl"></div>
                 <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-500 rounded-tr-2xl"></div>
                 <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-500 rounded-bl-2xl"></div>
                 <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-500 rounded-br-2xl"></div>
             </div>
          )}
          
          {/* Loading Indicator */}
          {isAnalyzing && (
            <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center">
               <Loader2 className="animate-spin text-brand-400 w-12 h-12 mb-3" />
               <span className="text-brand-200 font-mono text-sm animate-pulse px-4 py-1 bg-black/50 rounded-full">Analyzing Biometrics...</span>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* CONTROLS SECTION */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            {!result ? (
                // STATE 1: INPUT BUTTONS
                <div className="flex gap-3">
                    <button 
                        onClick={captureFromWebcam} 
                        disabled={!isStreamActive || isAnalyzing}
                        className="flex-1 py-4 bg-brand-600 hover:bg-brand-500 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:bg-slate-700"
                    >
                        <Camera weight="fill" className="w-6 h-6" />
                        <span className="hidden md:inline">Ambil Foto</span>
                    </button>

                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isAnalyzing}
                        className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        <Upload className="w-6 h-6" />
                        <span className="hidden md:inline">Upload</span>
                    </button>
                </div>
            ) : (
                // STATE 2: RESULT CARD
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-600 relative overflow-hidden">
                        <div className="absolute left-0 top-0 w-1 h-full bg-linear-to-b from-brand-500 to-purple-600"></div>
                        
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">AI Result</p>
                                <h3 className="text-3xl font-bold text-white">{result.tone}</h3>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end gap-1.5 text-green-400 mb-1">
                                    <CheckCircle size={18} weight="fill" />
                                    <span className="font-mono font-bold text-lg">{result.confidence}%</span>
                                </div>
                                <span className="text-[10px] text-slate-500">Confidence</span>
                            </div>
                        </div>

                        {/* Reasoning Display (Fitur Baru) */}
                        {result.reason && (
                            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                <p className="text-xs text-brand-300 font-bold mb-1 flex items-center gap-1">
                                    <Sparkles size={12} className="text-brand-300"/> AI Reasoning:
                                </p>
                                <p className="text-xs text-slate-300 leading-relaxed italic">
                                    "{result.reason}"
                                </p>
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={handleReset} className="py-3 bg-slate-700 hover:bg-slate-600 hover:text-white text-slate-300 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                            <RefreshCw size={18} /> Scan Ulang
                        </button>
                        
                        <Link 
                            href={`/matcher?season=${result.tone.split(' ')[1] || 'Autumn'}`} 
                            className="py-3 bg-white text-brand-900 hover:bg-brand-50 rounded-xl font-bold flex items-center justify-center gap-2 text-center shadow-lg shadow-white/5 transition-colors"
                        >
                             Lihat Outfit <Scan size={18} weight="bold" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}