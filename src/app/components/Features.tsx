import { ScanFace, Bot, Shirt } from "lucide-react";
import { Palette, Heart } from "@phosphor-icons/react/dist/ssr";

const features = [
  {
    title: "AI Skin Tone Analyzer",
    desc: "Menggunakan CNN untuk mengekstraksi fitur wajah dan mengklasifikasikan tone kulit secara akurat (Warm, Cool, Neutral).",
    icon: <ScanFace className="w-7 h-7" />,
    colorClass: "bg-blue-100 text-blue-600"
  },
  {
    title: "Fashion Color Matcher",
    desc: "Algoritma rekomendasi warna komplementer berdasarkan teori warna musiman (Seasonal Color Analysis).",
    icon: <Palette className="text-3xl" weight="fill" />,
    colorClass: "bg-purple-100 text-purple-600"
  },
  {
    title: "AI Stylist Chatbot",
    desc: "Asisten virtual berbasis LLM yang siap menjawab pertanyaan seputar gaya dan tren fashion terkini.",
    icon: <Bot className="w-7 h-7" />,
    colorClass: "bg-teal-100 text-teal-600"
  },
  {
    title: "Save My Palette",
    desc: "Simpan palet warna favorit Anda ke database pribadi. Akses kapan saja saat berbelanja.",
    icon: <Heart className="text-3xl" weight="fill" />,
    colorClass: "bg-rose-100 text-rose-600",
    colSpan: "md:col-span-1"
  },
  {
    title: "Mix & Match Tips",
    desc: "Tips visual cara memadukan atasan, bawahan, dan aksesoris (Monokromatik, Analogous, atau Triadic).",
    icon: <Shirt className="w-7 h-7" />,
    colorClass: "bg-amber-100 text-amber-600",
    colSpan: "md:col-span-1 lg:col-span-2"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-brand-600 font-bold tracking-wide uppercase text-sm mb-2">Fitur Utama</h2>
          <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Ekosistem Fashion Pintar</h3>
          <p className="text-slate-600">Teknologi terintegrasi untuk pengalaman fashion yang personal.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className={`group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-brand-100 hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-300 ${feature.colSpan || ''}`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.colorClass}`}>
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}