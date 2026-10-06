import { Navbar } from "@/components/layout/Navbar";
import { LandingPage } from "@/components/landing/LandingPage";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-white flex flex-col justify-between">
      <Navbar />
      <main className="flex-1">
        <LandingPage />
      </main>
      <Footer />
    </div>
  );
}
