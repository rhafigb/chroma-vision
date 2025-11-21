"use client";

import { useState, useEffect } from "react";
import { Plus, Tag, Trash, Article } from "@phosphor-icons/react"; // Ganti Image icon
import { Save, X, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Tipe Data Tip
type FashionTip = {
  id: number;
  title: string;
  category: string;
  description: string;
};

export default function ManageTipsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tips, setTips] = useState<FashionTip[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "Basic Theory",
    description: ""
  });

  // 1. FETCH TIPS
  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('fashion_tips').select('*').order('created_at', { ascending: false });
    if (!error) setTips(data || []);
    setIsLoading(false);
  };

  // 2. CREATE TIP
  const handleSave = async () => {
    if (!formData.title || !formData.description) return alert("Judul dan deskripsi wajib diisi!");
    
    setIsSaving(true);
    const { error } = await supabase.from('fashion_tips').insert([formData]);
    
    if (!error) {
        setFormData({ title: "", category: "Basic Theory", description: "" });
        setIsCreating(false);
        fetchTips(); // Refresh list
    } else {
        alert("Gagal menyimpan tips.");
        console.error(error);
    }
    setIsSaving(false);
  };

  // 3. DELETE TIP
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus tips ini?")) return;
    
    const { error } = await supabase.from('fashion_tips').delete().eq('id', id);
    if (!error) {
        setTips(tips.filter(t => t.id !== id));
    } else {
        alert("Gagal menghapus.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Fashion Tips</h1>
          <p className="text-slate-500 text-sm">Kelola konten edukasi aplikasi secara dinamis.</p>
        </div>
        <button 
            onClick={() => setIsCreating(!isCreating)}
            className={`${isCreating ? 'bg-slate-200 text-slate-700' : 'bg-brand-600 text-white'} px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2`}
        >
            {isCreating ? <><X size={20} /> Cancel</> : <><Plus weight="bold" size={20} /> Add New Tip</>}
        </button>
      </div>

      {/* --- FORM INPUT --- */}
      {isCreating && (
        <div className="bg-white p-6 rounded-2xl border border-brand-200 shadow-lg animate-fade-in">
            <h3 className="font-bold text-lg mb-4">Buat Tips Baru</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Judul Tips</label>
                    <input 
                        type="text" 
                        className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none" 
                        placeholder="Contoh: Teknik Layering..."
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Kategori</label>
                    <select 
                        className="w-full border border-slate-300 rounded-lg p-3 bg-white"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                        <option>Basic Theory</option>
                        <option>Seasonal Color</option>
                        <option>Mix & Match</option>
                        <option>Recommendation</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Konten Singkat</label>
                    <textarea 
                        className="w-full border border-slate-300 rounded-lg p-3 h-24" 
                        placeholder="Deskripsi singkat tips..."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                </div>
                <div className="flex justify-end">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-700 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        Simpan Tips
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- LIST TIPS --- */}
      {isLoading ? (
         <div className="text-center py-12"><Loader2 className="animate-spin w-8 h-8 mx-auto text-brand-500" /></div>
      ) : tips.length === 0 ? (
         <div className="text-center py-12 text-slate-400 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-2xl">
            <AlertCircle size={32} className="mb-2" />
            <p>Belum ada tips. Silakan buat baru.</p>
         </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip) => (
                <div key={tip.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => handleDelete(tip.id)}
                            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors" 
                            title="Hapus"
                        >
                            <Trash size={16} />
                        </button>
                    </div>
                    
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 text-slate-500">
                        <Tag size={24} weight="fill" />
                    </div>
                    <div className="mb-auto">
                        <span className="bg-brand-50 text-brand-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border border-brand-100">
                            {tip.category}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-2 mb-2 line-clamp-2">{tip.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                            {tip.description}
                        </p>
                    </div>
                </div>
            ))}
            
            {/* Card "Add New" Cepat */}
            <div 
                onClick={() => setIsCreating(true)}
                className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-400 cursor-pointer hover:border-brand-400 hover:text-brand-500 hover:bg-brand-50/30 transition-all min-h-[200px]"
            >
                <Plus size={40} />
                <span className="font-bold mt-2">Buat Tips Baru</span>
            </div>
        </div>
      )}
    </div>
  );
}