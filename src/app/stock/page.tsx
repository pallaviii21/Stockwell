"use client";

import React, { useState, useMemo } from "react";
import { Layers, SlidersHorizontal, ArrowUpRight, Package, AlertTriangle } from "lucide-react";
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
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { AdjustStockModal } from "@/components/modals/AdjustStockModal";
import { Product } from "@/types";
import { APP_STRINGS } from "@/constants/strings";

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
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);

      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;

      const currentStatus = calculateStockStatus(p.stockQuantity, p.minStockLevel);
      const matchesStatus = statusFilter === "all" || currentStatus === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  // Filtered movements for Tab 2
  const filteredMovements = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stockMovements.filter((m) => {
      const matchesSearch =
        !q ||
        m.productName.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q) ||
        m.referenceId.toLowerCase().includes(q) ||
        (m.reason && m.reason.toLowerCase().includes(q));

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
        <Button
          onClick={() => {
            setProductToAdjust(null);
            setIsAdjustModalOpen(true);
          }}
          size="lg"
          className="self-start sm:self-auto"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Adjust Stock Manually</span>
        </Button>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Products"
          value={metrics.totalProducts}
          subtitle="Catalogued SKUs"
          icon={Package}
        />
        <MetricCard
          title="Physical Units"
          value={metrics.totalUnits.toLocaleString()}
          subtitle="Available in warehouse"
          icon={Layers}
        />
        <MetricCard
          title="Low Stock Items"
          value={metrics.lowStockCount}
          subtitle="Reorder required"
          icon={AlertTriangle}
          highlight={metrics.lowStockCount > 0}
        />
        <MetricCard
          title="Out of Stock"
          value={metrics.outOfStockCount}
          subtitle="Zero units on hand"
          icon={AlertTriangle}
          highlight={metrics.outOfStockCount > 0}
        />
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#E9E2D8] pb-1 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all ${
            activeTab === "inventory"
              ? "bg-white text-[#593A2C] border-t border-x border-[#E9E2D8] -mb-px font-bold"
              : "text-[#765440] hover:text-[#30251F]"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Current Inventory ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-xl transition-all ${
            activeTab === "history"
              ? "bg-white text-[#593A2C] border-t border-x border-[#E9E2D8] -mb-px font-bold"
              : "text-[#765440] hover:text-[#30251F]"
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Stock Movement Ledger ({stockMovements.length})</span>
        </button>
      </div>

      {/* TAB 1: Current Inventory */}
      {activeTab === "inventory" && (
        <div className="space-y-4">
          <Card className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-sm">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              placeholder="Filter inventory by product name or SKU..."
              className="max-w-md"
            />

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-40">
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="w-36">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-xs font-semibold text-[#765440] uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Product Name</th>
                    <th className="py-3.5 px-4">SKU</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-center">Current Quantity</th>
                    <th className="py-3.5 px-4 text-center">Min Threshold</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E2D8]">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-[#918477]">
                        <p className="font-medium text-sm text-[#593A2C]">No stock records found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const status = calculateStockStatus(p.stockQuantity, p.minStockLevel);
                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-[#FAF8F5]/60 transition-colors group"
                        >
                          <td className="py-3.5 px-4 font-semibold text-[#30251F]">
                            {p.name}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-[#765440]">
                            {p.sku}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-lg bg-[#F0EBE2] text-xs font-medium text-[#765440]">
                              {p.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-sm text-[#30251F]">
                            {p.stockQuantity}
                          </td>
                          <td className="py-3.5 px-4 text-center text-xs text-[#918477]">
                            {p.minStockLevel}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <Badge variant={status}>{getStockStatusLabel(status)}</Badge>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setProductToAdjust(p);
                                setIsAdjustModalOpen(true);
                              }}
                            >
                              Adjust
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Stock History & Movements */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <Card className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-sm">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              placeholder="Search movements by product, SKU, Ref ID..."
              className="max-w-md"
            />

            <div className="w-40">
              <Select
                value={movementTypeFilter}
                onChange={(e) => setMovementTypeFilter(e.target.value)}
              >
                <option value="all">All Movements</option>
                <option value="purchase">Purchases (Inbound)</option>
                <option value="sale">Sales (Outbound)</option>
                <option value="adjustment">Adjustments</option>
              </Select>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-xs font-semibold text-[#765440] uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Ref ID</th>
                    <th className="py-3.5 px-4">Product Name</th>
                    <th className="py-3.5 px-4 text-center">Movement Type</th>
                    <th className="py-3.5 px-4 text-center">Qty Change</th>
                    <th className="py-3.5 px-4 text-center">Previous Qty</th>
                    <th className="py-3.5 px-4 text-center">New Qty</th>
                    <th className="py-3.5 px-4">Audit Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E2D8]">
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-[#918477]">
                        <p className="font-medium text-sm text-[#593A2C]">No stock movement records found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map((m) => {
                      const isPositive = m.quantityChange > 0;
                      return (
                        <tr
                          key={m.id}
                          className="hover:bg-[#FAF8F5]/60 transition-colors"
                        >
                          <td className="py-3.5 px-4 text-xs text-[#765440]">
                            {formatDateTime(m.date)}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs font-bold text-[#30251F]">
                            {m.referenceId}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-[#30251F]">{m.productName}</div>
                            <div className="text-xs text-[#918477] font-mono">{m.sku}</div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                                m.type === "purchase"
                                  ? "bg-[#EBF5ED] text-[#2E6930]"
                                  : m.type === "sale"
                                  ? "bg-[#FEF3C7] text-[#B45309]"
                                  : "bg-[#F0EBE2] text-[#593A2C]"
                              }`}
                            >
                              {m.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-sm">
                            <span
                              className={isPositive ? "text-[#2E6930]" : "text-[#B91C1C]"}
                            >
                              {isPositive ? `+${m.quantityChange}` : m.quantityChange}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center text-xs text-[#918477]">
                            {m.previousQuantity}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-xs sm:text-sm text-[#30251F]">
                            {m.newQuantity}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-[#765440]">
                            {m.reason || "Standard transaction"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Adjust Stock Modal */}
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
