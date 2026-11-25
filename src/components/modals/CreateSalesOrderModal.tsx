"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useOrderItemsManager } from "@/hooks/useOrderItemsManager";
import { toast } from "sonner";
import { OrderStatus, PaymentStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { APP_STRINGS } from "@/constants/strings";

interface CreateSalesOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateSalesOrderModal: React.FC<CreateSalesOrderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { customers, products, settings, createSalesOrder } = useInventoryStore();

  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("paid");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("completed");
  const [notes, setNotes] = useState("");

  const {
    items,
    subtotal,
    handleProductChange,
    handleQuantityChange,
    handleRateChange,
    addItemRow,
    removeItemRow,
    resetItems,
  } = useOrderItemsManager(products, "sellingPrice");

  // Verify stock sufficiency for completed orders
  const stockErrors = items
    .map((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      if (p && item.quantity > p.stockQuantity && orderStatus === "completed") {
        return `"${item.productName}" only has ${p.stockQuantity} in stock (requested: ${item.quantity})`;
      }
      return null;
    })
    .filter(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCustomer = customers.find((c) => c.id === customerId);
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    if (stockErrors.length > 0 && orderStatus === "completed") {
      toast.error("Cannot complete order: Insufficient stock available");
      return;
    }

    const orderItems = items.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      sku: i.sku,
      quantity: i.quantity,
      unitPrice: i.rate,
      total: i.total,
    }));

    const result = createSalesOrder({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerEmail: selectedCustomer.email,
      orderDate,
      items: orderItems,
      subtotal,
      tax: 0,
      totalAmount: subtotal,
      paymentStatus,
      orderStatus,
      notes: notes.trim(),
    });

    if (result.success) {
      toast.success(
        orderStatus === "completed"
          ? "Sales order completed & stock deducted successfully!"
          : "Sales order created successfully!"
      );
      resetItems();
      setNotes("");
      onClose();
    } else {
      toast.error(result.error || "Failed to create sales order");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Sales Order"
      subtitle="Generate customer sales invoice and automatically update warehouse stock"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <Select
              label="Select Customer *"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.company}
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="Order Date"
            type="date"
            required
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
          />

          <Select
            label="Payment Status"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
          >
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </Select>
        </div>

        {/* Order Status Selector */}
        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs sm:text-sm font-semibold text-[#593A2C]">
                Fulfillment Status
              </span>
              <p className="text-xs text-[#918477]">
                &quot;Completed&quot; status validates and reduces warehouse stock immediately.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOrderStatus("completed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  orderStatus === "completed"
                    ? "bg-[#EBF5ED] text-[#2E6930] border border-[#C3E3C8]"
                    : "bg-white text-[#765440] border border-[#E9E2D8]"
                }`}
              >
                Completed (Deduct Stock)
              </button>
              <button
                type="button"
                onClick={() => setOrderStatus("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  orderStatus === "pending"
                    ? "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] font-semibold"
                    : "bg-white text-[#765440] border border-[#E9E2D8]"
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => setOrderStatus("draft")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  orderStatus === "draft"
                    ? "bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB] font-semibold"
                    : "bg-white text-[#765440] border border-[#E9E2D8]"
                }`}
              >
                Draft
              </button>
            </div>
          </div>
        </div>

        {/* Stock warning banner if insufficient */}
        {stockErrors.length > 0 && orderStatus === "completed" && (
          <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#B91C1C]">
              <AlertCircle className="w-4 h-4" />
              <span>Insufficient Stock Warning:</span>
            </div>
            <ul className="list-disc list-inside text-xs text-[#B91C1C] pl-2 space-y-0.5">
              {stockErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Line Items Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-[#593A2C]">
              Order Items ({items.length})
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={addItemRow}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Item</span>
            </Button>
          </div>

          <div className="rounded-xl border border-[#E9E2D8] overflow-hidden bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F5] text-xs font-semibold text-[#765440] border-b border-[#E9E2D8]">
                <tr>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 w-28 text-center">Quantity</th>
                  <th className="py-2.5 px-3 w-32 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 w-32 text-right">Total</th>
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E2D8]">
                {items.map((item, idx) => {
                  const prod = products.find((p) => p.id === item.productId);
                  const isStockInsufficient =
                    prod && item.quantity > prod.stockQuantity && orderStatus === "completed";

                  return (
                    <tr
                      key={idx}
                      className={isStockInsufficient ? "bg-[#FEF2F2]" : "hover:bg-[#FAF8F5]/50"}
                    >
                      <td className="p-2.5">
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#E9E2D8] bg-[#FAF8F5] text-xs sm:text-sm text-[#30251F] focus:border-[#593A2C] outline-none"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku}) — In Stock: {p.stockQuantity}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value, 10))}
                          className={`w-full px-2 py-1.5 text-center rounded-lg border text-xs sm:text-sm focus:border-[#593A2C] outline-none ${
                            isStockInsufficient
                              ? "border-[#B91C1C] bg-[#FEE2E2] text-[#B91C1C] font-bold"
                              : "border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F]"
                          }`}
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => handleRateChange(idx, parseFloat(e.target.value))}
                          className="w-full px-2 py-1.5 text-right rounded-lg border border-[#E9E2D8] bg-[#FAF8F5] text-xs sm:text-sm text-[#30251F] focus:border-[#593A2C] outline-none"
                        />
                      </td>
                      <td className="p-2.5 text-right font-semibold text-[#30251F] text-xs sm:text-sm">
                        {formatCurrency(item.total, settings.currency)}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          disabled={items.length <= 1}
                          className="p-1 text-[#918477] hover:text-[#B91C1C] disabled:opacity-30 rounded-md transition-colors"
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

        {/* Notes and Grand Total */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#E9E2D8]">
          <div className="flex-1 max-w-sm">
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Delivery instructions, PO reference, terms..."
            />
          </div>

          <div className="text-right space-y-1">
            <span className="text-xs text-[#918477]">Order Total Amount</span>
            <div className="text-2xl font-bold text-[#30251F]">
              {formatCurrency(subtotal, settings.currency)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E2D8]">
          <Button variant="secondary" onClick={onClose}>
            {APP_STRINGS.COMMON.CANCEL}
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={stockErrors.length > 0 && orderStatus === "completed"}
          >
            Create Sales Order
          </Button>
        </div>
      </form>
    </Modal>
  );
};
