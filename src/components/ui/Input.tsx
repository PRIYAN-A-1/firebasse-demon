import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-neutral-500">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-xl bg-white/[0.04] border ${
              error ? "border-rose-500/80 focus:ring-rose-500/40" : "border-white/10 focus:border-emerald-500/60 focus:ring-emerald-500/20"
            } py-2.5 ${leftIcon ? "pl-10" : "pl-3.5"} ${
              rightIcon ? "pr-10" : "pr-3.5"
            } text-sm text-white placeholder-neutral-500 transition-all focus:outline-none focus:ring-2 backdrop-blur-md disabled:opacity-50 ${className}`}
            {...props}
          />
          {rightIcon && <div className="absolute right-3.5 flex items-center text-neutral-400">{rightIcon}</div>}
        </div>
        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
        {!error && helperText && <p className="text-xs text-neutral-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full rounded-xl bg-[#141824] border ${
            error ? "border-rose-500/80" : "border-white/10 focus:border-emerald-500/60 focus:ring-emerald-500/20"
          } px-3.5 py-2.5 text-sm text-white transition-all focus:outline-none focus:ring-2 ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#10121A] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "emerald" | "cyan" | "amber" | "rose" | "neutral";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "emerald",
  size = "md",
  className = "",
}) => {
  const variantStyles = {
    emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    rose: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    neutral: "bg-white/5 text-neutral-300 border-white/10",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs font-medium",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} tracking-wide ${className}`}
    >
      {children}
    </span>
  );
};
