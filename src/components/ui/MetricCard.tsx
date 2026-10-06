import React from "react";
import { GlassCard } from "./GlassCard";

export interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  unit?: string;
  icon: React.ReactNode;
  trend?: { value: string; isPositive?: boolean; isNeutral?: boolean; } | string;
  color?: "emerald" | "cyan" | "amber" | "neutral" | "rose" | "blue" | "purple" | "orange" | "red" | string;
  progressPercent?: number;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  unit,
  icon,
  trend,
  color = "emerald",
  progressPercent,
  onClick,
  className = "",
}) => {
  const iconColorStyles: Record<string, string> = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    neutral: "text-neutral-300 bg-white/5 border-white/10",
  };

  const barColorStyles: Record<string, string> = {
    emerald: "bg-emerald-500",
    cyan: "bg-cyan-500",
    amber: "bg-amber-500",
    neutral: "bg-white/40",
  };

  return (
    <GlassCard
      hoverEffect={!!onClick}
      onClick={onClick}
      className={`flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">{value}</h3>
            {unit && <span className="text-xs font-medium text-neutral-400">{unit}</span>}
          </div>
          {subValue && <p className="text-xs text-neutral-400">{subValue}</p>}
        </div>
        <div className={`rounded-xl border p-2.5 ${(iconColorStyles[color as string] || iconColorStyles.emerald)} shrink-0`}>
          {icon}
        </div>
      </div>

      {(trend || progressPercent !== undefined) && (
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
          {progressPercent !== undefined ? (
            <div className="w-full space-y-1">
              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>Progress</span>
                <span className="font-semibold text-white">{Math.min(100, Math.round(progressPercent))}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${(barColorStyles[color as string] || barColorStyles.emerald)}`}
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                />
              </div>
            </div>
                                        ) : trend ? (
            <div className="flex items-center gap-1.5">
              <span
                className={`font-semibold ${
                  (typeof trend === "object" ? trend.isNeutral : trend === "neutral")
                    ? "text-neutral-400"
                    : (typeof trend === "object" ? trend.isPositive : trend === "up")
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {typeof trend === "object" ? trend.value : trend}
              </span>
              <span className="text-neutral-500 text-[11px]">vs last period</span>
            </div>
          ) : null}
        </div>
      )}
    </GlassCard>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white/[0.06] backdrop-blur-sm ${className}`}
    />
  );
};





