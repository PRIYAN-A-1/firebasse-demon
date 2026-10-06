"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  UtensilsCrossed,
  Bot,
  TrendingUp,
  HeartPulse,
  Target,
  CalendarDays,
  Trophy,
  Crown,
  Settings,
  User,
  LogOut,
  Zap,
  Scale,
  BarChart3,
} from "lucide-react";

export const Sidebar: React.FC<{ user?: { name: string; email: string; subscription?: any } }> = ({
  user,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      router.push("/login");
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Workouts", href: "/workouts", icon: Dumbbell },
    { name: "Nutrition", href: "/nutrition", icon: UtensilsCrossed },
    { name: "AI Coach", href: "/ai-coach", icon: Bot, isAi: true },
    { name: "Progress", href: "/progress", icon: TrendingUp },
    { name: "Weight", href: "/weight", icon: Scale },
    { name: "Recovery", href: "/recovery", icon: HeartPulse },
    { name: "Goals", href: "/goals", icon: Target },
    { name: "Challenges", href: "/challenges", icon: Trophy },
    { name: "Weekly Review", href: "/weekly-review", icon: BarChart3 },
    { name: "Calendar", href: "/calendar", icon: CalendarDays },
  ];

  const bottomItems = [
    { name: "Subscription", href: "/subscription", icon: Crown, isPremium: true },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const isPremium = user?.subscription?.plan === "premium";

  return (
    <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-30 bg-[#0A0C13]/90 border-r border-white/[0.08] backdrop-blur-2xl px-4 py-6">
      {/* Brand */}
      <Link href="/dashboard" className="flex items-center gap-2.5 px-3 mb-8 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[1.5px] shadow-glow">
          <div className="w-full h-full bg-[#090A0F] rounded-[10px] flex items-center justify-center">
            <Zap className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
            FITTRACK <span className="text-emerald-400">AI</span>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            {isPremium ? "Pro Athlete" : "Free Plan"}
          </span>
        </div>
      </Link>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
          Fitness System
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-glow"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-neutral-400"}`} />
              <span className="flex-1">{item.name}</span>
              {item.isAi && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  AI
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="pt-4 border-t border-white/[0.08] space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  item.isPremium ? "text-amber-400" : "text-neutral-400"
                }`}
              />
              <span className="flex-1">{item.name}</span>
              {item.isPremium && !isPremium && (
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  Upgrade
                </span>
              )}
            </Link>
          );
        })}

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
