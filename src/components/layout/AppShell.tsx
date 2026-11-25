"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useInventoryStore } from "@/store/useInventoryStore";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const setHydrated = useInventoryStore((s) => s.setHydrated);

  useEffect(() => {
    setMounted(true);
    setHydrated();
  }, [setHydrated]);

  if (!mounted) {
    // Avoid hydration layout flickers
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#593A2C] flex items-center justify-center animate-pulse">
            <span className="text-[#F8F6F1] font-bold text-sm">SW</span>
          </div>
          <p className="text-xs font-medium text-[#918477]">Loading Stockwell...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F6F1] text-[#30251F]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
