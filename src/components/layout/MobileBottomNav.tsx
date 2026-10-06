"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Dumbbell, Camera, TrendingUp, User } from "lucide-react";

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  const items = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "Workout", href: "/workouts", icon: Dumbbell },
    { name: "Scan", href: "/nutrition/scan", icon: Camera, isCenter: true },
    { name: "Progress", href: "/progress", icon: TrendingUp },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0C13]/95 border-t border-white/[0.08] backdrop-blur-2xl px-2 py-2">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative -top-5 flex flex-col items-center"
              >
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[2px] shadow-glow active:scale-95 transition-transform">
                  <div className="w-full h-full bg-[#0A0C13] rounded-full flex items-center justify-center p-3">
                    <Camera className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 mt-1">Scan Meal</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
                isActive ? "text-emerald-400" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
