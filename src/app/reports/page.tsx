"use client";

import React, { useState, useMemo } from "react";
import { BarChart3, TrendingUp, Download, Calendar } from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { formatCurrency, formatDate, exportToCSV } from "@/lib/utils";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
import { APP_STRINGS } from "@/constants/strings";

type ReportTab = "sales" | "purchases" | "stock";
type DateFilter = "7days" | "30days" | "90days" | "all";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("sales");
  const [dateFilter, setDateFilter] = useState<DateFilter>("30days");

  const { products, salesOrders, purchaseOrders, settings } = useInventoryStore();

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
      pos: filtered,
      totalSpend,
      totalCount: filtered.length,
      receivedCount: received.length,
      pendingCount: pending.length,
      chartTrend,
    };
  }, [purchaseOrders, dateThreshold]);

  // C. STOCK VALUATION DATA
  const stockValuationData = useMemo(() => {
    const totalCost = products.reduce((sum, p) => sum + p.purchasePrice * p.stockQuantity, 0);
    const totalRetail = products.reduce((sum, p) => sum + p.sellingPrice * p.stockQuantity, 0);
    const potentialMargin = totalRetail - totalCost;
    const marginPercent = totalRetail > 0 ? Math.round((potentialMargin / totalRetail) * 100) : 0;

    return {
      totalCost,
      totalRetail,
      potentialMargin,
      marginPercent,
      products,
    };
  }, [products]);

  // Export handlers
  const handleExportSales = () => {
    const rows = salesData.orders.map((o) => ({
      "Order ID": o.id,
      Customer: o.customerName,
      "Order Date": o.orderDate,
      "Total Amount": o.totalAmount,
      "Payment Status": o.paymentStatus,
      "Order Status": o.orderStatus,
      Items: o.items.map((i) => `${i.productName} (${i.quantity})`).join("; "),
    }));
    exportToCSV(`Sales_Report_${dateFilter}`, rows);
  };

  const handleExportPurchases = () => {
    const rows = purchaseData.pos.map((p) => ({
      "PO Number": p.id,
      Supplier: p.supplierName,
      "Order Date": p.orderDate,
      "Expected Delivery": p.expectedDelivery,
      "Total Amount": p.totalAmount,
      Status: p.status,
      Items: p.items.map((i) => `${i.productName} (${i.quantity})`).join("; "),
    }));
    exportToCSV(`Purchase_Report_${dateFilter}`, rows);
  };

  const handleExportStock = () => {
    const rows = stockValuationData.products.map((p) => ({
      SKU: p.sku,
      "Product Name": p.name,
      Category: p.category,
      "Stock Units": p.stockQuantity,
      "Purchase Price": p.purchasePrice,
      "Selling Price": p.sellingPrice,
      "Total Cost Value": p.purchasePrice * p.stockQuantity,
      "Total Retail Value": p.sellingPrice * p.stockQuantity,
      "Margin %": Math.round(((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100),
    }));
    exportToCSV(`Stock_Valuation_Report`, rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E9E2D8]">
        <div>
          <h1 className="text-[32px] sm:text-[34px] font-bold text-[#30251F] tracking-tight leading-tight">
            Reports & Analytics
          </h1>
          <p className="text-sm sm:text-base text-[#918477] mt-1">
            Financial analytics, sales revenues, procurement spending, and inventory valuation.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center p-1 rounded-xl bg-[#F0EBE2] border border-[#E9E2D8] text-sm self-start sm:self-auto">
          <button
            onClick={() => setDateFilter("7days")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs sm:text-sm ${
              dateFilter === "7days"
                ? "bg-white text-[#593A2C] shadow-xs font-semibold"
                : "text-[#765440] hover:text-[#30251F]"
            }`}
          >
            Last 7d
          </button>
          <button
            onClick={() => setDateFilter("30days")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs sm:text-sm ${
              dateFilter === "30days"
                ? "bg-white text-[#593A2C] shadow-xs font-semibold"
                : "text-[#765440] hover:text-[#30251F]"
            }`}
          >
            Last 30d
          </button>
          <button
            onClick={() => setDateFilter("90days")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs sm:text-sm ${
              dateFilter === "90days"
                ? "bg-white text-[#593A2C] shadow-xs font-semibold"
                : "text-[#765440] hover:text-[#30251F]"
            }`}
          >
            Last 90d
          </button>
          <button
            onClick={() => setDateFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs sm:text-sm ${
              dateFilter === "all"
                ? "bg-white text-[#593A2C] shadow-xs font-semibold"
                : "text-[#765440] hover:text-[#30251F]"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Report Categories Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E9E2D8] pb-1 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("sales")}
          className={`px-4 py-2 rounded-t-xl transition-all ${
            activeTab === "sales"
              ? "bg-white text-[#593A2C] border-t border-x border-[#E9E2D8] -mb-px font-bold"
              : "text-[#765440] hover:text-[#30251F]"
          }`}
        >
          Sales Report
        </button>
        <button
          onClick={() => setActiveTab("purchases")}
          className={`px-4 py-2 rounded-t-xl transition-all ${
            activeTab === "purchases"
              ? "bg-white text-[#593A2C] border-t border-x border-[#E9E2D8] -mb-px font-bold"
              : "text-[#765440] hover:text-[#30251F]"
          }`}
        >
          Purchase Report
        </button>
        <button
          onClick={() => setActiveTab("stock")}
          className={`px-4 py-2 rounded-t-xl transition-all ${
            activeTab === "stock"
              ? "bg-white text-[#593A2C] border-t border-x border-[#E9E2D8] -mb-px font-bold"
              : "text-[#765440] hover:text-[#30251F]"
          }`}
        >
          Stock Valuation Report
        </button>
      </div>

      {/* A. SALES REPORT */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(salesData.totalRevenue, settings.currency)}
              subtitle="From completed sales"
              icon={TrendingUp}
              highlight
            />
            <MetricCard
              title="Total Orders"
              value={salesData.totalCount}
              subtitle="Issued in period"
              icon={BarChart3}
            />
            <MetricCard
              title="Completed Orders"
              value={salesData.completedCount}
              subtitle="Fulfilled & deducted"
              icon={TrendingUp}
            />
            <MetricCard
              title="Pending Orders"
              value={salesData.pendingCount}
              subtitle="Awaiting fulfillment"
              icon={Calendar}
            />
          </div>

          {/* Revenue Trend Chart */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E2D8]">
              <div>
                <h3 className="text-base font-bold text-[#30251F]">Sales Revenue Trend</h3>
                <p className="text-xs text-[#918477]">Gross sales velocity over time</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportSales}>
                <Download className="w-3.5 h-3.5 mr-1" />
                <span>Export CSV</span>
              </Button>
            </div>

            <div className="h-64 w-full">
              {salesData.chartTrend.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[#918477] text-sm">
                  No completed sales in this date range
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData.chartTrend}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#593A2C" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#593A2C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9E2D8" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#918477"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#918477"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `₹${v.toLocaleString()}`}
                    />
                    <Tooltip
                      formatter={(v: number) => [
                        formatCurrency(v, settings.currency),
                        "Completed Revenue",
                      ]}
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E9E2D8",
                        borderRadius: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#593A2C"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#salesGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* B. PURCHASE REPORT */}
      {activeTab === "purchases" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Procurement Spend"
              value={formatCurrency(purchaseData.totalSpend, settings.currency)}
              subtitle="Received merchandise"
              icon={TrendingUp}
              highlight
            />
            <MetricCard
              title="Purchase Orders"
              value={purchaseData.totalCount}
              subtitle="Total POs issued"
              icon={BarChart3}
            />
            <MetricCard
              title="Received Orders"
              value={purchaseData.receivedCount}
              subtitle="Added to inventory"
              icon={TrendingUp}
            />
            <MetricCard
              title="Pending Shipments"
              value={purchaseData.pendingCount}
              subtitle="In transit / ordered"
              icon={Calendar}
            />
          </div>

          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E2D8]">
              <div>
                <h3 className="text-base font-bold text-[#30251F]">Procurement Spending Trend</h3>
                <p className="text-xs text-[#918477]">Supplier spend distribution</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportPurchases}>
                <Download className="w-3.5 h-3.5 mr-1" />
                <span>Export CSV</span>
              </Button>
            </div>

            <div className="h-64 w-full">
              {purchaseData.chartTrend.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[#918477] text-sm">
                  No purchases recorded in this date range
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={purchaseData.chartTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9E2D8" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#918477"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#918477"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `₹${v.toLocaleString()}`}
                    />
                    <Tooltip
                      formatter={(v: number) => [
                        formatCurrency(v, settings.currency),
                        "Procurement Spend",
                      ]}
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E9E2D8",
                        borderRadius: "12px",
                      }}
                    />
                    <Bar dataKey="spend" fill="#765440" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* C. STOCK VALUATION REPORT */}
      {activeTab === "stock" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Inventory Asset Value"
              value={formatCurrency(stockValuationData.totalCost, settings.currency)}
              subtitle="Wholesale asset cost"
              icon={TrendingUp}
              highlight
            />
            <MetricCard
              title="Potential Retail Value"
              value={formatCurrency(stockValuationData.totalRetail, settings.currency)}
              subtitle="At current retail pricing"
              icon={TrendingUp}
            />
            <MetricCard
              title="Unrealized Margin"
              value={formatCurrency(stockValuationData.potentialMargin, settings.currency)}
              subtitle="Potential gross profit"
              icon={TrendingUp}
            />
            <MetricCard
              title="Average Gross Margin"
              value={`${stockValuationData.marginPercent}%`}
              subtitle="Portfolio profitability"
              icon={BarChart3}
            />
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-[#E9E2D8] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#30251F]">Catalogue Valuation Matrix</h3>
                <p className="text-xs text-[#918477]">Product-by-product margin and capital breakdown</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportStock}>
                <Download className="w-3.5 h-3.5 mr-1" />
                <span>Export CSV</span>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-xs font-semibold text-[#765440] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Product & SKU</th>
                    <th className="py-3 px-4 text-center">Available Units</th>
                    <th className="py-3 px-4 text-right">Cost Price</th>
                    <th className="py-3 px-4 text-right">Selling Price</th>
                    <th className="py-3 px-4 text-right">Asset Cost</th>
                    <th className="py-3 px-4 text-right">Retail Potential</th>
                    <th className="py-3 px-4 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E2D8]">
                  {stockValuationData.products.map((p) => {
                    const costVal = p.purchasePrice * p.stockQuantity;
                    const retailVal = p.sellingPrice * p.stockQuantity;
                    const margin = Math.round(
                      ((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100
                    );

                    return (
                      <tr key={p.id} className="hover:bg-[#FAF8F5]/50">
                        <td className="py-3 px-4 font-semibold text-[#30251F]">
                          <div>{p.name}</div>
                          <div className="text-xs text-[#918477] font-mono">{p.sku}</div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-[#30251F]">
                          {p.stockQuantity}
                        </td>
                        <td className="py-3 px-4 text-right text-xs text-[#918477]">
                          {formatCurrency(p.purchasePrice, settings.currency)}
                        </td>
                        <td className="py-3 px-4 text-right text-xs text-[#765440]">
                          {formatCurrency(p.sellingPrice, settings.currency)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-[#765440] text-xs sm:text-sm">
                          {formatCurrency(costVal, settings.currency)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[#30251F] text-xs sm:text-sm">
                          {formatCurrency(retailVal, settings.currency)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-xs sm:text-sm text-[#2E6930]">
                          {margin}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
