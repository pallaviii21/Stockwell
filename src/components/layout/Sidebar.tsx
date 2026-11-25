"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAVIGATION_SECTIONS } from "@/constants/navigation";
import { APP_STRINGS } from "@/constants/strings";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({ collapsed, onToggle }) => {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "bg-[#F0EBE2] border-r border-[#E9E2D8] flex flex-col transition-all duration-300 select-none z-30 shrink-0 sticky top-0 h-screen relative",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Floating expand button on right border when collapsed */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-white border border-[#E9E2D8] shadow-xs flex items-center justify-center text-[#765440] hover:text-[#30251F] hover:bg-[#F8F6F1] hover:scale-110 transition-all z-40"
          title="Expand sidebar"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Brand logo section */}
      <div
        className={cn(
          "h-16 flex items-center border-b border-[#E9E2D8]/80 bg-[#EFE9E0] shrink-0",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2.5 overflow-hidden group/logo shrink-0",
            collapsed && "justify-center"
          )}
          title="Stockwell Dashboard"
        >
          {/* Minimal Geometric Logo - Always visible and centered in collapsed mode */}
          <div className="w-8 h-8 rounded-xl bg-[#593A2C] text-[#F8F6F1] flex items-center justify-center shrink-0 shadow-sm group-hover/logo:bg-[#472E23] transition-colors">
            <div className="grid grid-cols-2 gap-0.5 p-1">
              <span className="w-2 h-2 rounded-[2px] bg-[#F8F6F1]"></span>
              <span className="w-2 h-2 rounded-[2px] bg-[#A78B73]"></span>
              <span className="w-2 h-2 rounded-[2px] bg-[#A78B73]"></span>
              <span className="w-2 h-2 rounded-[2px] bg-[#F8F6F1]"></span>
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-[#30251F] uppercase font-mono">
                {APP_STRINGS.BRAND.NAME}
              </span>
              <span className="text-[10px] text-[#918477] tracking-tight -mt-0.5">
                {APP_STRINGS.BRAND.SUBTITLE}
              </span>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="p-1 rounded-lg text-[#918477] hover:text-[#30251F] hover:bg-[#E5DEC] transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {NAVIGATION_SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 py-1 text-xs font-bold tracking-wider text-[#A78B73] uppercase">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center rounded-xl text-sm sm:text-base font-medium transition-all group",
                    collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2",
                    isActive
                      ? "bg-[#E2D8CC] text-[#30251F] shadow-xs font-semibold"
                      : "text-[#765440] hover:text-[#30251F] hover:bg-[#EAE2D7]"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive
                        ? "text-[#593A2C]"
                        : "text-[#918477] group-hover:text-[#593A2C]"
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Profile card */}
      <div className="p-3 border-t border-[#E9E2D8] bg-[#EBE5DB] shrink-0">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          <div className="w-8 h-8 rounded-full bg-[#593A2C] text-[#F8F6F1] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            AM
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#30251F] truncate">{APP_STRINGS.BRAND.USER_NAME}</p>
              <p className="text-[10px] text-[#918477] truncate">{APP_STRINGS.BRAND.USER_ROLE}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
});

Sidebar.displayName = "Sidebar";
