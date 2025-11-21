"use client";

import { useState } from "react";
import { MagicWand, UploadSimple, ChartBar } from "@phosphor-icons/react";
import { Sparkles } from "lucide-react";

type AnalysisState = 'idle' | 'preview' | 'loading' | 'result';

export default function DemoSection() {
  const [status, setStatus] = useState<AnalysisState>('idle');
  const [loadingText, setLoadingText] = useState("Initializing...");
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleImageUpload = () => {
    // Simulasi upload gambar
    const dummyImage = "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1000&auto=format&fit=crop";
    setPreviewUrl(dummyImage);
    setStatus('preview');
  };

  const startSimulation = () => {
    if (status === 'idle') {
      alert("Silakan upload foto terlebih dahulu.");
      return;
    }

    setStatus('loading');
    const steps = [
      "Detecting Face Landmarks...",
      "Segmenting Skin Area...",
      "Analyzing Melanin Levels...",
      "Matching Color Theory...",
      "Finalizing Recommendations..."
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setLoadingText(steps[stepIndex]);
        stepIndex++;
      } else {
        clearInterval(interval);
        setStatus('result');
      }
    }, 800);
  };

  return (
    <section id="demo" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <span className="text-brand-400 font-semibold tracking-wider uppercase text-sm">Live Simulation</span>
          <h2 className="text-3xl font-bold mt-2">Coba Demo Sistem</h2>
          <p className="text-slate-400 mt-2">Unggah foto (mockup) dan lihat bagaimana AI bekerja.</p>
        </div>

        <div className="bg-slate-800 rounded-3xl p-6 md:p-10 border border-slate-700 shadow-2xl flex flex-col md:flex-row gap-8">
          
          {/* Left Column: Input */}
          <div className="flex-1 space-y-6">
            <div 
              onClick={handleImageUpload}
              className={`border-2 border-dashed border-slate-600 rounded-2xl h-64 flex flex-col items-center justify-center bg-slate-800/50 relative overflow-hidden group cursor-pointer hover:border-brand-500 transition-colors ${status === 'loading' ? 'pointer-events-none opacity-50' : ''}`}
            >
              {status === 'idle' ? (
                <div className="text-center p-6 z-10">
                  <UploadSimple className="text-4xl text-slate-400 mb-2 mx-auto group-hover:text-brand-400 transition-colors" />
                  <p className="text-sm text-slate-400">Klik untuk simulasi upload foto</p>
                </div>
              ) : (
                <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
              )}
            </div>
            
            <button 
              onClick={startSimulation}
              disabled={status !== 'preview'}
              className="w-full py-4 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <MagicWand weight="bold" className="text-xl" />
              {status === 'loading' ? 'Analyzing...' : 'Mulai Analisis AI'}
            </button>
          </div>

          {/* Right Column: Output */}
          <div className="flex-1 bg-slate-900 rounded-2xl p-6 border border-slate-700 relative min-h-[300px]">
            
            {/* State 1: Empty */}
            {(status === 'idle' || status === 'preview') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <ChartBar className="text-5xl mb-4 opacity-30" />
                <p>Hasil analisis akan muncul di sini</p>
              </div>
            )}

            {/* State 2: Loading */}
            {status === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-20">
                <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-brand-400 font-mono text-sm animate-pulse">{loadingText}</p>
              </div>
            )}

            {/* State 3: Result */}
            {status === 'result' && (
              <div className="space-y-4 animate-fade-in">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-white">Hasil Analisis</h4>
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-mono">CONFIDENCE: 94%</span>
                </div>
                
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">KATEGORI SKIN TONE</p>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#d6a180] border-2 border-white/20"></div>
                        <span className="text-xl font-bold text-white">Warm Autumn</span>
                    </div>
                </div>

                <div>
                    <p className="text-xs text-slate-400 mb-2">REKOMENDASI WARNA</p>
                    <div className="grid grid-cols-4 gap-2">
                        <div className="h-12 rounded bg-[#8c2f21]" title="Rust"></div>
                        <div className="h-12 rounded bg-[#d97d25]" title="Mustard"></div>
                        <div className="h-12 rounded bg-[#2e4a3d]" title="Olive"></div>
                        <div className="h-12 rounded bg-[#f5e6ca]" title="Cream"></div>
                    </div>
                </div>

                <div className="bg-brand-900/30 p-4 rounded-xl border border-brand-500/30 mt-4 flex gap-3">
                    <Sparkles className="w-5 h-5 text-brand-400 shrink-0 mt-1" />
                    <p className="text-sm text-slate-300 italic">"Hindari warna neon. Pilih Earth Tones untuk kesan elegan."</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}