"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Calendar,
  ChevronDown,
  RefreshCw,
  Sliders,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";
import { GlobalSearchModal } from "@/components/ui/GlobalSearchModal";
import { useInventoryStore } from "@/store/useInventoryStore";
import Link from "next/link";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { resetToSampleData } = useInventoryStore();

  const getBreadcrumbs = () => {
    switch (pathname) {
      case "/":
        return ["Workspace", "Dashboard Overview"];
      case "/products":
        return ["Operations", "Products Catalogue"];
      case "/sales":
        return ["Operations", "Sales Orders"];
      case "/purchases":
        return ["Operations", "Purchase Orders"];
      case "/stock":
        return ["Operations", "Stock & Movements"];
      case "/reports":
        return ["Analytics", "Business Reports"];
      case "/customers":
        return ["Management", "Customer Accounts"];
      case "/suppliers":
        return ["Management", "Supplier Directory"];
      case "/settings":
        return ["Preferences", "General Settings"];
      default:
        return ["Stockwell", "Overview"];
    }
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <>
      <header className="h-16 bg-[#FFFFFF] border-b border-[#E9E2D8] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20 shadow-xs">
        {/* Left: Breadcrumbs navigation */}
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="text-[#918477] font-medium">{breadcrumbs[0]}</span>
          <span className="text-[#D9CEBF]">/</span>
          <span className="text-[#30251F] font-semibold">{breadcrumbs[1]}</span>
        </div>

        {/* Center: Global Search trigger */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#F8F6F1] border border-[#E9E2D8] text-xs sm:text-sm text-[#918477] hover:border-[#D9CEBF] hover:text-[#593A2C] transition-all"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#A78B73]" />
              <span>Search products, orders, customers...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-[#765440] bg-[#FAF8F5] rounded border border-[#E9E2D8]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-3">
          {/* Mobile search button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 text-[#765440] hover:text-[#30251F] hover:bg-[#F0EBE2] rounded-xl text-sm"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Current Date Display */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8F6F1] border border-[#E9E2D8] text-xs sm:text-sm text-[#593A2C] font-medium">
            <Calendar className="w-4 h-4 text-[#A78B73]" />
            <span>Tuesday, Nov 24, 2026</span>
          </div>

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-transparent hover:border-[#E9E2D8] hover:bg-[#FAF8F5] transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-[#593A2C] text-white flex items-center justify-center font-bold text-xs">
                AM
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#918477]" />
            </button>

            {isUserMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#E9E2D8] shadow-xl py-1 z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <div className="px-4 py-2.5 border-b border-[#E9E2D8] bg-[#FAF8F5]">
                  <p className="text-xs font-semibold text-[#30251F]">Alex Morgan</p>
                  <p className="text-[11px] text-[#918477]">alex@stockwell.io</p>
                </div>

                <div className="p-1 space-y-0.5">
                  <Link
                    href="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-[#593A2C] hover:bg-[#F8F6F1] rounded-xl transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#A78B73]" />
                    <span>Business Settings</span>
                  </Link>

                  <button
                    onClick={() => {
                      if (confirm("Reset all store data to default sample seed data?")) {
                        resetToSampleData();
                        setIsUserMenuOpen(false);
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#B45309] hover:bg-[#FEF3C7]/40 rounded-xl transition-colors text-left"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Sample Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Dialog */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
