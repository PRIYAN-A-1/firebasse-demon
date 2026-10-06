import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "FITTRACK AI — Train Smarter. Eat Better. Become Stronger.",
  description:
    "AI-powered workouts, nutrition intelligence, food photo analysis, and personalized coaching to help you build your strongest self with real data.",
  keywords: [
    "fitness AI",
    "workout tracker",
    "food photo scanner",
    "nutrition AI",
    "macro calculator",
    "Indian food nutrition",
    "smart workout coach",
  ],
  authors: [{ name: "FITTRACK AI Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090A0F] text-neutral-100 antialiased selection:bg-emerald-500 selection:text-black">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
