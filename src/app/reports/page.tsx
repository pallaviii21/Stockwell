"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  Truck,
  ShoppingCart,
  FileSpreadsheet,
} from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { formatCurrency, formatDate, exportToCSV } from "@/lib/utils";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ReportTab = "sales" | "purchases" | "stock";
type DateFilter = "7days" | "30days" | "90days" | "all";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("sales");
  const [dateFilter, setDateFilter] = useState<DateFilter>("30days");

  const { products, salesOrders, purchaseOrders, settings } = useInventoryStore();

  // Helper date threshold
  const dateThreshold = useMemo(() => {
    if (dateFilter === "all") return null;
    const d = new Date();
    if (dateFilter === "7days") d.setDate(d.getDate() - 7);
    if (dateFilter === "30days") d.setDate(d.getDate() - 30);
    if (dateFilter === "90days") d.setDate(d.getDate() - 90);
    return d;
  }, [dateFilter]);

  // A. SALES REPORT DATA
  const salesData = useMemo(() => {
    const filtered = salesOrders.filter((o) => {
      if (!dateThreshold) return true;
      return new Date(o.orderDate) >= dateThreshold;
    });

    const completed = filtered.filter((o) => o.orderStatus === "completed");
    const pending = filtered.filter((o) => o.orderStatus === "pending");
    const totalRevenue = completed.reduce((sum, o) => sum + o.totalAmount, 0);

    // Chart trend by date
    const dateMap: Record<string, number> = {};
    completed.forEach((o) => {
      const key = formatDate(o.orderDate);
      dateMap[key] = (dateMap[key] || 0) + o.totalAmount;
    });

    const chartTrend = Object.entries(dateMap).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    return {
      orders: filtered,
      totalRevenue,
      totalCount: filtered.length,
      completedCount: completed.length,
      pendingCount: pending.length,
      chartTrend,
    };
  }, [salesOrders, dateThreshold]);

  // B. PURCHASE REPORT DATA
  const purchaseData = useMemo(() => {
    const filtered = purchaseOrders.filter((p) => {
      if (!dateThreshold) return true;
      return new Date(p.orderDate) >= dateThreshold;
    });

    const received = filtered.filter((p) => p.status === "received");
    const pending = filtered.filter((p) => p.status === "pending" || p.status === "ordered");
    const totalSpend = received.reduce((sum, p) => sum + p.totalAmount, 0);

    const dateMap: Record<string, number> = {};
    filtered.forEach((p) => {
      const key = formatDate(p.orderDate);
      dateMap[key] = (dateMap[key] || 0) + p.totalAmount;
    });

    const chartTrend = Object.entries(dateMap).map(([date, spend]) => ({
      date,
      spend,
    }));

    return {
      orders: filtered,
      totalSpend,
      totalCount: filtered.length,
      receivedCount: received.length,
      pendingCount: pending.length,
      chartTrend,
    };
  }, [purchaseOrders, dateThreshold]);

  // C. STOCK VALUATION REPORT DATA
  const stockData = useMemo(() => {
    const totalCostValue = products.reduce(
      (sum, p) => sum + p.stockQuantity * p.purchasePrice,
      0
    );
    const totalRetailValue = products.reduce(
      (sum, p) => sum + p.stockQuantity * p.sellingPrice,
      0
    );
    const lowStockCount = products.filter(
      (p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel
    ).length;
    const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;

    const items = products.map((p) => {
      const costVal = p.stockQuantity * p.purchasePrice;
      const retailVal = p.stockQuantity * p.sellingPrice;
      const margin =
        p.sellingPrice > 0
          ? (((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100).toFixed(1)
          : "0.0";

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        stockQuantity: p.stockQuantity,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        costValue: costVal,
        retailValue: retailVal,
        margin: `${margin}%`,
      };
    });

    return {
      totalCostValue,
      totalRetailValue,
      lowStockCount,
      outOfStockCount,
      items,
    };
  }, [products]);

  // CSV EXPORT HANDLERS
  const exportSalesReport = () => {
    const rows = salesData.orders.map((o) => ({
      "Order ID": o.id,
      "Customer Name": o.customerName,
      "Customer Email": o.customerEmail,
      Date: formatDate(o.orderDate),
      "Total Items": o.items.reduce((s, i) => s + i.quantity, 0),
      "Total Amount (INR)": o.totalAmount,
      "Order Status": o.orderStatus,
      "Payment Status": o.paymentStatus,
    }));
    exportToCSV(`Stockwell_Sales_Report_${dateFilter}`, rows);
  };

  const exportPurchasesReport = () => {
    const rows = purchaseData.orders.map((p) => ({
      "PO Number": p.id,
      Supplier: p.supplierName,
      Date: formatDate(p.orderDate),
      "Expected Delivery": formatDate(p.expectedDelivery),
      "Total Items": p.items.reduce((s, i) => s + i.quantity, 0),
      "Total Amount (INR)": p.totalAmount,
      Status: p.status,
    }));
    exportToCSV(`Stockwell_Purchase_Report_${dateFilter}`, rows);
  };

  const exportStockReport = () => {
    const rows = stockData.items.map((i) => ({
      "Product Name": i.name,
      SKU: i.sku,
      Category: i.category,
      "Units Available": i.stockQuantity,
      "Cost Price": i.purchasePrice,
      "Selling Price": i.sellingPrice,
      "Total Cost Valuation": i.costValue,
      "Potential Retail Value": i.retailValue,
      "Profit Margin": i.margin,
    }));
    exportToCSV("Stockwell_Inventory_Valuation_Report", rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E9E2D8]">
        <div>
          <h1 className="text-[32px] sm:text-[34px] font-bold text-[#30251F] tracking-tight leading-tight">
            Business Reports
          </h1>
          <p className="text-sm sm:text-base text-[#918477] mt-1">
            Analyze sales performance, supplier procurement, and warehouse inventory valuation.
          </p>
        </div>

        {/* Global Date Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-[#F0EBE2] border border-[#E9E2D8] text-sm">
            <button
              onClick={() => setDateFilter("7days")}
              className={`px-3.5 py-2 rounded-lg font-medium transition-all text-sm ${
                dateFilter === "7days"
                  ? "bg-white text-[#593A2C] shadow-xs font-semibold"
                  : "text-[#765440] hover:text-[#30251F]"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateFilter("30days")}
              className={`px-3.5 py-2 rounded-lg font-medium transition-all text-sm ${
                dateFilter === "30days"
                  ? "bg-white text-[#593A2C] shadow-xs font-semibold"
                  : "text-[#765440] hover:text-[#30251F]"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateFilter("90days")}
              className={`px-3.5 py-2 rounded-lg font-medium transition-all text-sm ${
                dateFilter === "90days"
                  ? "bg-white text-[#593A2C] shadow-xs font-semibold"
                  : "text-[#765440] hover:text-[#30251F]"
              }`}
            >
              90 Days
            </button>
            <button
              onClick={() => setDateFilter("all")}
              className={`px-3.5 py-2 rounded-lg font-medium transition-all text-sm ${
                dateFilter === "all"
                  ? "bg-white text-[#593A2C] shadow-xs font-semibold"
                  : "text-[#765440] hover:text-[#30251F]"
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* THREE REPORT CATEGORY TABS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#E9E2D8] pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("sales")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "sales"
                ? "bg-[#593A2C] text-white shadow-xs"
                : "text-[#765440] hover:text-[#30251F] hover:bg-[#F0EBE2]"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Sales Report</span>
          </button>
          <button
            onClick={() => setActiveTab("purchases")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "purchases"
                ? "bg-[#593A2C] text-white shadow-xs"
                : "text-[#765440] hover:text-[#30251F] hover:bg-[#F0EBE2]"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Purchase Report</span>
          </button>
          <button
            onClick={() => setActiveTab("stock")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "stock"
                ? "bg-[#593A2C] text-white shadow-xs"
                : "text-[#765440] hover:text-[#30251F] hover:bg-[#F0EBE2]"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Stock Valuation Report</span>
          </button>
        </div>

        {/* CSV Export Button for active tab */}
        <button
          onClick={
            activeTab === "sales"
              ? exportSalesReport
              : activeTab === "purchases"
              ? exportPurchasesReport
              : exportStockReport
          }
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E9E2D8] bg-white hover:bg-[#FAF8F5] text-sm font-semibold text-[#593A2C] shadow-xs transition-colors self-end sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB A: SALES REPORT */}
      {/* ============================================================== */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(salesData.totalRevenue, settings.currency)}
              subtitle="Completed customer orders"
              icon={TrendingUp}
            />
            <MetricCard
              title="Number of Sales"
              value={salesData.totalCount}
              subtitle="Total transactions recorded"
              icon={ShoppingCart}
            />
            <MetricCard
              title="Completed Orders"
              value={salesData.completedCount}
              subtitle="Stock deducted & fulfilled"
              icon={TrendingUp}
              trend={{ value: `${salesData.completedCount} fulfilled`, isPositive: true }}
            />
            <MetricCard
              title="Pending Orders"
              value={salesData.pendingCount}
              subtitle="Awaiting fulfillment"
              icon={Calendar}
              trend={{ value: `${salesData.pendingCount} pending`, isPositive: false }}
            />
          </div>

          {/* Sales Trend Chart */}
          <div className="p-5 rounded-2xl bg-white border border-[#E9E2D8] shadow-sm">
            <h3 className="text-sm font-semibold text-[#30251F] mb-1">Sales Trend</h3>
            <p className="text-xs text-[#918477] mb-4">Revenue over time for selected period</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={salesData.chartTrend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="salesTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#593A2C" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#593A2C" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9E2D8" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={{ stroke: "#E9E2D8" }}
                    tick={{ fill: "#918477", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: "#E9E2D8" }}
                    tick={{ fill: "#918477", fontSize: 11 }}
                    tickFormatter={(v) => `₹${v > 999 ? `${v / 1000}k` : v}`}
                  />
                  <Tooltip
                    formatter={(val: number) => [
                      formatCurrency(val, settings.currency),
                      "Revenue",
                    ]}
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E9E2D8",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#593A2C"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#salesTrendGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Sales Table */}
          <div className="rounded-2xl border border-[#E9E2D8] bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E9E2D8] bg-[#FAF8F5]">
              <h3 className="text-xs font-semibold text-[#30251F]">Sales Orders Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-[11px] text-[#918477]">
                    <th className="py-2.5 px-4 font-semibold">Order ID</th>
                    <th className="py-2.5 px-4 font-semibold">Customer</th>
                    <th className="py-2.5 px-4 font-semibold">Date</th>
                    <th className="py-2.5 px-4 font-semibold">Order Status</th>
                    <th className="py-2.5 px-4 font-semibold">Payment Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E2D8]">
                  {salesData.orders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#593A2C]">{o.id}</td>
                      <td className="py-3 px-4 font-medium text-[#30251F]">{o.customerName}</td>
                      <td className="py-3 px-4 text-[#765440]">{formatDate(o.orderDate)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={o.orderStatus} size="sm">
                          {o.orderStatus.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={o.paymentStatus} size="sm">
                          {o.paymentStatus.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#30251F]">
                        {formatCurrency(o.totalAmount, settings.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB B: PURCHASE REPORT */}
      {/* ============================================================== */}
      {activeTab === "purchases" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Purchase Value"
              value={formatCurrency(purchaseData.totalSpend, settings.currency)}
              subtitle="Received supplier inventory"
              icon={Truck}
            />
            <MetricCard
              title="Total POs Issued"
              value={purchaseData.totalCount}
              subtitle="Procurement orders"
              icon={FileSpreadsheet}
            />
            <MetricCard
              title="Received Orders"
              value={purchaseData.receivedCount}
              subtitle="Goods delivered to warehouse"
              icon={Truck}
              trend={{ value: `${purchaseData.receivedCount} received`, isPositive: true }}
            />
            <MetricCard
              title="Pending Inbound"
              value={purchaseData.pendingCount}
              subtitle="Orders in transit or ordered"
              icon={Calendar}
            />
          </div>

          {/* Purchase Trend Bar Chart */}
          <div className="p-5 rounded-2xl bg-white border border-[#E9E2D8] shadow-sm">
            <h3 className="text-sm font-semibold text-[#30251F] mb-1">Procurement Spending</h3>
            <p className="text-xs text-[#918477] mb-4">Capital allocated to restocking</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={purchaseData.chartTrend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9E2D8" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={{ stroke: "#E9E2D8" }}
                    tick={{ fill: "#918477", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: "#E9E2D8" }}
                    tick={{ fill: "#918477", fontSize: 11 }}
                    tickFormatter={(v) => `₹${v > 999 ? `${v / 1000}k` : v}`}
                  />
                  <Tooltip
                    formatter={(val: number) => [
                      formatCurrency(val, settings.currency),
                      "Procurement Spend",
                    ]}
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E9E2D8",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="spend" fill="#765440" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Purchases Table */}
          <div className="rounded-2xl border border-[#E9E2D8] bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E9E2D8] bg-[#FAF8F5]">
              <h3 className="text-xs font-semibold text-[#30251F]">Purchase Orders Log</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-[11px] text-[#918477]">
                    <th className="py-2.5 px-4 font-semibold">PO Number</th>
                    <th className="py-2.5 px-4 font-semibold">Supplier</th>
                    <th className="py-2.5 px-4 font-semibold">Order Date</th>
                    <th className="py-2.5 px-4 font-semibold">Expected Delivery</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E2D8]">
                  {purchaseData.orders.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#593A2C]">{p.id}</td>
                      <td className="py-3 px-4 font-medium text-[#30251F]">{p.supplierName}</td>
                      <td className="py-3 px-4 text-[#765440]">{formatDate(p.orderDate)}</td>
                      <td className="py-3 px-4 text-[#918477]">
                        {formatDate(p.expectedDelivery)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={p.status} size="sm">
                          {p.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#30251F]">
                        {formatCurrency(p.totalAmount, settings.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB C: STOCK VALUATION REPORT */}
      {/* ============================================================== */}
      {activeTab === "stock" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Cost Value"
              value={formatCurrency(stockData.totalCostValue, settings.currency)}
              subtitle="Warehouse cost valuation"
              icon={Layers}
            />
            <MetricCard
              title="Potential Retail Value"
              value={formatCurrency(stockData.totalRetailValue, settings.currency)}
              subtitle="At retail catalogue price"
              icon={TrendingUp}
              trend={{
                value: `+${formatCurrency(
                  stockData.totalRetailValue - stockData.totalCostValue,
                  settings.currency
                )} margin`,
                isPositive: true,
              }}
            />
            <MetricCard
              title="Low Stock Products"
              value={stockData.lowStockCount}
              subtitle="Require immediate reorder"
              icon={Calendar}
              trend={{ value: `${stockData.lowStockCount} low`, isPositive: false }}
            />
            <MetricCard
              title="Out of Stock Products"
              value={stockData.outOfStockCount}
              subtitle="Zero inventory remaining"
              icon={Calendar}
              highlight={stockData.outOfStockCount > 0}
            />
          </div>

          {/* Product-wise Inventory Table */}
          <div className="rounded-2xl border border-[#E9E2D8] bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E9E2D8] bg-[#FAF8F5] flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#30251F]">
                Product-wise Valuation Breakdown
              </h3>
              <span className="text-[11px] text-[#918477]">
                Calculated dynamically from real inventory
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-[11px] text-[#918477]">
                    <th className="py-2.5 px-4 font-semibold">Product Name</th>
                    <th className="py-2.5 px-4 font-semibold">SKU</th>
                    <th className="py-2.5 px-4 font-semibold">Category</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Available Units</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Unit Cost</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Selling Price</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Total Cost Value</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Potential Revenue</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Gross Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E2D8]">
                  {stockData.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-4 font-medium text-[#30251F]">{item.name}</td>
                      <td className="py-3 px-4 font-mono font-medium text-[#765440]">{item.sku}</td>
                      <td className="py-3 px-4 text-[#918477]">{item.category}</td>
                      <td className="py-3 px-4 text-center font-bold text-[#30251F]">
                        {item.stockQuantity}
                      </td>
                      <td className="py-3 px-4 text-right text-[#918477]">
                        {formatCurrency(item.purchasePrice, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-[#30251F]">
                        {formatCurrency(item.sellingPrice, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#593A2C]">
                        {formatCurrency(item.costValue, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#2E6930]">
                        {formatCurrency(item.retailValue, settings.currency)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-[#EBF5ED] text-[#2E6930] font-semibold text-[11px]">
                          {item.margin}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
