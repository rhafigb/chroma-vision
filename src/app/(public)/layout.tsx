import Navbar from "@/app/components/Navbar"; // Pastikan path import benar
import Footer from "@/app/components/Footer"; // Sesuaikan path import jika perlu

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow">{children}</main>
      <Footer />
    </div>
  );
}