"use client";

import { useState, useEffect } from "react";
import { Palette, Plus, Trash, X, Check } from "@phosphor-icons/react";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";

type SeasonData = {
  id: number;
  name: string;
  colors: string[];
};

export default function ColorMasterPage() {
  const [seasons, setSeasons] = useState<SeasonData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk mode edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempColors, setTempColors] = useState<string[]>([]); // Menyimpan perubahan sementara
  const [newColorInput, setNewColorInput] = useState("#000000");

  // --- 1. READ DATA ---
  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('master_seasons')
      .select('*')
      .order('name', { ascending: true });
      
    if (!error) setSeasons(data || []);
    setLoading(false);
  };

  // --- 2. MULAI EDIT ---
  const startEdit = (season: SeasonData) => {
    setEditingId(season.id);
    setTempColors([...season.colors]); // Copy array agar tidak merubah state asli langsung
    setNewColorInput("#000000");
  };

  // --- 3. BATAL EDIT ---
  const cancelEdit = () => {
    setEditingId(null);
    setTempColors([]);
  };

  // --- 4. ADD COLOR (LOCAL STATE) ---
  const handleAddColor = () => {
    // Validasi format hex sederhana
    if (!/^#[0-9A-F]{6}$/i.test(newColorInput)) {
      alert("Format warna harus Hex Code (contoh: #FF0000)");
      return;
    }
    if (!tempColors.includes(newColorInput)) {
      setTempColors([...tempColors, newColorInput]);
    }
  };

  // --- 5. DELETE COLOR (LOCAL STATE) ---
  const handleRemoveColor = (colorToRemove: string) => {
    setTempColors(tempColors.filter(c => c !== colorToRemove));
  };

  // --- 6. SAVE CHANGES TO DB (UPDATE) ---
  const saveChanges = async (id: number) => {
    const { error } = await supabase
      .from('master_seasons')
      .update({ colors: tempColors })
      .eq('id', id);

    if (!error) {
      // Update UI state lokal agar tidak perlu fetch ulang
      setSeasons(seasons.map(s => s.id === id ? { ...s, colors: tempColors } : s));
      setEditingId(null);
    } else {
      alert("Gagal menyimpan perubahan.");
      console.error(error);
    }
  };

  if (loading) {
      return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Color Master Data</h1>
        <p className="text-slate-500 text-sm">Kelola referensi palet warna untuk setiap musim.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {seasons.map((item) => (
          <div key={item.id} className={`bg-white p-6 rounded-2xl border transition-all ${editingId === item.id ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200 shadow-sm'}`}>
            
            {/* Card Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${editingId === item.id ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-600'}`}>
                        <Palette size={24} weight="fill"/>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">{item.name} Palette</h3>
                </div>

                {/* Action Buttons */}
                {editingId === item.id ? (
                    <div className="flex gap-2">
                        <button onClick={cancelEdit} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg" title="Batal">
                            <X size={20} />
                        </button>
                        <button onClick={() => saveChanges(item.id)} className="flex items-center gap-2 px-3 py-1.5 bg-brand-600 text-white text-sm font-bold rounded-lg hover:bg-brand-700 shadow-lg shadow-brand-500/30">
                            <Save size={16} /> Simpan
                        </button>
                    </div>
                ) : (
                    <button onClick={() => startEdit(item)} className="text-sm text-brand-600 font-bold hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors">
                        Edit Warna
                    </button>
                )}
            </div>
            
            {/* Colors Area */}
            {editingId === item.id ? (
                // --- MODE EDIT ---
                <div className="space-y-4 animate-fade-in">
                    {/* Input Add New */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-2 flex items-center">
                                <div className="w-6 h-6 rounded border border-slate-200" style={{ backgroundColor: newColorInput }}></div>
                            </div>
                            <input 
                                type="text" 
                                value={newColorInput}
                                onChange={(e) => setNewColorInput(e.target.value.toUpperCase())}
                                placeholder="#RRGGBB"
                                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-500 outline-none uppercase"
                                maxLength={7}
                            />
                        </div>
                        {/* Color Picker Native (Optional Helper) */}
                        <input 
                            type="color" 
                            value={newColorInput.length === 7 ? newColorInput : "#000000"}
                            onChange={(e) => setNewColorInput(e.target.value.toUpperCase())}
                            className="w-10 h-10 p-1 rounded border border-slate-300 cursor-pointer"
                        />
                        <button 
                            onClick={handleAddColor}
                            className="bg-slate-900 text-white p-2.5 rounded-lg hover:bg-slate-800"
                            title="Tambah"
                        >
                            <Plus size={18} weight="bold" />
                        </button>
                    </div>

                    {/* List Editable Colors */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        {tempColors.map((hex, i) => (
                            <div key={i} className="group relative">
                                <div 
                                    className="w-12 h-12 rounded-xl shadow-sm border border-slate-200" 
                                    style={{ backgroundColor: hex }}
                                ></div>
                                <button 
                                    onClick={() => handleRemoveColor(hex)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                                >
                                    <X size={10} weight="bold" />
                                </button>
                                <span className="text-[10px] font-mono text-slate-500 mt-1 block text-center">{hex}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // --- MODE VIEW (READ ONLY) ---
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-3">
                        {item.colors.length === 0 && <span className="text-sm text-slate-400 italic">Belum ada warna diatur.</span>}
                        {item.colors.map((hex, i) => (
                            <div key={i} className="group relative">
                                <div 
                                    className="w-12 h-12 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:scale-110 transition-transform" 
                                    style={{ backgroundColor: hex }}
                                    title={hex}
                                ></div>
                            </div>
                        ))}
                    </div>
                    {item.colors.length > 0 && (
                        <div className="pt-2 border-t border-slate-50">
                            <p className="text-[10px] text-slate-400 font-mono">
                                {item.colors.join(', ')}
                            </p>
                        </div>
                    )}
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}