"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  SlidersHorizontal,
  History,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Package,
  AlertTriangle,
} from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  calculateStockStatus,
  getStockStatusLabel,
} from "@/lib/utils";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { AdjustStockModal } from "@/components/modals/AdjustStockModal";
import { Product } from "@/types";

export default function StockPage() {
  const { products, stockMovements, settings, getMetrics } = useInventoryStore();
  const metrics = getMetrics();

  const [activeTab, setActiveTab] = useState<"inventory" | "history">("inventory");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [movementTypeFilter, setMovementTypeFilter] = useState("all");

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);

  // Extract categories
  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  // Filtered products for Tab 1
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;

      const currentStatus = calculateStockStatus(p.stockQuantity, p.minStockLevel);
      const matchesStatus = statusFilter === "all" || currentStatus === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  // Filtered movements for Tab 2
  const filteredMovements = useMemo(() => {
    return stockMovements.filter((m) => {
      const matchesSearch =
        m.productName.toLowerCase().includes(search.toLowerCase()) ||
        m.sku.toLowerCase().includes(search.toLowerCase()) ||
        m.referenceId.toLowerCase().includes(search.toLowerCase()) ||
        m.reason.toLowerCase().includes(search.toLowerCase());

      const matchesType = movementTypeFilter === "all" || m.type === movementTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [stockMovements, search, movementTypeFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E9E2D8]">
        <div>
          <h1 className="text-[32px] sm:text-[34px] font-bold text-[#30251F] tracking-tight leading-tight">
            Stock Management
          </h1>
          <p className="text-sm sm:text-base text-[#918477] mt-1">
            Monitor real-time warehouse inventory, threshold alerts, and transaction audit trails.
          </p>
        </div>
        <button
          onClick={() => {
            setProductToAdjust(null);
            setIsAdjustModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#593A2C] hover:bg-[#472E23] text-white text-sm sm:text-base font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Adjust Stock Manually</span>
        </button>
      </div>

      {/* TOP 4 METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Products"
          value={metrics.totalProducts}
          subtitle="Catalogued SKUs"
          icon={Package}
        />
        <MetricCard
          title="Total Units"
          value={metrics.totalUnits}
          subtitle="Physical pieces in warehouse"
          icon={Layers}
        />
        <MetricCard
          title="Low Stock"
          value={metrics.lowStockCount}
          subtitle="At or below minimum threshold"
          icon={AlertTriangle}
          trend={{ value: `${metrics.lowStockCount} items`, isPositive: false }}
        />
        <MetricCard
          title="Out of Stock"
          value={metrics.outOfStockCount}
          subtitle="Zero available units"
          icon={AlertTriangle}
          highlight={metrics.outOfStockCount > 0}
          trend={{ value: `${metrics.outOfStockCount} zero-stock`, isPositive: false }}
        />
      </div>

      {/* TABS SELECTOR */}
      <div className="flex items-center justify-between border-b border-[#E9E2D8] pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab("inventory");
              setSearch("");
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "inventory"
                ? "bg-[#593A2C] text-white shadow-xs"
                : "text-[#765440] hover:text-[#30251F] hover:bg-[#F0EBE2]"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Current Inventory ({products.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("history");
              setSearch("");
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "history"
                ? "bg-[#593A2C] text-white shadow-xs"
                : "text-[#765440] hover:text-[#30251F] hover:bg-[#F0EBE2]"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Stock History & Movements ({stockMovements.length})</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 rounded-2xl bg-white border border-[#E9E2D8] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#A78B73] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === "inventory"
                ? "Search product or SKU..."
                : "Search by product, SKU, reference ID, or reason..."
            }
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] placeholder-[#918477] focus:border-[#593A2C] focus:bg-white outline-none transition-colors text-sm"
          />
        </div>

        {activeTab === "inventory" ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <select
              value={movementTypeFilter}
              onChange={(e) => setMovementTypeFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
            >
              <option value="all">All Movement Types</option>
              <option value="purchase">Purchase Orders (Incoming)</option>
              <option value="sale">Sales Orders (Outgoing)</option>
              <option value="adjustment">Manual Adjustments</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: CURRENT STOCK TABLE */}
      {activeTab === "inventory" && (
        <div className="rounded-2xl border border-[#E9E2D8] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-xs sm:text-sm text-[#918477]">
                  <th className="py-3 px-4 font-semibold">Product Name</th>
                  <th className="py-3 px-4 font-semibold">SKU</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold text-center">Current Quantity</th>
                  <th className="py-3 px-4 font-semibold text-center">Minimum Threshold</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Last Updated</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E2D8] text-sm sm:text-base">
                {filteredProducts.map((p) => {
                  const status = calculateStockStatus(p.stockQuantity, p.minStockLevel);
                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#30251F]">
                        <span className="font-semibold">{p.name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-[#765440] text-sm">{p.sku}</td>
                      <td className="py-3.5 px-4 text-[#918477]">{p.category}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full font-bold text-xs sm:text-sm ${
                            p.stockQuantity === 0
                              ? "bg-red-100 text-red-700"
                              : p.stockQuantity <= p.minStockLevel
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {p.stockQuantity} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-[#765440] font-medium text-sm">
                        {p.minStockLevel} units
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={status} size="sm">
                          {getStockStatusLabel(status)}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-[#918477] text-xs sm:text-sm">{formatDate(p.updatedAt)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setProductToAdjust(p);
                            setIsAdjustModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#F0EBE2] hover:bg-[#593A2C] hover:text-white text-[#593A2C] font-semibold text-xs sm:text-sm transition-colors"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#E9E2D8] flex items-center justify-between text-xs sm:text-sm text-[#918477]">
            <span>
              Total: <strong>{filteredProducts.length}</strong> products
            </span>
            <span>
              Total Units:{" "}
              <strong>{filteredProducts.reduce((sum, p) => sum + p.stockQuantity, 0)}</strong>
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: STOCK HISTORY & MOVEMENTS */}
      {activeTab === "history" && (
        <div className="rounded-2xl border border-[#E9E2D8] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-xs sm:text-sm text-[#918477]">
                  <th className="py-3 px-4 font-semibold">Date & Time</th>
                  <th className="py-3 px-4 font-semibold">Reference ID</th>
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 font-semibold">Movement Type</th>
                  <th className="py-3 px-4 font-semibold text-center">Change</th>
                  <th className="py-3 px-4 font-semibold text-center">Previous Qty</th>
                  <th className="py-3 px-4 font-semibold text-center">New Qty</th>
                  <th className="py-3 px-4 font-semibold">Reason / Audit Trail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E2D8] text-sm sm:text-base">
                {filteredMovements.map((m) => {
                  const isIncoming = m.quantityChange > 0;
                  return (
                    <tr key={m.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-3.5 px-4 text-[#918477] whitespace-nowrap">
                        {formatDateTime(m.date)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#593A2C]">
                        {m.referenceId}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#30251F]">
                        <span className="block font-semibold">{m.productName}</span>
                        <span className="text-[10px] font-mono text-[#918477]">SKU: {m.sku}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            m.type === "purchase"
                              ? "bg-emerald-100 text-emerald-800"
                              : m.type === "sale"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {m.type === "purchase" ? (
                            <ArrowDownLeft className="w-3 h-3" />
                          ) : m.type === "sale" ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                          <span className="capitalize">{m.type}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-md ${
                            isIncoming
                              ? "bg-[#EBF5ED] text-[#2E6930]"
                              : "bg-[#FEE2E2] text-[#B91C1C]"
                          }`}
                        >
                          {isIncoming ? `+${m.quantityChange}` : m.quantityChange}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-[#918477] font-medium">
                        {m.previousQuantity}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-[#30251F]">
                        {m.newQuantity}
                      </td>
                      <td className="py-3.5 px-4 text-[#765440] text-[11px] max-w-[240px] truncate">
                        {m.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#E9E2D8] flex items-center justify-between text-xs text-[#918477]">
            <span>
              Showing <strong>{filteredMovements.length}</strong> logged transactions
            </span>
            <span className="font-mono text-[11px]">Audit log is immutable and permanent</span>
          </div>
        </div>
      )}

      {/* ADJUST STOCK MODAL */}
      <AdjustStockModal
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setProductToAdjust(null);
        }}
        preselectedProductId={productToAdjust?.id}
      />
    </div>
  );
}
