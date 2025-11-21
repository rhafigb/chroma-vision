"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation"; 
import { Palette, Sun, Snowflake, CloudSun, Leaf, Robot, ArrowsClockwise } from "@phosphor-icons/react";
import { ArrowRight, Copy, Check, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// Kita hanya simpan Icon secara statis, warna dan deskripsi akan dari AI
const seasonIcons = {
    Spring: <Leaf size={24} />,
    Summer: <Sun size={24} />,
    Autumn: <CloudSun size={24} />,
    Winter: <Snowflake size={24} />
};

function MatcherContent() {
  const searchParams = useSearchParams();
  
  // State Utama
  const [activeSeason, setActiveSeason] = useState<string>('Autumn');
  
  // State Data dari AI
  const [aiPalette, setAiPalette] = useState<{
    colors: string[];
    description: string;
  } | null>(null);

  const [loadingAI, setLoadingAI] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 1. Deteksi URL Parameter & Trigger Fetch Pertama
  useEffect(() => {
    const seasonParam = searchParams.get('season');
    if (seasonParam) {
      // Normalisasi teks (misal: "warm autumn" -> "Autumn")
      const formatted = seasonParam.charAt(0).toUpperCase() + seasonParam.slice(1).toLowerCase();
      let detected = "Autumn"; // Default
      
      if (formatted.includes('Spring')) detected = 'Spring';
      else if (formatted.includes('Summer')) detected = 'Summer';
      else if (formatted.includes('Winter')) detected = 'Winter';
      
      setActiveSeason(detected);
      fetchColorsFromAI(detected); // Panggil AI saat load
    } else {
      // Jika tidak ada param, fetch default (Autumn)
      fetchColorsFromAI("Autumn");
    }
  }, [searchParams]);

  // 2. Fungsi Panggil Backend AI
  const fetchColorsFromAI = async (season: string) => {
    setLoadingAI(true);
    try {
        const response = await fetch("https://cytotrophoblastic-marita-topazine.ngrok-free.dev/recommend-colors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ season: season })
        });
        
        const result = await response.json();
        
        if (result.status === "success") {
            setAiPalette(result.data);
        } else {
            console.error("AI Error");
        }
    } catch (e) {
        console.error("Network Error", e);
    } finally {
        setLoadingAI(false);
    }
  };

  // Handler Ganti Tab Musim
  const handleSeasonChange = (season: string) => {
      setActiveSeason(season);
      fetchColorsFromAI(season);
  };

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleSavePalette = async () => {
    if (!aiPalette) return;
    
    setIsSaving(true);
    setSaveStatus('idle');
    try {
        const { error } = await supabase.from('saved_palettes').insert([
            { season_name: activeSeason, colors: aiPalette.colors }
        ]);
        if (error) throw error;
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
        console.error("Error saving:", err);
        setSaveStatus('error');
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 relative">
        
        {/* BUTTON FLOAT CHATBOT */}
        <Link 
            href={`/chatbot?season=${activeSeason}`}
            className="fixed bottom-8 right-6 md:right-12 bg-teal-600 hover:bg-teal-700 text-white px-5 py-4 rounded-full shadow-xl shadow-teal-600/30 flex items-center gap-3 z-50 animate-bounce transition-all hover:scale-110"
        >
            <Robot size={28} weight="fill" />
            <div className="hidden md:block text-left">
                <p className="text-[10px] opacity-80 uppercase font-bold leading-none">Tanya Gemini</p>
                <p className="text-sm font-bold leading-none">AI Stylist</p>
            </div>
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-1 rounded-full text-sm font-bold mb-4 border border-brand-200">
            <Sparkles size={16} className="text-brand-600" /> Generative Color Engine
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">AI Fashion Palette</h1>
        </div>

        {/* TAB SELECTOR */}
        <div className="grid grid-cols-4 gap-2 md:gap-4 mb-12 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          {Object.keys(seasonIcons).map((season) => (
            <button
              key={season}
              onClick={() => handleSeasonChange(season)}
              className={`flex flex-col items-center justify-center py-4 rounded-xl transition-all duration-300 ${
                activeSeason === season 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105' 
                  : 'hover:bg-slate-50 text-slate-500'
              }`}
            >
              <div className="mb-2">{seasonIcons[season as keyof typeof seasonIcons]}</div>
              <span className="text-xs md:text-sm font-bold">{season}</span>
            </button>
          ))}
        </div>

        {/* PALETTE DISPLAY CARD */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 animate-fade-in mb-20 min-h-[300px] relative">
          
          {/* Loading Overlay */}
          {loadingAI && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-3xl">
                  <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-2" />
                  <p className="text-slate-500 text-sm font-medium animate-pulse">Meracik warna...</p>
              </div>
          )}

          {aiPalette && (
            <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            {activeSeason} Palette
                            <span className="text-[10px] font-bold text-white px-2 py-1 bg-linear-to-r from-purple-500 to-brand-500 rounded-full">AI GEN</span>
                        </h2>
                        <p className="text-slate-500 mt-2 text-sm max-w-lg leading-relaxed">
                            {aiPalette.description}
                        </p>
                    </div>
                    
                    <div className="flex gap-2">
                        {/* Tombol Refresh AI */}
                        <button 
                            onClick={() => fetchColorsFromAI(activeSeason)}
                            disabled={loadingAI}
                            className="p-2.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 border border-slate-200 rounded-xl transition-all"
                            title="Generate Ulang"
                        >
                            <ArrowsClockwise size={20} className={loadingAI ? "animate-spin" : ""} />
                        </button>

                        {/* Tombol Simpan */}
                        <button 
                            onClick={handleSavePalette}
                            disabled={isSaving || saveStatus === 'success' || loadingAI}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                                saveStatus === 'success' 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-slate-900 text-white hover:bg-brand-600 hover:shadow-lg shadow-brand-500/20'
                            }`}
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : saveStatus === 'success' ? <Check size={16} /> : <ArrowRight size={16} />}
                            {saveStatus === 'success' ? 'Tersimpan!' : 'Simpan'}
                        </button>
                    </div>
                </div>

                {/* Grid Warna Dinamis */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {aiPalette.colors.map((color, idx) => (
                        <div 
                            key={idx} 
                            className="group relative aspect-square rounded-2xl shadow-sm cursor-pointer transition-transform hover:scale-105 hover:shadow-md border border-slate-100" 
                            style={{ backgroundColor: color }}
                            onClick={() => copyToClipboard(color)}
                        >
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-lg">
                                    {copiedColor === color ? <Check size={20} className="text-green-600" /> : <Copy size={20} className="text-slate-800" />}
                                </div>
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 bg-black/20 backdrop-blur-md rounded px-2 py-1">
                                <p className="text-[10px] font-mono font-bold text-white text-center uppercase shadow-sm">{color}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </>
          )}
        </div>
    </div>
  );
}

export default function MatcherPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-10">
      <Suspense fallback={<div className="text-center pt-20">Loading AI Matcher...</div>}>
        <MatcherContent />
      </Suspense>
    </div>
  );
}