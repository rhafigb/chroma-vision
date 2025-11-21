"use client";

import { useState, useEffect } from "react";
import { MagnifyingGlass, CaretLeft, CaretRight, Funnel } from "@phosphor-icons/react";
import { ScanFace, Calendar, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// Tipe Data Scan
type ScanHistory = {
  id: number;
  created_at: string;
  tone_result: string;
  confidence: number;
  rgb_value: string;
};

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10; // Jumlah data per halaman

  useEffect(() => {
    fetchHistory();
  }, [page]); // Refetch jika halaman berubah

  const fetchHistory = async () => {
    setLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error) {
      setScans(data || []);
    } else {
      console.error("Error fetching history:", error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Riwayat Deteksi AI</h1>
          <p className="text-slate-500 text-sm">Log lengkap aktivitas analisis skin tone pengguna.</p>
        </div>
        
        {/* Navigasi Sederhana (Pagination) */}
        <div className="flex gap-2">
            <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
                <CaretLeft size={20} />
            </button>
            <span className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono">
                Page {page + 1}
            </span>
            <button 
                onClick={() => setPage(p => p + 1)}
                disabled={scans.length < PAGE_SIZE}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
                <CaretRight size={20} />
            </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
        {loading ? (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                <Loader2 className="animate-spin w-8 h-8 mb-2 text-brand-500" />
                <p>Memuat data...</p>
            </div>
        ) : scans.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                <p>Belum ada data riwayat.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Waktu Scan</th>
                            <th className="px-6 py-4">Hasil Deteksi (Tone)</th>
                            <th className="px-6 py-4">Akurasi (Confidence)</th>
                            <th className="px-6 py-4">Data RGB</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {scans.map((scan) => (
                            <tr key={scan.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                                            <Calendar size={16} />
                                        </div>
                                        <span className="font-mono text-slate-600">
                                            {new Date(scan.created_at).toLocaleString('id-ID', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-slate-900">{scan.tone_result}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${scan.confidence > 90 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                                                style={{ width: `${scan.confidence}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-bold">{Math.round(scan.confidence)}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                        {scan.rgb_value !== "N/A" ? scan.rgb_value : "-"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <CheckCircle size={12} /> Success
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}