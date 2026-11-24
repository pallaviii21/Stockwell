import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  highlight?: boolean;
  className?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlight = false,
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-5 rounded-2xl border transition-all duration-200 bg-white shadow-sm",
        highlight
          ? "border-[#593A2C]/30 bg-gradient-to-br from-white to-[#F8F6F1]"
          : "border-[#E9E2D8] hover:border-[#D9CEBF]",
        onClick && "cursor-pointer hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#918477]">
          {title}
        </span>
        <div className="w-10 h-10 rounded-xl bg-[#F0EBE2] text-[#593A2C] flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-[28px] sm:text-[32px] font-bold text-[#30251F] tracking-tight">
          {value}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <span
              className={cn(
                "text-xs sm:text-sm font-medium px-2 py-0.5 rounded-md",
                trend.isPositive
                  ? "bg-[#EBF5ED] text-[#2E6930]"
                  : "bg-[#FEE2E2] text-[#B91C1C]"
              )}
            >
              {trend.value}
            </span>
          )}
          {subtitle && <p className="text-xs sm:text-sm text-[#918477]">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};
