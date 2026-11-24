"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useInventoryStore } from "@/store/useInventoryStore";
import { toast } from "sonner";
import { OrderItem, OrderStatus, PaymentStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, AlertCircle } from "lucide-react";

interface CreateSalesOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateSalesOrderModal: React.FC<CreateSalesOrderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { customers, products, settings, createSalesOrder } = useInventoryStore();

  const [customerId, setCustomerId] = useState(customers.length > 0 ? customers[0].id : "");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("paid");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("completed");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<OrderItem[]>([
    {
      productId: products[0]?.id || "",
      productName: products[0]?.name || "",
      sku: products[0]?.sku || "",
      quantity: 1,
      unitPrice: products[0]?.sellingPrice || 0,
      total: products[0]?.sellingPrice || 0,
    },
  ]);

  const handleProductChange = (index: number, selectedProdId: string) => {
    const prod = products.find((p) => p.id === selectedProdId);
    if (!prod) return;

    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: 1,
        unitPrice: prod.sellingPrice,
        total: prod.sellingPrice,
      };
      return updated;
    });
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const safeQty = Math.max(1, qty || 1);
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity: safeQty,
        total: safeQty * updated[index].unitPrice,
      };
      return updated;
    });
  };

  const handleUnitPriceChange = (index: number, price: number) => {
    const safePrice = Math.max(0, price || 0);
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        unitPrice: safePrice,
        total: updated[index].quantity * safePrice,
      };
      return updated;
    });
  };

  const addItemRow = () => {
    const defaultProd = products[0];
    if (!defaultProd) return;
    setItems((prev) => [
      ...prev,
      {
        productId: defaultProd.id,
        productName: defaultProd.name,
        sku: defaultProd.sku,
        quantity: 1,
        unitPrice: defaultProd.sellingPrice,
        total: defaultProd.sellingPrice,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) {
      toast.error("Sales order must contain at least one item");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = subtotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    const customer = customers.find((c) => c.id === customerId);
    if (!customer) {
      toast.error("Selected customer not found");
      return;
    }

    // Business rule validation: If order is completed, verify stock
    if (orderStatus === "completed") {
      for (const item of items) {
        const prod = products.find((p) => p.id === item.productId);
        if (!prod || prod.stockQuantity < item.quantity) {
          toast.error(
            `Insufficient stock for "${item.productName}". Available: ${
              prod?.stockQuantity ?? 0
            }, Requested: ${item.quantity}. Stock cannot be negative.`
          );
          return;
        }
      }
    }

    const res = createSalesOrder({
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      orderDate: new Date(orderDate).toISOString(),
      items,
      subtotal,
      tax: 0,
      totalAmount,
      paymentStatus,
      orderStatus,
      notes: notes.trim(),
    });

    if (res.success) {
      toast.success(`Sales Order ${res.order?.id} created successfully`);
      onClose();
    } else {
      toast.error(res.error || "Failed to create sales order");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Sales Order"
      subtitle="Issue a new invoice and track order dispatch"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        {/* Customer & Order Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8]">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">
              Customer <span className="text-red-500">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-white text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">
              Order Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-white text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">
              Order Status <span className="text-red-500">*</span>
            </label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-white text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
            >
              <option value="completed">Completed (Deducts stock immediately)</option>
              <option value="pending">Pending (Awaiting fulfillment)</option>
              <option value="draft">Draft Estimate</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">
              Payment Status <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-white text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
            >
              <option value="paid">Paid</option>
              <option value="partial">Partially Paid</option>
              <option value="unpaid">Unpaid / Invoiced</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">Notes / Instructions</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Deliver to 3rd Floor Reception"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-white text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
            />
          </div>
        </div>

        {orderStatus === "completed" && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#DCFCE7]/60 border border-[#BBF7D0] text-[#15803D] text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Marking this order as <strong>Completed</strong> will automatically deduct items from your live inventory stock and generate audit movement logs.
            </span>
          </div>
        )}

        {/* Line Items Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-[#30251F] uppercase tracking-wider">
              Ordered Products
            </span>
            <button
              type="button"
              onClick={addItemRow}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#593A2C] bg-[#F0EBE2] hover:bg-[#EAE4DC] rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line Item</span>
            </button>
          </div>

          <div className="border border-[#E9E2D8] rounded-2xl overflow-hidden bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-[11px] text-[#918477]">
                  <th className="p-3 font-semibold">Product</th>
                  <th className="p-3 font-semibold w-24">Available</th>
                  <th className="p-3 font-semibold w-24">Quantity</th>
                  <th className="p-3 font-semibold w-32">Unit Price</th>
                  <th className="p-3 font-semibold w-32 text-right">Line Total</th>
                  <th className="p-3 font-semibold w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E2D8]">
                {items.map((item, idx) => {
                  const currentProd = products.find((p) => p.id === item.productId);
                  const availableStock = currentProd ? currentProd.stockQuantity : 0;
                  const isInsufficient =
                    orderStatus === "completed" && item.quantity > availableStock;

                  return (
                    <tr key={idx} className={isInsufficient ? "bg-red-50/50" : ""}>
                      <td className="p-3">
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#E9E2D8] bg-[#FAF8F5] text-xs font-medium text-[#30251F]"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku}) — Stock: {p.stockQuantity}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-xs font-medium text-[#765440]">
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            availableStock === 0
                              ? "bg-red-100 text-red-700"
                              : availableStock < 10
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {availableStock}
                        </span>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value, 10))}
                          className={`w-20 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${
                            isInsufficient
                              ? "border-red-400 bg-red-50 text-red-700"
                              : "border-[#E9E2D8] bg-[#FAF8F5]"
                          }`}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) => handleUnitPriceChange(idx, parseFloat(e.target.value))}
                          className="w-28 px-2.5 py-1.5 rounded-lg border border-[#E9E2D8] bg-[#FAF8F5] text-xs font-medium"
                        />
                      </td>
                      <td className="p-3 text-right font-bold text-[#30251F] text-xs">
                        {formatCurrency(item.total, settings.currency)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="p-1.5 text-[#918477] hover:text-[#B91C1C] rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E9E2D8]">
          <div className="text-left">
            <span className="text-xs sm:text-sm text-[#918477]">Total Order Value:</span>
            <div className="text-[26px] sm:text-[30px] font-bold text-[#30251F]">
              {formatCurrency(totalAmount, settings.currency)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 sm:px-5 sm:py-2.5 font-medium text-[#593A2C] bg-[#F0EBE2] hover:bg-[#EAE4DC] rounded-xl transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 sm:px-6 sm:py-2.5 font-semibold text-white bg-[#593A2C] hover:bg-[#472E23] rounded-xl shadow-xs transition-colors text-sm sm:text-base"
            >
              Confirm & Save Order
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
