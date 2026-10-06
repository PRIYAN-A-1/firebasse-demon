import React from "react";
import Link from "next/link";
import { Zap, Shield, Heart, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#07080C] border-t border-white/[0.08] text-neutral-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[1.5px]">
                <div className="w-full h-full bg-[#090A0F] rounded-[10px] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <span className="font-extrabold text-lg text-white">
                FITTRACK <span className="text-emerald-400">AI</span>
              </span>
            </Link>
            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
              AI-powered workouts, nutrition intelligence, food photo analysis, and personalized coaching to help you build your strongest self with real data.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Train Smarter. Eat Better. Become Stronger.</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/features" className="hover:text-white transition-colors">Features</Link>
              </li>
              <li>
                <Link href="/workouts" className="hover:text-white transition-colors">Smart Workouts</Link>
              </li>
              <li>
                <Link href="/nutrition" className="hover:text-white transition-colors">AI Food Scanner</Link>
              </li>
              <li>
                <Link href="/ai-coach" className="hover:text-white transition-colors">AI Fitness Coach</Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">Pricing & Plans</Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">Data Security</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-white transition-colors">Cookie Settings</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} FITTRACK AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" /> End-to-end data privacy
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> Built for peak human performance
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
