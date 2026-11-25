"use client";

import React, { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Search, Calendar } from "lucide-react";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";
import { GlobalSearchModal } from "@/components/ui/GlobalSearchModal";
import { useInventoryStore } from "@/store/useInventoryStore";
import Link from "next/link";
import { APP_STRINGS } from "@/constants/strings";

const BREADCRUMB_MAP: Record<string, [string, string]> = {
  "/": ["Workspace", "Dashboard Overview"],
  "/products": ["Operations", "Products Catalogue"],
  "/sales": ["Operations", "Sales Orders"],
  "/purchases": ["Operations", "Purchase Orders"],
  "/stock": ["Operations", "Stock & Movements"],
  "/reports": ["Analytics", "Business Reports"],
  "/customers": ["Management", "Customer Accounts"],
  "/suppliers": ["Management", "Supplier Directory"],
  "/settings": ["Preferences", "General Settings"],
};

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { resetToSampleData } = useInventoryStore();

  const breadcrumbs = BREADCRUMB_MAP[pathname] || [APP_STRINGS.BRAND.NAME, "Overview"];

  // Dynamically formatted current date
  const currentDateString = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date());
  }, []);

  return (
    <>
      <header className="h-16 bg-[#FFFFFF] border-b border-[#E9E2D8] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20 shadow-xs shrink-0">
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
              <span>{APP_STRINGS.COMMON.SEARCH_PLACEHOLDER}</span>
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
            <span>{currentDateString}</span>
          </div>

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-[#F0EBE2] transition-colors border border-transparent hover:border-[#E9E2D8]"
            >
              <div className="w-7 h-7 rounded-lg bg-[#593A2C] text-[#F8F6F1] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                AM
              </div>
              <span className="hidden sm:inline-block text-xs font-medium text-[#30251F]">
                {APP_STRINGS.BRAND.USER_NAME}
              </span>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#E9E2D8] shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                <div className="px-3 py-2 border-b border-[#E9E2D8] mb-1">
                  <p className="font-semibold text-[#30251F]">{APP_STRINGS.BRAND.USER_NAME}</p>
                  <p className="text-[11px] text-[#918477]">alex@stockwell.io</p>
                </div>

                <Link
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#765440] hover:text-[#30251F] hover:bg-[#F8F6F1] transition-colors"
                >
                  <span>Company Settings</span>
                </Link>

                <button
                  onClick={() => {
                    if (confirm("Reset application data to initial demonstration state?")) {
                      resetToSampleData();
                      setIsUserMenuOpen(false);
                    }
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-[#B45309] hover:bg-[#FEF9E7] transition-colors mt-1"
                >
                  <span>Reset to Sample Data</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
