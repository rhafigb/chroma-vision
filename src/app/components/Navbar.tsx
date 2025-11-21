"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Hook untuk mengetahui halaman aktif
import { Aperture } from "@phosphor-icons/react";
import { Menu, X, Sparkles } from "lucide-react";

// Definisi Menu Navigasi
const navItems = [
  { name: "Home", href: "/" },
  { name: "AI Analyzer", href: "/analyzer" },
  { name: "Color Matcher", href: "/matcher" },
  { name: "AI Chatbot", href: "/chatbot" },
  { name: "Tips", href: "/tips" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname(); // Mendapatkan path URL saat ini

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Menutup mobile menu saat berpindah halaman
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* --- LOGO --- */}
          <Link href="/" className="shrink-0 flex items-center gap-2 group">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
              <Aperture weight="fill" className="text-2xl" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Chroma<span className="text-brand-600">Vision</span>
            </span>
          </Link>

          {/* --- DESKTOP MENU --- */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                    isActive
                      ? "text-brand-600 bg-brand-50"
                      : "text-slate-600 hover:text-brand-600 hover:bg-slate-50"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* --- CTA BUTTON (My Palette) --- */}
          <div className="hidden md:flex items-center">
            <Link href="/palette">
              <button className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-600 transition-all shadow-lg hover:shadow-brand-500/30 flex items-center gap-2 group">
                <span>My Palette</span>
                <Sparkles className="w-4 h-4 group-hover:text-yellow-300 transition-colors" />
              </button>
            </Link>
          </div>

          {/* --- MOBILE MENU TOGGLE --- */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-brand-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU DROPDOWN --- */}
      <div
        className={`md:hidden bg-white border-t border-slate-100 absolute w-full overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-96 opacity-100 shadow-xl" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pt-4 pb-6 space-y-2 flex flex-col">
          {navItems.map((item) => {
             const isActive = pathname === item.href;
             return (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                   isActive 
                   ? "bg-brand-50 text-brand-700" 
                   : "text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                }`}
              >
                {item.name}
              </Link>
             )
          })}
          <div className="pt-2 mt-2 border-t border-slate-100">
            <Link href="/palette">
                <button className="w-full bg-brand-600 text-white px-4 py-3 rounded-xl text-base font-semibold shadow-md flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Buka My Palette
                </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}