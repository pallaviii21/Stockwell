"use client";

import React, { useState, useMemo } from "react";
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { CreateSalesOrderModal } from "@/components/modals/CreateSalesOrderModal";
import { toast } from "sonner";
import { OrderStatus, PaymentStatus, SalesOrder } from "@/types";

export default function SalesPage() {
  const { salesOrders, settings, updateSalesOrder, deleteSalesOrder } = useInventoryStore();

  const [search, setSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [orderToView, setOrderToView] = useState<SalesOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<SalesOrder | null>(null);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return salesOrders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.items.some((item) => item.productName.toLowerCase().includes(search.toLowerCase()));

      const matchesOrderStatus =
        orderStatusFilter === "all" || order.orderStatus === orderStatusFilter;

      const matchesPaymentStatus =
        paymentStatusFilter === "all" || order.paymentStatus === paymentStatusFilter;

      return matchesSearch && matchesOrderStatus && matchesPaymentStatus;
    });
  }, [salesOrders, search, orderStatusFilter, paymentStatusFilter]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const res = updateSalesOrder(orderId, { orderStatus: newStatus });
    if (res.success) {
      toast.success(`Order ${orderId} status changed to ${newStatus}`);
    } else {
      toast.error(res.error || "Failed to update order status");
    }
  };

  const handlePaymentChange = (orderId: string, newPayment: PaymentStatus) => {
    const res = updateSalesOrder(orderId, { paymentStatus: newPayment });
    if (res.success) {
      toast.success(`Payment status updated to ${newPayment}`);
    }
  };

  const handleDeleteConfirm = () => {
    if (!orderToDelete) return;
    const res = deleteSalesOrder(orderToDelete.id);
    if (res.success) {
      toast.success(`Order ${orderToDelete.id} deleted`);
      setOrderToDelete(null);
    } else {
      toast.error(res.error || "Failed to delete order");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E9E2D8]">
        <div>
          <h1 className="text-[32px] sm:text-[34px] font-bold text-[#30251F] tracking-tight leading-tight">
            Sales Orders
          </h1>
          <p className="text-sm sm:text-base text-[#918477] mt-1">
            Track customer orders, invoice payments, and automated stock deductions.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#593A2C] hover:bg-[#472E23] text-white text-sm sm:text-base font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Sale Order</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E9E2D8] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#A78B73] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, Customer, or item..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] placeholder-[#918477] focus:border-[#593A2C] focus:bg-white outline-none transition-colors text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {/* Order Status */}
          <select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
          >
            <option value="all">All Order Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Payment Status */}
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Sales Orders Table */}
      <div className="rounded-2xl border border-[#E9E2D8] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-xs sm:text-sm text-[#918477]">
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Order Date</th>
                <th className="py-3 px-4 font-semibold">Items</th>
                <th className="py-3 px-4 font-semibold">Total Amount</th>
                <th className="py-3 px-4 font-semibold">Payment</th>
                <th className="py-3 px-4 font-semibold">Fulfillment</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E2D8] text-sm sm:text-base">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#918477]">
                    <ShoppingCart className="w-8 h-8 text-[#A78B73] mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-sm text-[#30251F]">No sales orders found</p>
                    <p className="text-xs mt-1">Create a new sale order to record transactions.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  const itemsSummary = order.items
                    .map((item) => `${item.productName} (x${item.quantity})`)
                    .join(", ");

                  return (
                    <tr key={order.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#593A2C]">
                        {order.id}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#30251F]">
                        <span className="block font-semibold">{order.customerName}</span>
                        <span className="text-[11px] text-[#918477]">{order.customerEmail}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#765440]">{formatDate(order.orderDate)}</td>
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <span className="text-[11px] font-medium text-[#30251F] block truncate">
                          {itemsSummary}
                        </span>
                        <span className="text-[10px] text-[#918477]">
                          {itemCount} {itemCount === 1 ? "unit" : "units"} across {order.items.length}{" "}
                          {order.items.length === 1 ? "line" : "lines"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#30251F] text-sm">
                        {formatCurrency(order.totalAmount, settings.currency)}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) =>
                            handlePaymentChange(order.id, e.target.value as PaymentStatus)
                          }
                          className="px-2 py-0.5 rounded-lg border border-[#E9E2D8] bg-[#FAF8F5] text-xs font-medium cursor-pointer"
                        >
                          <option value="paid">Paid</option>
                          <option value="partial">Partial</option>
                          <option value="unpaid">Unpaid</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          className={`px-2 py-0.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                            order.orderStatus === "completed"
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                              : order.orderStatus === "pending"
                              ? "bg-amber-50 border-amber-300 text-amber-800"
                              : order.orderStatus === "draft"
                              ? "bg-zinc-100 border-zinc-300 text-zinc-700"
                              : "bg-red-50 border-red-300 text-red-700"
                          }`}
                        >
                          <option value="completed">Completed</option>
                          <option value="pending">Pending</option>
                          <option value="draft">Draft</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setOrderToView(order)}
                            className="p-1.5 text-[#918477] hover:text-[#593A2C] hover:bg-[#F0EBE2] rounded-lg transition-colors"
                            title="View Invoice & Items"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setOrderToDelete(order)}
                            className="p-1.5 text-[#918477] hover:text-[#B91C1C] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#E9E2D8] flex items-center justify-between text-xs text-[#918477]">
          <span>
            Total: <strong>{filteredOrders.length}</strong> orders (
            <strong>
              {formatCurrency(
                filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0),
                settings.currency
              )}
            </strong>{" "}
            value)
          </span>
          <span className="font-mono text-[11px]">Real-time synchronization enabled</span>
        </div>
      </div>

      {/* VIEW ORDER INVOICE MODAL */}
      {orderToView && (
        <Modal
          isOpen={Boolean(orderToView)}
          onClose={() => setOrderToView(null)}
          title={`Order Invoice — ${orderToView.id}`}
          subtitle={`Placed on ${formatDate(orderToView.orderDate)} for ${orderToView.customerName}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Meta banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8]">
              <div>
                <span className="text-[#918477] block text-[11px]">Customer</span>
                <span className="font-semibold text-[#30251F]">{orderToView.customerName}</span>
                <span className="text-[10px] text-[#918477] block">{orderToView.customerEmail}</span>
              </div>
              <div>
                <span className="text-[#918477] block text-[11px]">Order Status</span>
                <Badge variant={orderToView.orderStatus} size="sm">
                  {orderToView.orderStatus.toUpperCase()}
                </Badge>
              </div>
              <div>
                <span className="text-[#918477] block text-[11px]">Payment Status</span>
                <Badge variant={orderToView.paymentStatus} size="sm">
                  {orderToView.paymentStatus.toUpperCase()}
                </Badge>
              </div>
              <div>
                <span className="text-[#918477] block text-[11px]">Stock Status</span>
                <span
                  className={`font-semibold ${
                    orderToView.inventoryDeducted ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {orderToView.inventoryDeducted ? "Deducted from Stock" : "Pending Deduction"}
                </span>
              </div>
            </div>

            {/* Items table */}
            <div className="border border-[#E9E2D8] rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-[11px] text-[#918477]">
                    <th className="p-3 font-semibold">Item & SKU</th>
                    <th className="p-3 font-semibold text-center">Quantity</th>
                    <th className="p-3 font-semibold text-right">Unit Price</th>
                    <th className="p-3 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E2D8]">
                  {orderToView.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-medium text-[#30251F]">
                        <span>{item.productName}</span>
                        <span className="text-[10px] font-mono text-[#918477] block">
                          SKU: {item.sku}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-[#765440]">{item.quantity}</td>
                      <td className="p-3 text-right text-[#918477]">
                        {formatCurrency(item.unitPrice, settings.currency)}
                      </td>
                      <td className="p-3 text-right font-bold text-[#30251F]">
                        {formatCurrency(item.total, settings.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total breakdown */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#918477] block">Notes:</span>
                <p className="text-[#30251F] text-xs">
                  {orderToView.notes || "No special instructions provided."}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#918477] block">Invoice Grand Total</span>
                <span className="text-xl font-bold text-[#2E6930]">
                  {formatCurrency(orderToView.totalAmount, settings.currency)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setOrderToView(null)}
                className="px-4 py-2 rounded-xl bg-[#593A2C] text-white font-medium hover:bg-[#472E23] transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE SALE ORDER MODAL */}
      <CreateSalesOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(orderToDelete)}
        onClose={() => setOrderToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Sales Order"
        message={`Are you sure you want to delete order "${orderToDelete?.id}" for ${orderToDelete?.customerName}? If completed, the deducted inventory units will be automatically restored.`}
        confirmText="Delete Order"
        isDestructive={true}
      />
    </div>
  );
}
