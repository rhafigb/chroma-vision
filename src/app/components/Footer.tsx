"use client";

import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import { Aperture } from "@phosphor-icons/react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand & Description (Spans 2 columns) */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Aperture weight="bold" className="text-lg" />
              </div>
              <span className="font-bold text-lg text-slate-900">ChromaVision</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Project Skripsi Implementasi Computer Vision untuk Deteksi Skin Tone dan Sistem Rekomendasi Warna Pakaian Berbasis Deep Learning.
            </p>
          </div>

          {/* Column 2: Technology Links */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Technology</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="#" className="hover:text-brand-600 transition-colors">TensorFlow.js</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-brand-600 transition-colors">OpenCV</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-brand-600 transition-colors">React Native</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-brand-600 transition-colors">Python FastAPI</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: General Links */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Links</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="#" className="hover:text-brand-600 transition-colors">Tentang Peneliti</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-brand-600 transition-colors">Dokumentasi API</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-brand-600 transition-colors">GitHub Repository</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Copyright & Socials */}
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 text-center md:text-left">
            © 2025 ChromaVision Project. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" aria-label="Github" className="text-slate-400 hover:text-slate-900 transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-slate-400 hover:text-blue-700 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
