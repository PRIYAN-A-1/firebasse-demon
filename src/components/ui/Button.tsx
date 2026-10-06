import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "glass" | "outline" | "ghost" | "danger" | "cyan";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#090A0F] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5 font-semibold",
  };

  const variantStyles = {
    primary:
      "bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-glow focus:ring-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]",
    secondary:
      "bg-white/10 hover:bg-white/15 text-white border border-white/10 backdrop-blur-md focus:ring-white/30",
    glass:
      "bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 backdrop-blur-lg hover:border-emerald-500/40 hover:shadow-glow focus:ring-emerald-500/30",
    outline:
      "bg-transparent hover:bg-white/5 text-neutral-200 border border-neutral-700 hover:border-neutral-500 focus:ring-neutral-500",
    ghost:
      "bg-transparent hover:bg-white/5 text-neutral-300 hover:text-white focus:ring-white/20",
    danger:
      "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 focus:ring-rose-500/40",
    cyan:
      "bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-glowCyan focus:ring-cyan-400",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
