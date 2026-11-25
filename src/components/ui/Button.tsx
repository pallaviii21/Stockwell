"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary: "bg-[#593A2C] hover:bg-[#472E23] text-white shadow-xs focus-visible:ring-[#593A2C]",
      secondary: "bg-[#F0EBE2] hover:bg-[#EAE4DC] text-[#593A2C] border border-[#E9E2D8] focus-visible:ring-[#593A2C]",
      destructive: "bg-[#B91C1C] hover:bg-[#991B1B] text-white shadow-xs focus-visible:ring-[#B91C1C]",
      outline: "bg-transparent hover:bg-[#F0EBE2] text-[#593A2C] border border-[#E9E2D8] hover:border-[#D9CEBF] focus-visible:ring-[#593A2C]",
      ghost: "bg-transparent hover:bg-[#F0EBE2] text-[#765440] hover:text-[#30251F] focus-visible:ring-[#593A2C]",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
      md: "px-4 py-2 text-sm rounded-xl gap-2",
      lg: "px-5 py-2.5 text-sm sm:text-base rounded-xl gap-2.5 font-semibold",
      icon: "p-2 rounded-xl text-sm",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
