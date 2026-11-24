"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, AlertTriangle, ArrowUpRight, CheckCircle2, Package } from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Link from "next/link";

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { products, activities, settings } = useInventoryStore();

  const lowStockItems = products.filter((p) => p.stockQuantity <= p.minStockLevel);
  const recentActivities = activities.slice(0, 5);

  const totalNotifications = lowStockItems.length + Math.min(recentActivities.length, 3);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#765440] hover:text-[#30251F] hover:bg-[#F0EBE2] rounded-xl transition-colors border border-transparent hover:border-[#E9E2D8]"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {totalNotifications > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#B45309] text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {totalNotifications > 9 ? "9+" : totalNotifications}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#E9E2D8] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-4 border-b border-[#E9E2D8] bg-[#FAF8F5] flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-[#30251F]">Notifications & Alerts</h4>
              <p className="text-xs text-[#918477]">
                {lowStockItems.length} inventory alerts, {recentActivities.length} recent events
              </p>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F0EBE2] text-[#593A2C]">
              Live
            </span>
          </div>

          <div className="max-h-[360px] overflow-y-auto divide-y divide-[#E9E2D8]">
            {/* Low stock alerts first */}
            {lowStockItems.length > 0 && (
              <div className="p-3 bg-[#FEF9E7]/40">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B45309] mb-2 px-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Low Stock Warning ({lowStockItems.length})</span>
                </div>
                <div className="space-y-1.5">
                  {lowStockItems.slice(0, 3).map((item) => (
                    <Link
                      key={item.id}
                      href="/stock"
                      onClick={() => setIsOpen(false)}
                      className="block p-2 rounded-xl bg-white border border-[#FDE68A] hover:border-[#B45309] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#30251F] truncate">
                          {item.name}
                        </span>
                        <span className="text-xs font-bold text-[#B91C1C]">
                          {item.stockQuantity} left
                        </span>
                      </div>
                      <div className="text-[11px] text-[#918477] mt-0.5 flex justify-between">
                        <span>SKU: {item.sku}</span>
                        <span>Min required: {item.minStockLevel}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent activities */}
            <div className="p-3 space-y-2">
              <span className="text-xs font-semibold text-[#918477] uppercase tracking-wider px-1">
                Recent Activities
              </span>
              {recentActivities.map((act) => (
                <div key={act.id} className="p-2 rounded-xl hover:bg-[#F8F6F1] transition-colors">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-[#F0EBE2] text-[#593A2C] flex items-center justify-center shrink-0 mt-0.5">
                      {act.type === "sale" ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#2E6930]" />
                      ) : act.type === "purchase" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#593A2C]" />
                      ) : (
                        <Package className="w-3.5 h-3.5 text-[#B45309]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#30251F] truncate">{act.title}</p>
                      <p className="text-[11px] text-[#918477] line-clamp-1">{act.description}</p>
                      <span className="text-[10px] text-[#A78B73] mt-0.5 block">
                        {formatDateTime(act.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 border-t border-[#E9E2D8] bg-[#FAF8F5] text-center">
            <Link
              href="/stock"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-[#593A2C] hover:text-[#472E23] transition-colors"
            >
              View all inventory movements →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
