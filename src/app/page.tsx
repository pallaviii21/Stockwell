"use client";

import React, { useState, useMemo } from "react";
import {
  Package,
  CircleDollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  ShoppingCart,
  Truck,
  SlidersHorizontal,
  ArrowUpRight,
  RefreshCcw,
  Boxes,
} from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { formatCurrency, formatDate, calculateStockStatus } from "@/lib/utils";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { AddProductModal } from "@/components/modals/AddProductModal";
import { CreateSalesOrderModal } from "@/components/modals/CreateSalesOrderModal";
import { CreatePurchaseOrderModal } from "@/components/modals/CreatePurchaseOrderModal";
import { AdjustStockModal } from "@/components/modals/AdjustStockModal";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type DateRange = "today" | "7days" | "30days" | "all";

export default function DashboardPage() {
  const [dateFilter, setDateFilter] = useState<DateRange>("7days");

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [preselectedRestockProduct, setPreselectedRestockProduct] = useState<string | undefined>();

  const { products, salesOrders, activities, settings, getMetrics } = useInventoryStore();

  const metrics = getMetrics();

  // Filter sales and chart data by selected date range
  const { chartData, filteredSalesTotal } = useMemo(() => {
    const now = new Date();
    let daysToInclude = 7;
    if (dateFilter === "today") daysToInclude = 1;
    if (dateFilter === "7days") daysToInclude = 7;
    if (dateFilter === "30days") daysToInclude = 30;
    if (dateFilter === "all") daysToInclude = 365;

    // Generate date buckets
    const buckets: Record<string, number> = {};
    const dayKeys: string[] = [];

    for (let i = daysToInclude - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      buckets[key] = 0;
      dayKeys.push(key);
    }

    let total = 0;
    salesOrders.forEach((order) => {
      if (order.orderStatus === "completed") {
        const orderDate = new Date(order.orderDate);
        const diffDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays <= daysToInclude) {
          total += order.totalAmount;
          const key = orderDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          if (buckets[key] !== undefined) {
            buckets[key] += order.totalAmount;
          }
        }
      }
    });

    const data = dayKeys.map((key) => ({
      date: key,
      sales: buckets[key] || 0,
    }));

    return { chartData: data, filteredSalesTotal: total };
  }, [salesOrders, dateFilter]);

  // Inventory distribution for Donut Chart
  const inventoryPieData = useMemo(() => {
    return [
      { name: "In Stock", value: metrics.inStockCount, color: "#2E6930" },
      { name: "Low Stock", value: metrics.lowStockCount, color: "#B45309" },
      { name: "Out of Stock", value: metrics.outOfStockCount, color: "#B91C1C" },
    ].filter((item) => item.value > 0);
  }, [metrics]);

  // Low stock items list
  const lowStockProducts = useMemo(() => {
    return products
      .filter((p) => p.stockQuantity <= p.minStockLevel)
      .sort((a, b) => a.stockQuantity - b.stockQuantity);
  }, [products]);

  // Recent Sales orders
  const recentOrders = useMemo(() => {
    return salesOrders.slice(0, 5);
  }, [salesOrders]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-3 border-b border-[#E9E2D8]">
        <div>
          <h1 className="text-[32px] sm:text-[34px] font-bold text-[#30251F] tracking-tight leading-tight">
            Overview
          </h1>
          <p className="text-sm sm:text-base text-[#918477] mt-1">
            Here&apos;s what&apos;s happening with your inventory today.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-[#F0EBE2] border border-[#E9E2D8] text-sm">
            <button
              onClick={() => setDateFilter("today")}
              className={`px-3.5 py-2 rounded-lg font-medium transition-all text-sm ${
                dateFilter === "today"
                  ? "bg-white text-[#593A2C] shadow-xs font-semibold"
                  : "text-[#765440] hover:text-[#30251F]"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter("7days")}
              className={`px-3.5 py-2 rounded-lg font-medium transition-all text-sm ${
                dateFilter === "7days"
                  ? "bg-white text-[#593A2C] shadow-xs font-semibold"
                  : "text-[#765440] hover:text-[#30251F]"
              }`}
            >
              Last 7 days
            </button>
            <button
              onClick={() => setDateFilter("30days")}
              className={`px-3.5 py-2 rounded-lg font-medium transition-all text-sm ${
                dateFilter === "30days"
                  ? "bg-white text-[#593A2C] shadow-xs font-semibold"
                  : "text-[#765440] hover:text-[#30251F]"
              }`}
            >
              Last 30 days
            </button>
            <button
              onClick={() => setDateFilter("all")}
              className={`px-3.5 py-2 rounded-lg font-medium transition-all text-sm ${
                dateFilter === "all"
                  ? "bg-white text-[#593A2C] shadow-xs font-semibold"
                  : "text-[#765440] hover:text-[#30251F]"
              }`}
            >
              All time
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-[#F0EBE2]/70 border border-[#E9E2D8]">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#593A2C]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#593A2C]"></span>
          <span>Quick Actions</span>
        </div>
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#593A2C] hover:bg-[#472E23] text-white text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => setIsNewSaleOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#30251F] border border-[#E9E2D8] text-sm font-semibold shadow-xs transition-colors"
          >
            <ShoppingCart className="w-4 h-4 text-[#2E6930]" />
            <span>New Sale</span>
          </button>
          <button
            onClick={() => setIsNewPurchaseOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#30251F] border border-[#E9E2D8] text-sm font-semibold shadow-xs transition-colors"
          >
            <Truck className="w-4 h-4 text-[#593A2C]" />
            <span>New Purchase</span>
          </button>
          <button
            onClick={() => {
              setPreselectedRestockProduct(undefined);
              setIsAdjustStockOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#30251F] border border-[#E9E2D8] text-sm font-semibold shadow-xs transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#A78B73]" />
            <span>Adjust Stock</span>
          </button>
        </div>
      </div>

      {/* STATISTICS CARDS (4 Main Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Products */}
        <MetricCard
          title="Total Products"
          value={metrics.totalProducts}
          subtitle={`${metrics.totalUnits} total units in stock`}
          icon={Package}
          trend={{ value: "+2 new this month", isPositive: true }}
        />

        {/* Card 2: Inventory Value */}
        <MetricCard
          title="Inventory Value"
          value={formatCurrency(metrics.inventoryValue, settings.currency)}
          subtitle="At wholesale purchase cost"
          icon={CircleDollarSign}
        />

        {/* Card 3: Total Sales */}
        <MetricCard
          title="Total Sales"
          value={formatCurrency(metrics.totalSales, settings.currency)}
          subtitle={
            dateFilter === "7days"
              ? `₹${filteredSalesTotal.toLocaleString()} in last 7 days`
              : "Completed order revenue"
          }
          icon={TrendingUp}
          trend={{ value: "+14.8% vs last week", isPositive: true }}
        />

        {/* Card 4: Low Stock Items */}
        <MetricCard
          title="Low Stock Items"
          value={metrics.lowStockCount + metrics.outOfStockCount}
          subtitle={`${metrics.outOfStockCount} completely out of stock`}
          icon={AlertTriangle}
          highlight={metrics.lowStockCount + metrics.outOfStockCount > 0}
          trend={{
            value: `${metrics.lowStockCount} low • ${metrics.outOfStockCount} critical`,
            isPositive: false,
          }}
        />
      </div>

      {/* CHARTS ROW: Sales Overview & Inventory Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart A: Sales Overview Area Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white border border-[#E9E2D8] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-[22px] font-bold text-[#30251F]">Sales Overview</h2>
              <p className="text-xs sm:text-sm text-[#918477] mt-0.5">
                Revenue trend for {dateFilter === "all" ? "historical transactions" : dateFilter}
              </p>
            </div>
            <span className="text-sm sm:text-base font-bold text-[#593A2C] px-3 py-1.5 rounded-xl bg-[#F0EBE2]">
              {formatCurrency(filteredSalesTotal, settings.currency)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#593A2C" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#593A2C" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9E2D8" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: "#E9E2D8" }}
                  tick={{ fill: "#918477", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: "#E9E2D8" }}
                  tick={{ fill: "#918477", fontSize: 12 }}
                  tickFormatter={(val) => `₹${val > 999 ? `${val / 1000}k` : val}`}
                />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val, settings.currency), "Sales"]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E9E2D8",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                    fontSize: "13px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#593A2C"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Inventory Distribution Donut Chart (1 col) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E9E2D8] shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl sm:text-[22px] font-bold text-[#30251F]">Inventory Health</h2>
            <p className="text-xs sm:text-sm text-[#918477] mt-0.5">Product stock distribution</p>
          </div>

          <div className="h-48 w-full my-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {inventoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number, name: string) => [`${val} products`, name]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E9E2D8",
                    borderRadius: "12px",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E9E2D8] text-center">
            <div className="p-2 rounded-xl bg-[#EBF5ED]">
              <span className="block text-xs text-[#2E6930] font-semibold">In Stock</span>
              <span className="text-base font-bold text-[#2E6930]">{metrics.inStockCount}</span>
            </div>
            <div className="p-2 rounded-xl bg-[#FEF3C7]">
              <span className="block text-xs text-[#B45309] font-semibold">Low Stock</span>
              <span className="text-base font-bold text-[#B45309]">{metrics.lowStockCount}</span>
            </div>
            <div className="p-2 rounded-xl bg-[#FEE2E2]">
              <span className="block text-xs text-[#B91C1C] font-semibold">Out of Stock</span>
              <span className="text-base font-bold text-[#B91C1C]">{metrics.outOfStockCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: Low Stock Alerts & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LOW STOCK ALERTS TABLE */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E9E2D8] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FEF3C7] text-[#B45309]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl sm:text-[22px] font-bold text-[#30251F]">Low Stock Alerts</h3>
                <p className="text-xs sm:text-sm text-[#918477] mt-0.5">Items requiring immediate reorder</p>
              </div>
            </div>
            <Link
              href="/stock"
              className="text-xs sm:text-sm font-semibold text-[#593A2C] hover:text-[#472E23]"
            >
              View all ({lowStockProducts.length}) →
            </Link>
          </div>

          <div className="overflow-x-auto">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-sm text-[#918477]">
                🎉 All products have healthy inventory levels!
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E9E2D8] text-xs sm:text-sm text-[#918477] bg-[#FAF8F5]">
                    <th className="py-2.5 px-3 font-semibold">Product</th>
                    <th className="py-2.5 px-3 font-semibold">SKU</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Available</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Min Level</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Restock Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E2D8] text-sm sm:text-base">
                  {lowStockProducts.slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-3 font-medium text-[#30251F]">
                        <span className="truncate block max-w-[150px]">{p.name}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[#765440] text-sm">{p.sku}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-xs sm:text-sm ${
                            p.stockQuantity === 0
                              ? "bg-[#FEE2E2] text-[#B91C1C]"
                              : "bg-[#FEF3C7] text-[#B45309]"
                          }`}
                        >
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-[#918477] font-medium text-sm">
                        {p.minStockLevel}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setPreselectedRestockProduct(p.id);
                            setIsAdjustStockOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#F0EBE2] hover:bg-[#593A2C] hover:text-white text-[#593A2C] text-xs sm:text-sm font-semibold transition-colors"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RECENT TRANSACTIONS TABLE */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E9E2D8] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#EBF5ED] text-[#2E6930]">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl sm:text-[22px] font-bold text-[#30251F]">Recent Transactions</h3>
                <p className="text-xs sm:text-sm text-[#918477] mt-0.5">Latest customer orders and fulfillments</p>
              </div>
            </div>
            <Link
              href="/sales"
              className="text-xs sm:text-sm font-semibold text-[#593A2C] hover:text-[#472E23]"
            >
              View all orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E9E2D8] text-xs sm:text-sm text-[#918477] bg-[#FAF8F5]">
                  <th className="py-2.5 px-3 font-semibold">Order ID</th>
                  <th className="py-2.5 px-3 font-semibold">Customer</th>
                  <th className="py-2.5 px-3 font-semibold">Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E2D8] text-sm sm:text-base">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-[#593A2C] text-sm">{o.id}</td>
                    <td className="py-3 px-3 font-medium text-[#30251F] truncate max-w-[130px]">
                      {o.customerName}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#30251F]">
                      {formatCurrency(o.totalAmount, settings.currency)}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={o.orderStatus} size="sm">
                        {o.orderStatus.charAt(0).toUpperCase() + o.orderStatus.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right text-[#918477] text-xs sm:text-sm">
                      {formatDate(o.orderDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AddProductModal isOpen={isAddProductOpen} onClose={() => setIsAddProductOpen(false)} />
      <CreateSalesOrderModal isOpen={isNewSaleOpen} onClose={() => setIsNewSaleOpen(false)} />
      <CreatePurchaseOrderModal
        isOpen={isNewPurchaseOpen}
        onClose={() => setIsNewPurchaseOpen(false)}
      />
      <AdjustStockModal
        isOpen={isAdjustStockOpen}
        onClose={() => setIsAdjustStockOpen(false)}
        preselectedProductId={preselectedRestockProduct}
      />
    </div>
  );
}
