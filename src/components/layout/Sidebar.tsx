"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Layers,
  BarChart3,
  Users,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const pathname = usePathname();

  const navigationSections = [
    {
      title: "WORKSPACE",
      items: [
        {
          name: "Dashboard",
          href: "/",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "OPERATIONS",
      items: [
        {
          name: "Products",
          href: "/products",
          icon: Package,
        },
        {
          name: "Sales",
          href: "/sales",
          icon: ShoppingCart,
        },
        {
          name: "Purchases",
          href: "/purchases",
          icon: Truck,
        },
        {
          name: "Stock",
          href: "/stock",
          icon: Layers,
        },
      ],
    },
    {
      title: "ANALYTICS",
      items: [
        {
          name: "Reports",
          href: "/reports",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "MANAGEMENT",
      items: [
        {
          name: "Customers",
          href: "/customers",
          icon: Users,
        },
        {
          name: "Suppliers",
          href: "/suppliers",
          icon: Building2,
        },
      ],
    },
    {
      title: "PREFERENCES",
      items: [
        {
          name: "Settings",
          href: "/settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "bg-[#F0EBE2] border-r border-[#E9E2D8] flex flex-col transition-all duration-300 select-none z-30",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand logo section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#E9E2D8]/80 bg-[#EFE9E0]">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden group">
          {/* Minimal Geometric Logo */}
          <div className="w-8 h-8 rounded-xl bg-[#593A2C] text-[#F8F6F1] flex items-center justify-center shrink-0 shadow-sm group-hover:bg-[#472E23] transition-colors">
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
                STOCKWELL
              </span>
              <span className="text-[10px] text-[#918477] tracking-tight -mt-0.5">
                Inventory OS
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="p-1 rounded-lg text-[#918477] hover:text-[#30251F] hover:bg-[#E5DEC] transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navigationSections.map((section, idx) => (
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
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm sm:text-base font-medium transition-all group",
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
      <div className="p-3 border-t border-[#E9E2D8] bg-[#EBE5DB]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#593A2C] text-[#F8F6F1] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            AM
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#30251F] truncate">Alex Morgan</p>
              <p className="text-[10px] text-[#918477] truncate">Operations Lead</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
