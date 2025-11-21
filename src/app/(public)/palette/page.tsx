"use client";

import { useState, useEffect } from "react";
import { Heart, Trash, Plus } from "@phosphor-icons/react";
import { Copy, Check, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // Import koneksi database

// Definisikan tipe data sesuai struktur tabel Supabase
type SavedPalette = {
  id: number;
  created_at: string;
  season_name: string;
  colors: string[]; // Array of hex codes
};

export default function PalettePage() {
  const [palettes, setPalettes] = useState<SavedPalette[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // --- 1. FETCH DATA DARI SUPABASE ---
  useEffect(() => {
    fetchPalettes();
  }, []);

  const fetchPalettes = async () => {
    try {
      setLoading(true);
      // Select semua kolom, urutkan dari yang terbaru (descending)
      const { data, error } = await supabase
        .from('saved_palettes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPalettes(data || []);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. DELETE DATA ---
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Yakin ingin menghapus palet ini?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('saved_palettes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update UI secara lokal agar tidak perlu refresh
      setPalettes(palettes.filter(p => p.id !== id));
    } catch (err) {
      alert("Gagal menghapus data.");
      console.error(err);
    }
  };

  // --- 3. COPY CLIPBOARD UTILITY ---
  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Heart weight="fill" className="text-brand-600" />
                    Koleksi Palet Saya
                </h1>
                <p className="text-slate-500 mt-2">
                    Daftar rekomendasi warna yang telah Anda simpan dari hasil analisis AI.
                </p>
            </div>
            <Link href="/analyzer">
                <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-slate-900/20">
                    <Plus weight="bold" /> Scan Baru
                </button>
            </Link>
        </div>

        {/* CONTENT AREA */}
        {loading ? (
            // STATE 1: LOADING
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin mb-3 text-brand-500" />
                <p>Memuat koleksi warna Anda...</p>
            </div>
        ) : palettes.length === 0 ? (
            // STATE 2: EMPTY DATA
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Belum ada palet disimpan</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    Lakukan analisis wajah terlebih dahulu untuk mendapatkan rekomendasi warna yang cocok untuk Anda.
                </p>
                <Link href="/analyzer" className="text-brand-600 font-bold hover:underline">
                    Mulai Analisis Sekarang &rarr;
                </Link>
            </div>
        ) : (
            // STATE 3: DATA LIST
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {palettes.map((palette) => (
                    <div key={palette.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="bg-brand-50 text-brand-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-brand-100">
                                    {palette.season_name}
                                </span>
                                <p className="text-xs text-slate-400 mt-1">
                                    {new Date(palette.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric', month: 'long', year: 'numeric'
                                    })}
                                </p>
                            </div>
                            <button 
                                onClick={() => handleDelete(palette.id)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Hapus Palet"
                            >
                                <Trash size={18} />
                            </button>
                        </div>
                        
                        {/* Color Bars Preview */}
                        <div className="h-32 rounded-xl overflow-hidden flex shadow-inner mb-4 ring-1 ring-slate-900/5">
                            {palette.colors && palette.colors.map((color, i) => (
                                <div 
                                    key={i} 
                                    className="h-full flex-1 relative group/color cursor-pointer" 
                                    style={{ backgroundColor: color }}
                                    onClick={() => copyToClipboard(color)}
                                    title={color}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
                                        {copiedColor === color ? (
                                            <Check size={16} className="text-white scale-110" />
                                        ) : (
                                            <Copy size={16} className="text-white" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Hex Codes Scrollable */}
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {palette.colors && palette.colors.map((color, i) => (
                                <div key={i} className="shrink-0 flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded text-xs font-mono text-slate-600 hover:bg-slate-100 cursor-pointer" onClick={() => copyToClipboard(color)}>
                                    <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: color }}></div>
                                    {color}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}