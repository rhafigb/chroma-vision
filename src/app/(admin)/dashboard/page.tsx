"use client";

import { useState, useEffect } from "react";
import { Users, Scan, CheckCircle, TrendUp, Clock, ArrowClockwise } from "@phosphor-icons/react";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link"; // IMPORT LINK

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPalettes: 0,
    totalScans: 0,
    avgConfidence: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // --- 1. AMBIL TOTAL PALETTE ---
      const { count: paletteCount } = await supabase
        .from('saved_palettes')
        .select('*', { count: 'exact', head: true });

      // --- 2. AMBIL DATA SCAN (DENGAN FIX COUNT) ---
      // Tambahkan { count: 'exact' } agar Supabase mengembalikan jumlah total baris
      const { data: scanData, count: scanCount, error: scanError } = await supabase
        .from('scans')
        .select('confidence, created_at, tone_result', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (scanError) throw scanError;

      // --- 3. HITUNG RATA-RATA AKURASI ---
      let avgConf = 0;
      if (scanData && scanData.length > 0) {
        const totalConf = scanData.reduce((acc, curr) => acc + (curr.confidence || 0), 0);
        avgConf = totalConf / scanData.length;
      }

      // --- 4. DATA ACTIVITY TERBARU ---
      const recent = scanData ? scanData.slice(0, 5) : [];

      // --- 5. UPDATE STATE ---
      setStats({
        totalPalettes: paletteCount || 0,
        totalScans: scanCount || 0, // Sekarang seharusnya tidak 0 lagi jika ada data
        avgConfidence: parseFloat(avgConf.toFixed(1)),
      });

      setRecentActivity(recent);

    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-slate-400 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
            <p>Memuat data dashboard...</p>
        </div>
    );
  }

  const statCards = [
    { title: "Total Saved Palettes", value: stats.totalPalettes, change: "Engagement", icon: <Users size={24} weight="fill" />, color: "bg-blue-500" },
    { title: "Total AI Scans", value: stats.totalScans, change: "Real-time", icon: <Scan size={24} weight="fill" />, color: "bg-brand-500" },
    { title: "Avg. Accuracy", value: `${stats.avgConfidence}%`, change: "Performance", icon: <CheckCircle size={24} weight="fill" />, color: "bg-green-500" },
    { title: "System Status", value: "Online", change: "Stable", icon: <TrendUp size={24} weight="fill" />, color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Live Dashboard</h1>
            <p className="text-slate-500 text-sm">Memantau performa algoritma Computer Vision secara Real-time.</p>
        </div>
        <button onClick={fetchDashboardData} className="flex items-center gap-2 text-sm bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-brand-600 font-medium transition-colors shadow-sm">
            <ArrowClockwise size={16} /> Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-gray-200`}>{stat.icon}</div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">{stat.change}</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
            <p className="text-slate-500 text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chart Section (Dummy CSS Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-900 mb-6">Distribusi Hasil Scan</h3>
            <div className="flex-1 flex items-end justify-around gap-2 px-4 pb-4 min-h-[200px] border-b border-slate-100">
                 {['Autumn', 'Winter', 'Spring', 'Summer'].map((season, i) => (
                     <div key={season} className="flex flex-col items-center gap-2 w-full group">
                        <div className={`w-full rounded-t-lg h-32 relative overflow-hidden bg-${['orange','blue','green','yellow'][i]}-100`}>
                            <div className={`absolute bottom-0 w-full h-[${[60,30,45,20][i]}%] bg-${['orange','blue','green','yellow'][i]}-500 transition-all duration-500 group-hover:opacity-80`}></div>
                        </div>
                        <span className="text-xs text-slate-500 font-bold">{season}</span>
                     </div>
                 ))}
            </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Riwayat Scan Terbaru</h3>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Live</span>
            </div>
            
            <div className="space-y-4 flex-1">
                {recentActivity.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                        <AlertCircle size={32} className="mb-2 opacity-50" />
                        <p className="text-sm text-center">Belum ada aktivitas scan.</p>
                    </div>
                ) : (
                    recentActivity.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-3 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                            <div className="w-2 h-2 mt-2 rounded-full bg-brand-500 shrink-0 shadow-[0_0_8px_rgba(139,92,246,0.6)]"></div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-bold text-slate-800">Skin Analysis</p>
                                    <span className="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded border border-brand-100 font-mono">
                                        {Math.round(log.confidence)}%
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">Result: <span className="text-brand-600 font-bold">{log.tone_result}</span></p>
                                <div className="flex items-center gap-1 mt-1.5">
                                    <Clock size={12} className="text-slate-400" />
                                    <p className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {/* BUTTON KE HALAMAN HISTORY */}
            <Link href="/dashboard/history" className="mt-4 w-full py-2 text-xs text-brand-600 font-bold hover:bg-brand-50 rounded-lg text-center transition-colors border border-transparent hover:border-brand-100">
                Lihat Semua Riwayat
            </Link>
        </div>
      </div>
    </div>
  );
}