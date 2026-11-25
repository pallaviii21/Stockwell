"use client";

import React, { useState } from "react";
import { Plus, Eye, Trash2 } from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { CreateSalesOrderModal } from "@/components/modals/CreateSalesOrderModal";
import { useSalesList } from "@/hooks/useSalesList";
import { toast } from "sonner";
import { OrderStatus, PaymentStatus, SalesOrder } from "@/types";
import { APP_STRINGS } from "@/constants/strings";

export default function SalesPage() {
  const { salesOrders, settings, updateSalesOrder, deleteSalesOrder } = useInventoryStore();

  const {
    search,
    setSearch,
    orderStatusFilter,
    setOrderStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    filteredOrders,
  } = useSalesList(salesOrders);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [orderToView, setOrderToView] = useState<SalesOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<SalesOrder | null>(null);

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
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="lg"
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Sale Order</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-sm">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
          placeholder="Search by Order ID, Customer, or item name..."
          className="max-w-md"
        />

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-36">
            <Select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>

          <div className="w-36">
            <Select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Sales Orders Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-xs font-semibold text-[#765440] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Order Date</th>
                <th className="py-3.5 px-4 text-center">Items</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-center">Payment Status</th>
                <th className="py-3.5 px-4 text-center">Order Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E2D8]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#918477]">
                    <p className="font-medium text-sm text-[#593A2C]">No sales orders found</p>
                    <p className="text-xs mt-1">Try adjusting search criteria or create a new order</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#FAF8F5]/60 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#30251F]">
                      {order.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#30251F]">{order.customerName}</div>
                      <div className="text-xs text-[#918477]">{order.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs sm:text-sm text-[#765440]">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-medium text-xs px-2 py-0.5 rounded-full bg-[#F0EBE2] text-[#593A2C]">
                        {order.items.length} items
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#30251F] text-xs sm:text-sm">
                      {formatCurrency(order.totalAmount, settings.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-block relative">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) =>
                            handlePaymentChange(order.id, e.target.value as PaymentStatus)
                          }
                          className="appearance-none cursor-pointer bg-transparent outline-none text-center"
                        >
                          <option value="paid">Paid</option>
                          <option value="partial">Partial</option>
                          <option value="unpaid">Unpaid</option>
                        </select>
                        <Badge variant={order.paymentStatus} size="sm">
                          {order.paymentStatus}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-block relative">
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          className="appearance-none cursor-pointer bg-transparent outline-none text-center"
                        >
                          <option value="completed">Completed</option>
                          <option value="pending">Pending</option>
                          <option value="draft">Draft</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <Badge variant={order.orderStatus} size="sm">
                          {order.orderStatus}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setOrderToView(order)}
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setOrderToDelete(order)}
                          title="Delete Order"
                          className="hover:text-[#B91C1C]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Order Modal */}
      <CreateSalesOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* View Order Invoice Modal */}
      {orderToView && (
        <Modal
          isOpen={Boolean(orderToView)}
          onClose={() => setOrderToView(null)}
          title={`Sales Invoice — ${orderToView.id}`}
          subtitle={`Issued on ${formatDate(orderToView.orderDate)} to ${orderToView.customerName}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-sm">
            {/* Status overview banner */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8]">
              <div>
                <span className="text-xs text-[#918477]">Order Status</span>
                <div className="mt-1">
                  <Badge variant={orderToView.orderStatus}>{orderToView.orderStatus}</Badge>
                </div>
              </div>
              <div>
                <span className="text-xs text-[#918477]">Payment Status</span>
                <div className="mt-1">
                  <Badge variant={orderToView.paymentStatus}>{orderToView.paymentStatus}</Badge>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#918477]">Total Amount</span>
                <div className="text-xl font-bold text-[#30251F] mt-0.5">
                  {formatCurrency(orderToView.totalAmount, settings.currency)}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <span className="text-xs font-semibold text-[#593A2C] mb-2 block">
                Itemized Products ({orderToView.items.length})
              </span>
              <div className="rounded-xl border border-[#E9E2D8] overflow-hidden bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FAF8F5] text-xs font-semibold text-[#765440] border-b border-[#E9E2D8]">
                    <tr>
                      <th className="p-3">Product Name</th>
                      <th className="p-3 text-center">SKU</th>
                      <th className="p-3 text-center">Quantity</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E2D8]">
                    {orderToView.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-medium text-[#30251F]">{item.productName}</td>
                        <td className="p-3 text-center font-mono text-xs text-[#918477]">
                          {item.sku}
                        </td>
                        <td className="p-3 text-center font-semibold text-[#30251F]">
                          {item.quantity}
                        </td>
                        <td className="p-3 text-right text-[#765440]">
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
            </div>

            {orderToView.notes && (
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8]">
                <span className="text-xs font-semibold text-[#593A2C]">Order Notes:</span>
                <p className="text-xs text-[#765440] mt-0.5">{orderToView.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[#E9E2D8]">
              <span className="text-xs text-[#918477]">
                Stock Deducted: {orderToView.inventoryDeducted ? "Yes (Inventory updated)" : "No"}
              </span>
              <Button variant="secondary" onClick={() => setOrderToView(null)}>
                {APP_STRINGS.COMMON.CLOSE}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(orderToDelete)}
        onClose={() => setOrderToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Sales Order"
        message={`Are you sure you want to delete order ${orderToDelete?.id}? If the order was marked Completed, the deducted inventory will automatically be restored.`}
        confirmText="Delete Order"
        isDestructive
      />
    </div>
  );
}
