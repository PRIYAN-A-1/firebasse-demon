"use client";

import React from "react";
import Link from "next/link";
import { Search, Plus, Bell, Camera, Droplets, Dumbbell } from "lucide-react";
import { Button } from "../ui/Button";

export const TopBar: React.FC<{
  user?: { name: string; email: string; subscription?: any };
  onOpenWaterModal?: () => void;
}> = ({ user, onOpenWaterModal }) => {
  const isPremium = user?.subscription?.plan === "premium";

  return (
    <header className="sticky top-0 z-20 bg-[#090A0F]/80 backdrop-blur-xl border-b border-white/[0.08] px-4 md:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Search input */}
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search exercises, foods, or workout plans..."
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
          />
        </div>

        {/* Brand indicator for mobile */}
        <div className="sm:hidden flex items-center gap-2">
          <span className="font-extrabold text-sm text-white tracking-tight">
            FITTRACK <span className="text-emerald-400">AI</span>
          </span>
        </div>

        {/* Right: Quick action buttons & profile */}
        <div className="flex items-center gap-2.5">
          <Link href="/nutrition/scan">
            <Button variant="glass" size="sm" icon={<Camera className="w-3.5 h-3.5 text-emerald-400" />}>
              <span className="hidden sm:inline">Scan Meal</span>
            </Button>
          </Link>

          <Link href="/workouts">
            <Button variant="glass" size="sm" icon={<Dumbbell className="w-3.5 h-3.5 text-cyan-400" />}>
              <span className="hidden sm:inline">Workout</span>
            </Button>
          </Link>

          {onOpenWaterModal && (
            <button
              onClick={onOpenWaterModal}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-cyan-400 hover:bg-white/10 transition-colors"
              title="Quick Log Water"
            >
              <Droplets className="w-4 h-4" />
            </button>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#090A0F]" />
            </button>
          </div>

          {/* User Profile Avatar */}
          <Link href="/profile" className="flex items-center gap-2.5 pl-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-[1.5px] cursor-pointer hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#10121A] rounded-full flex items-center justify-center text-xs font-bold text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
            {isPremium && (
              <span className="hidden lg:inline text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                PRO
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
