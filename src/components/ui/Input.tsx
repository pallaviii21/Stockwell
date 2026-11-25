"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, hint, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-xs sm:text-sm font-semibold text-[#593A2C]">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] placeholder-[#918477] text-sm outline-none transition-all duration-150 focus:border-[#593A2C] focus:bg-white focus:ring-1 focus:ring-[#593A2C]/20 disabled:opacity-50 disabled:bg-[#F0EBE2]",
            error && "border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#B91C1C] font-medium">{error}</p>}
        {hint && !error && <p className="text-xs text-[#918477]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
