"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, placeholder = "Search...", ...props }, ref) => {
    return (
      <div className={cn("relative flex-1", className)}>
        <Search className="w-4 h-4 text-[#A78B73] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] placeholder-[#918477] focus:border-[#593A2C] focus:bg-white focus:ring-1 focus:ring-[#593A2C]/20 outline-none transition-all duration-150 text-sm"
          {...props}
        />
        {Boolean(value) && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#918477] hover:text-[#30251F] rounded-lg transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
