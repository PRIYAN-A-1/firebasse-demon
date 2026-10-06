import React from "react";

export interface ProgressBarProps {
  value: number; // current value
  max: number;   // max/target
  label?: string;
  sublabel?: string;
  color?: "emerald" | "cyan" | "amber" | "rose" | "blue" | "purple" | "orange" | "red" | string;
  showValues?: boolean;
  unit?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  sublabel,
  color = "emerald",
  showValues = true,
  unit = "",
  className = "",
}) => {
  const percentage = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]",
    cyan: "bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]",
    amber: "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]",
    rose: "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]",
    blue: "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]",
    purple: "bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.5)]",
    orange: "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.5)]",
    red: "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]",
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showValues) && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            {label && <span className="font-semibold text-neutral-300">{label}</span>}
            {sublabel && <span className="text-neutral-500">({sublabel})</span>}
          </div>
          {showValues && (
            <span className="font-medium text-neutral-400">
              <strong className="text-white font-semibold">{value}</strong> / {max} {unit}
              <span className="text-neutral-500 ml-1.5 font-normal">({percentage}%)</span>
            </span>
          )}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08] p-[1px]">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${(colorMap[color as string] || colorMap.emerald)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: "emerald" | "cyan" | "amber";
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  color = "emerald",
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]",
    cyan: "bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]",
    amber: "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]",
    rose: "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]",
    blue: "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]",
    purple: "bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.5)]",
    orange: "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.5)]",
    red: "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]",
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={(colorMap[color as string] || colorMap.emerald)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
};


