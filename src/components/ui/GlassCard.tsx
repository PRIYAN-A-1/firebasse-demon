import React from "react";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "none" | "emerald" | "cyan" | "subtle";
  hoverEffect?: boolean;
  intensity?: "low" | "medium" | "high";
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  glow = "none",
  hoverEffect = false,
  intensity = "medium",
  className = "",
  ...props
}) => {
  const intensityMap = {
    low: "bg-white/[0.02] border-white/[0.05] backdrop-blur-sm",
    medium: "bg-[#10121A]/70 border-white/[0.08] backdrop-blur-md",
    high: "bg-[#141824]/85 border-white/[0.12] backdrop-blur-xl shadow-glass",
  };

  const glowMap = {
    none: "",
    subtle: "shadow-[0_0_20px_rgba(255,255,255,0.02)]",
    emerald: "border-emerald-500/20 shadow-glow",
    cyan: "border-cyan-500/20 shadow-glowCyan",
  };

  const hoverStyles = hoverEffect
    ? "transition-all duration-300 hover:border-emerald-500/30 hover:bg-[#141824]/90 hover:-translate-y-0.5 hover:shadow-glow cursor-pointer"
    : "";

  return (
    <div
      className={`relative rounded-2xl border ${intensityMap[intensity]} ${glowMap[glow]} ${hoverStyles} p-5 md:p-6 text-white overflow-hidden ${className}`}
      {...props}
    >
      {/* Subtle top glass reflection highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {children}
    </div>
  );
};
