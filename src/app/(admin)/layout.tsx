"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
// Ganti icon Users dengan Swatches (Palette)
import { SquaresFour, MagicWand, TShirt, SignOut, Aperture, List, X, Swatches } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoginPage) {
      const isAdmin = localStorage.getItem("isAdmin");
      if (!isAdmin) {
        router.push("/login");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [isLoginPage, router]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (isLoginPage) return <>{children}</>;
  if (!isAuthorized && !isLoginPage) return null;

  // --- MENU ITEM DIPERBARUI DI SINI ---
  const menuItems = [
    { 
      name: "Dashboard", 
      href: "/dashboard", 
      icon: <SquaresFour weight="fill" size={20} /> 
    },
    { 
      // PERUBAHAN: Dari 'User Data' menjadi 'Color Master'
      name: "Color Master", 
      href: "/dashboard/colors", 
      icon: <Swatches size={20} /> // Icon Palette/Swatches
    },
    { 
      name: "AI Activity", 
      href: "/dashboard/activity", 
      icon: <MagicWand size={20} /> 
    },
    { 
      name: "Manage Tips", 
      href: "/dashboard/tips", 
      icon: <TShirt size={20} /> 
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 relative">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-30 flex items-center justify-between px-4 h-16 shadow-md">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-brand-600 rounded flex items-center justify-center text-white">
             <Aperture weight="bold" />
           </div>
           <span className="font-bold text-lg">ChromaAdmin</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <List size={28} />
        </button>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white 
          transition-transform duration-300 ease-in-out shadow-2xl
          md:translate-x-0 md:static md:shadow-none
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-16 md:h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
              <Aperture weight="bold" />
            </div>
            <span className="font-bold text-lg tracking-tight">ChromaAdmin</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                  isActive
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-900/50"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => {
                localStorage.removeItem("isAdmin");
                router.push("/login");
            }}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-medium"
          >
            <SignOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 pt-20 md:p-8 md:pt-8 w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}