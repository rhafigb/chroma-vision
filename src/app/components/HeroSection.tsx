import { Sparkle, CheckCircle } from "@phosphor-icons/react/dist/ssr"; // SSR import for Phosphor
import { Camera, PlayCircle, ChevronLeft, MoreHorizontal } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-brand-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" />
      <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70" style={{ animationDelay: "2s" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-xs font-semibold uppercase tracking-wider">
              <Sparkle weight="bold" /> Powered by Deep Learning
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
              Temukan Warna Terbaik<br />
              Untuk <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-600 to-purple-500">Skin Tone</span> Anda
            </h1>
            
            <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
              Implementasi Computer Vision canggih untuk mendeteksi warna kulit secara presisi dan memberikan rekomendasi outfit yang meningkatkan penampilan Anda.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#demo" className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-600 text-white rounded-xl font-semibold shadow-xl shadow-brand-500/30 hover:bg-brand-700 hover:-translate-y-1 transition-all">
                <Camera className="w-5 h-5" />
                Coba Analisis AI
              </a>
              <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 hover:border-brand-200 transition-all">
                <PlayCircle className="w-5 h-5" />
                Lihat Cara Kerja
              </button>
            </div>
          </div>

          {/* Visual Mockup */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
             <div className="relative w-72 h-[550px] bg-slate-900 rounded-[3rem] border-8px border-slate-900 shadow-2xl z-10 overflow-hidden">
                <div className="w-full h-full bg-white relative">
                  <div className="h-16 bg-brand-50 flex items-center justify-between px-4">
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                    <span className="font-bold text-slate-800">Analisis Wajah</span>
                    <MoreHorizontal className="w-5 h-5 text-slate-600" />
                  </div>
                  
                  <div className="relative h-64 bg-slate-200 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop" 
                      className="w-full h-full object-cover opacity-90" 
                      alt="Analysis Subject" 
                    />
                    <div className="absolute inset-0 border-2 border-brand-500/50 z-20"></div>
                    <div className="absolute w-full h-1 bg-brand-400 shadow-[0_0_15px_rgba(139,92,246,0.8)] animate-scan z-30"></div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Skin Tone</p>
                            <h3 className="text-xl font-bold text-slate-900">Neutral Beige</h3>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#eacda3] border border-slate-200 shadow-inner"></div>
                    </div>
                    <hr className="border-slate-100" />
                    <p className="text-xs text-slate-500 uppercase font-bold">Recommended</p>
                    <div className="flex gap-2">
                        <div className="w-10 h-10 rounded-lg bg-emerald-700 shadow-sm"></div>
                        <div className="w-10 h-10 rounded-lg bg-rose-400 shadow-sm"></div>
                        <div className="w-10 h-10 rounded-lg bg-indigo-900 shadow-sm"></div>
                    </div>
                  </div>
                </div>
             </div>

             {/* Floating Card */}
             <div className="absolute top-20 -right-12 bg-white p-4 rounded-2xl shadow-xl animate-bounce duration-3000ms hidden lg:block">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                        <CheckCircle weight="fill" className="text-xl" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Akurasi Deteksi</p>
                        <p className="font-bold text-slate-800">96.5%</p>
                    </div>
                </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}