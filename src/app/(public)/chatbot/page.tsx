"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation"; 
import { Send, User as UserIcon, RefreshCcw, ArrowLeft, Loader2 } from "lucide-react"; // Rename User to UserIcon
import { Robot, Sparkle, TShirt, Palette } from "@phosphor-icons/react";
import Link from "next/link";

// Tipe data pesan
type Message = {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

// Pastikan token Gemini sudah diset di backend!

function ChatbotContent() {
  const searchParams = useSearchParams();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Ref Baru untuk input field
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentSeason, setCurrentSeason] = useState("Unknown");

  // --- INISIALISASI KONTEKS DARI URL (SAMA) ---
  useEffect(() => {
    const seasonParam = searchParams.get('season');
    let detectedSeason = "Unknown";

    if (seasonParam) {
       const s = seasonParam.charAt(0).toUpperCase() + seasonParam.slice(1).toLowerCase();
       if (["Spring", "Summer", "Autumn", "Winter"].some(seas => s.includes(seas))) {
          if (s.includes("Spring")) detectedSeason = "Spring";
          else if (s.includes("Summer")) detectedSeason = "Summer";
          else if (s.includes("Autumn")) detectedSeason = "Autumn";
          else if (s.includes("Winter")) detectedSeason = "Winter";
       }
    }
    
    setCurrentSeason(detectedSeason);

    setMessages([{
      id: 1,
      text: `Halo! Saya AI Stylist Anda. Saya melihat skin tone Anda cocok dengan kategori **${detectedSeason}**. Tanyakan apa saja tentang outfit yang cocok untuk Anda!`,
      sender: 'ai',
      timestamp: new Date()
    }]);

  }, [searchParams]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({ top: scrollHeight - clientHeight, behavior: "smooth" });
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // --- LOGIKA UTAMA: KIRIM KE BACKEND ---
  const sendRequestToBackend = async (userMessageText: string) => {
    
    // Simpan pesan user ke state
    const userMsg: Message = { id: Date.now(), text: userMessageText, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    
    setInput(""); // Kosongkan input field
    setIsTyping(true);

    // [FIX SAFETY] Pastikan fokus hilang dari input agar keyboard mobile tidak mengganggu request
    inputRef.current?.blur(); 

    try {
      const response = await fetch("https://cytotrophoblastic-marita-topazine.ngrok-free.dev/chat", { // Ganti localhost saat deploy
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessageText, season: currentSeason })
      });

      const data = await response.json();

      if (data.status === "success") {
          const aiMsg: Message = { 
            id: Date.now() + 1, 
            text: data.reply, 
            sender: 'ai', 
            timestamp: new Date() 
          };
          setMessages(prev => [...prev, aiMsg]);
      } else {
          throw new Error("API returned error status.");
      }

    } catch (error) {
        console.error("Chat Error:", error);
        const errorMsg: Message = { 
            id: Date.now() + 1, 
            text: "Maaf, koneksi ke AI Stylist gagal. Pastikan backend Python berjalan dan terhubung ke internet (Ngrok).", 
            sender: 'ai', 
            timestamp: new Date() 
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsTyping(false);
    }
  };

  // --- 3. INPUT HANDLERS ---
  
  // Handler untuk tombol Send (Input Field)
  const handleSend = () => {
    if (!input.trim()) return;
    sendRequestToBackend(input.trim());
  };

  // Handler untuk Quick Ask Buttons (Perbaikan Utama di sini)
  const handleQuickAsk = (topic: string) => {
      // Langsung panggil fungsi utama tanpa mengubah state input terlebih dahulu
      sendRequestToBackend(topic); 
  };


  return (
    <div className="max-w-4xl mx-auto">
        {/* Header Chat */}
        <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Personal Fashion Assistant</h1>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[70vh] md:h-[600px]">
          
          {/* Window Header */}
          <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <Robot weight="fill" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Gemini Stylist</h3>
                <p className="text-xs text-slate-500 font-medium">Konsultasi Personal: {currentSeason}</p>
              </div>
            </div>
            <button onClick={() => setMessages([])} className="p-2 text-slate-400 hover:text-brand-600 rounded-full transition-colors" title="Reset Chat">
              <RefreshCcw size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50 custom-scrollbar scroll-smooth">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 md:gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm mt-1 ${msg.sender === 'ai' ? 'bg-white text-brand-600 border border-slate-100' : 'bg-slate-900 text-white'}`}>
                  {msg.sender === 'ai' ? <Sparkle weight="fill" size={16} /> : <UserIcon size={16} />}
                </div>
                <div className={`max-w-[85%] md:max-w-[75%] p-3 md:p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                    {/* Menggunakan div agar tag strong dari backend tetap berfungsi jika ada */}
                    <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></div> 
                    <p className={`text-[10px] mt-2 ${msg.sender === 'user' ? 'text-brand-200 text-right' : 'text-slate-400'}`}>
                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isTyping && (
               <div className="flex gap-4 animate-fade-in">
                  <div className="w-8 h-8 bg-white text-brand-600 border border-slate-100 rounded-full flex items-center justify-center shadow-sm"><Sparkle weight="fill" size={16} /></div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                     <Loader2 className="animate-spin w-4 h-4 text-brand-500" />
                     <span className="text-xs text-slate-500">Gemini sedang mengetik...</span>
                  </div>
               </div>
            )}
          </div>

          {/* Quick Suggestions (PERBAIKAN UTAMA: Langsung panggil handler tanpa state input) */}
          <div className="px-4 py-2 bg-white border-t border-slate-50 overflow-x-auto flex gap-2 no-scrollbar">
              <button 
                  onClick={() => handleQuickAsk("Warna baju apa yang cocok?")} 
                  type="button" // Set type button agar tidak submit form
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-600 text-xs rounded-full transition-colors whitespace-nowrap"
              >
                  <Palette size={14} /> Rekomendasi Warna
              </button>
              <button 
                  onClick={() => handleQuickAsk("Rekomendasi outfit untuk kondangan?")} 
                  type="button" 
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-600 text-xs rounded-full transition-colors whitespace-nowrap"
              >
                  <Sparkle size={14} /> Outfit Pesta
              </button>
              <button 
                  onClick={() => handleQuickAsk("Saran baju kerja yang profesional?")} 
                  type="button" 
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-600 text-xs rounded-full transition-colors whitespace-nowrap"
              >
                  <TShirt size={14} /> Baju Kerja
              </button>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="relative flex items-center gap-2">
              <input 
                ref={inputRef} // Pasang ref di sini
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Tanya Gemini tentang style ${currentSeason}...`}
                className="w-full bg-slate-50 border border-slate-200 rounded-full py-3.5 pl-5 pr-14 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
              />
              <button onClick={handleSend} disabled={!input.trim() || isTyping} className="absolute right-2 w-10 h-10 bg-brand-600 hover:bg-brand-700 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 shadow-md">
                <Send size={18} className={input.trim() ? "ml-0.5" : ""} />
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}

export default function ChatbotPage() {
    // ... (Wrapper Suspense SAMA) ...
    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto mb-4">
                 <Link href="/matcher" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 transition-colors">
                    <ArrowLeft size={16} /> Kembali ke Palette
                 </Link>
            </div>
            <Suspense fallback={<div className="text-center pt-20">Loading AI...</div>}>
                <ChatbotContent />
            </Suspense>
        </div>
    );
}