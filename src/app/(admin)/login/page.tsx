"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link Next.js
import { Lock, User, Aperture } from "@phosphor-icons/react";
import { Loader2, ArrowLeft } from "lucide-react"; // Import icon panah

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulasi Login
    setTimeout(() => {
      if (email === "admin@chroma.com" && password === "admin123") {
        localStorage.setItem("isAdmin", "true");
        router.push("/dashboard");
      } else {
        setError("Email atau password salah.");
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 relative px-4">
      
      {/* --- TOMBOL KEMBALI KE BERANDA --- */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors font-medium group"
      >
        <div className="p-2 bg-white rounded-full shadow-sm border border-slate-200 group-hover:border-brand-200 group-hover:bg-brand-50 transition-all">
             <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </div>
        <span className="hidden md:inline">Kembali ke Beranda</span>
      </Link>

      {/* --- LOGIN CARD --- */}
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-brand-500/30">
            <Aperture weight="fill" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
          <p className="text-slate-500 text-sm">Masuk untuk mengelola data ChromaVision</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center flex items-center justify-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Administrator</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="text-slate-400" size={20} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
                placeholder="admin@chroma.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-slate-400" size={20} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Login Dashboard"}
          </button>
        </form>
        
        <div className="mt-6 text-center pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400">
                Kredensial Demo: <span className="font-mono text-slate-600 bg-slate-100 px-1 rounded">admin@chroma.com</span> / <span className="font-mono text-slate-600 bg-slate-100 px-1 rounded">admin123</span>
            </p>
        </div>
      </div>
    </div>
  );
}