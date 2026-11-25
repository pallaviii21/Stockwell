"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, label, error, hint, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-xs sm:text-sm font-semibold text-[#593A2C]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] text-sm outline-none transition-all duration-150 focus:border-[#593A2C] focus:bg-white focus:ring-1 focus:ring-[#593A2C]/20 disabled:opacity-50 disabled:bg-[#F0EBE2] cursor-pointer",
              error && "border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]/20",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="w-4 h-4 text-[#918477] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {error && <p className="text-xs text-[#B91C1C] font-medium">{error}</p>}
        {hint && !error && <p className="text-xs text-[#918477]">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
