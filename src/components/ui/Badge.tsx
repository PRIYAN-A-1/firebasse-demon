import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "outline" | "glass" | "cyan" | "emerald" | "amber" | "rose" | "neutral" | "violet" | "blue" | "orange" | "red" | "purple" | string;
  size?: "sm" | "md" | "lg";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyle = "inline-flex items-center rounded-full font-medium transition-colors";
  
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base",
  };
  
  const variants: Record<string, string> = {
    primary: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
    secondary: "bg-gray-800 text-gray-300 border border-gray-700",
    success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    danger: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
    outline: "border border-gray-600 text-gray-300",
    glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white",
    cyan: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
    emerald: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    amber: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    rose: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
    neutral: "bg-gray-800 text-gray-300 border border-gray-700",
    violet: "bg-violet-500/20 text-violet-400 border border-violet-500/30",
    blue: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    orange: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    red: "bg-red-500/20 text-red-400 border border-red-500/30",
    purple: "bg-purple-500/20 text-purple-400 border border-purple-500/30"
  };

  const variantStyle = variants[variant as string] || variants.primary;
  const sizeStyle = sizeStyles[size] || sizeStyles.md;

  return (
    <span className={`${baseStyle} ${sizeStyle} ${variantStyle} ${className}`} {...props}>
      {children}
    </span>
  );
};
