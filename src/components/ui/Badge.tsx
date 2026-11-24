import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "pending"
  | "completed"
  | "cancelled"
  | "paid"
  | "partial"
  | "unpaid"
  | "ordered"
  | "received"
  | "draft"
  | "default";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className,
  size = "md",
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case "in_stock":
      case "completed":
      case "received":
      case "paid":
        return "bg-[#EBF5ED] text-[#2E6930] border-[#C3E3C8]";
      case "low_stock":
      case "pending":
      case "partial":
      case "ordered":
        return "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]";
      case "out_of_stock":
      case "unpaid":
        return "bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]";
      case "cancelled":
        return "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]";
      case "draft":
        return "bg-[#F5F2EB] text-[#765440] border-[#E2D8CC]";
      default:
        return "bg-[#F0EBE2] text-[#593A2C] border-[#E9E2D8]";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border rounded-full transition-colors whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        getVariantClass(),
        className
      )}
    >
      <span
        className={cn("w-1.5 h-1.5 rounded-full shrink-0", {
          "bg-[#2E6930]": ["in_stock", "completed", "received", "paid"].includes(variant),
          "bg-[#B45309]": ["low_stock", "pending", "partial", "ordered"].includes(variant),
          "bg-[#B91C1C]": ["out_of_stock", "unpaid"].includes(variant),
          "bg-[#A78B73]": variant === "draft",
          "bg-[#6B7280]": ["cancelled", "default"].includes(variant),
        })}
      />
      {children}
    </span>
  );
};
