"use client";

import { Shirt, Tag } from "lucide-react";
// Perbaikan: Mengubah 'Sneakers' menjadi 'Sneaker'
import { TShirt, Pants, Sneaker } from "@phosphor-icons/react/dist/ssr";

export default function TipsPage() {
  const guides = [
    {
      title: "Monokromatik",
      desc: "Menggunakan satu warna dasar dengan variasi terang dan gelap (shade & tint).",
      colors: ["bg-blue-900", "bg-blue-600", "bg-blue-300"],
      items: [
        { icon: <TShirt size={32} />, color: "text-blue-900", label: "Navy Shirt" },
        { icon: <Pants size={32} />, color: "text-blue-600", label: "Blue Jeans" },
        { icon: <Sneaker size={32} />, color: "text-blue-300", label: "Light Sneakers" }, // Diperbaiki
      ]
    },
    {
      title: "Analogous",
      desc: "Menggunakan warna-warna yang bersebelahan dalam roda warna.",
      colors: ["bg-red-500", "bg-orange-500", "bg-yellow-500"],
      items: [
        { icon: <TShirt size={32} />, color: "text-red-500", label: "Red Blouse" },
        { icon: <Pants size={32} />, color: "text-orange-600", label: "Terra Cotta Skirt" },
        { icon: <Sneaker size={32} />, color: "text-yellow-600", label: "Gold Sandals" }, // Diperbaiki
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Panduan Mix & Match</h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Pelajari teknik dasar memadukan warna pakaian agar penampilan Anda selalu harmonis dan stylish.
            </p>
        </div>

        {/* Content Section */}
        <div className="space-y-12">
            {guides.map((guide, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg flex flex-col md:flex-row gap-10 items-center">
                    
                    {/* Visual Illustration */}
                    <div className="w-full md:w-1/2 bg-slate-50 rounded-2xl p-8 border-2 border-dashed border-slate-200">
                        {/* Outfit Icons */}
                        <div className="flex justify-center items-end gap-6 mb-8">
                            {guide.items.map((item, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div className={`p-4 bg-white rounded-xl shadow-sm ${item.color}`}>
                                        {item.icon}
                                    </div>
                                    <span className="text-xs font-bold text-slate-400">{item.label}</span>
                                </div>
                            ))}
                        </div>
                        
                        {/* Color Palette Bar */}
                        <div className="flex h-4 w-full rounded-full overflow-hidden">
                            {guide.colors.map((cls, i) => (
                                <div key={i} className={`flex-1 ${cls}`}></div>
                            ))}
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="w-full md:w-1/2">
                        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider mb-4">
                            <Tag size={14} /> Tips #{idx + 1}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">{guide.title}</h2>
                        <p className="text-slate-600 leading-relaxed mb-6">
                            {guide.desc} Teknik ini paling aman digunakan untuk acara formal maupun kasual karena memberikan kesan rapi dan terkoordinasi tanpa terlihat berlebihan.
                        </p>
                        <button className="text-brand-600 font-bold text-sm hover:underline flex items-center gap-1">
                            Lihat Contoh Lain <Shirt size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}