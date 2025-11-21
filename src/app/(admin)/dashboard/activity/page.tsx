"use client";

import { useState, useEffect } from "react";
import { ScanFace, Palette, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Aperture } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";

// Tipe Data Gabungan
type ActivityLog = {
  id: number;
  type: 'SCAN' | 'PALETTE';
  user: string; // Karena belum ada Auth user real, kita set 'Guest' atau 'Admin'
  desc: string;
  time: string;
  status: 'Success' | 'Failed';
  original_date: Date; // Untuk sorting
};

export default function AIActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);

      // 1. Ambil Data Scans
      const { data: scans } = await supabase
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // 2. Ambil Data Saved Palettes
      const { data: palettes } = await supabase
        .from('saved_palettes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // 3. Gabungkan & Format Data
      const formattedScans: ActivityLog[] = (scans || []).map(s => ({
        id: s.id,
        type: 'SCAN',
        user: 'Pengunjung',
        desc: `Detected: ${s.tone_result} (${Math.round(s.confidence)}%)`,
        time: new Date(s.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
        status: 'Success',
        original_date: new Date(s.created_at)
      }));

      const formattedPalettes: ActivityLog[] = (palettes || []).map(p => ({
        id: p.id,
        type: 'PALETTE',
        user: 'Pengunjung',
        desc: `Saved Palette: ${p.season_name}`,
        time: new Date(p.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
        status: 'Success',
        original_date: new Date(p.created_at)
      }));

      // 4. Gabung & Sortir berdasarkan Waktu Terbaru
      const combined = [...formattedScans, ...formattedPalettes].sort(
        (a, b) => b.original_date.getTime() - a.original_date.getTime()
      );

      setLogs(combined);

    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
        case 'SCAN': return <ScanFace className="text-brand-600" size={20} />;
        case 'PALETTE': return <Palette className="text-rose-600" size={20} />;
        default: return <Aperture className="text-slate-600" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI System Logs</h1>
          <p className="text-slate-500 text-sm">Monitoring real-time dari Database Supabase.</p>
        </div>
        <button 
            onClick={fetchActivities}
            className="text-sm text-brand-600 font-bold hover:bg-brand-50 px-3 py-1 rounded-lg transition-colors"
        >
            Refresh Log
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[400px]">
        <h3 className="font-bold text-slate-900 mb-6">Activity Timeline</h3>
        
        {loading ? (
             <div className="flex justify-center items-center h-40">
                <Loader2 className="animate-spin text-brand-500" />
             </div>
        ) : logs.length === 0 ? (
             <p className="text-slate-400 text-center">Belum ada aktivitas tercatat.</p>
        ) : (
            <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
                {logs.map((log, idx) => (
                    <div key={`${log.type}-${log.id}-${idx}`} className="relative pl-8 animate-fade-in">
                        {/* Dot Indicator */}
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm bg-green-500"></div>

                        {/* Card Content */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-brand-200 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                                    {getIcon(log.type)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-slate-900 text-sm">{log.type}</span>
                                        <span className="text-xs text-slate-400">• {log.user}</span>
                                    </div>
                                    <p className="text-slate-700 text-sm">{log.desc}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-1 min-w-[100px]">
                                <span className="text-xs font-mono text-slate-400">{log.time}</span>
                                <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
                                    <CheckCircle size={12} /> Success
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}