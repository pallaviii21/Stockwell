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
import { PurchaseStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { APP_STRINGS } from "@/constants/strings";

interface CreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePurchaseOrderModal: React.FC<CreatePurchaseOrderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { suppliers, products, settings, createPurchaseOrder } = useInventoryStore();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || "");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedDelivery, setExpectedDelivery] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<PurchaseStatus>("received");
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
  } = useOrderItemsManager(products, "purchasePrice");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedSupplier = suppliers.find((s) => s.id === supplierId);
    if (!selectedSupplier) {
      toast.error("Please select a valid supplier");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    const orderItems = items.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      sku: i.sku,
      quantity: i.quantity,
      unitCost: i.rate,
      total: i.total,
    }));

    createPurchaseOrder({
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      orderDate,
      expectedDelivery,
      items: orderItems,
      totalAmount: subtotal,
      status,
      notes: notes.trim(),
    });

    toast.success(
      status === "received"
        ? `Purchase Order created & warehouse stock replenished!`
        : `Purchase Order created with status: ${status}`
    );

    resetItems();
    setNotes("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Purchase Order"
      subtitle="Issue a procurement order to restock warehouse inventory from suppliers"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <Select
              label="Select Supplier *"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.company}
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

          <Input
            label="Expected Delivery"
            type="date"
            required
            value={expectedDelivery}
            onChange={(e) => setExpectedDelivery(e.target.value)}
          />
        </div>

        {/* PO Status Selector */}
        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs sm:text-sm font-semibold text-[#593A2C]">
                Initial Order Status
              </span>
              <p className="text-xs text-[#918477]">
                Selecting &quot;Received&quot; will automatically add units into stock immediately.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatus("received")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  status === "received"
                    ? "bg-[#EBF5ED] text-[#2E6930] border border-[#C3E3C8]"
                    : "bg-white text-[#765440] border border-[#E9E2D8]"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Received</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus("ordered")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  status === "ordered"
                    ? "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] font-semibold"
                    : "bg-white text-[#765440] border border-[#E9E2D8]"
                }`}
              >
                Ordered
              </button>
              <button
                type="button"
                onClick={() => setStatus("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  status === "pending"
                    ? "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] font-semibold"
                    : "bg-white text-[#765440] border border-[#E9E2D8]"
                }`}
              >
                Pending
              </button>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-[#593A2C]">
              Procurement Items ({items.length})
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
                  <th className="py-2.5 px-3 w-32 text-right">Unit Cost</th>
                  <th className="py-2.5 px-3 w-32 text-right">Total</th>
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E2D8]">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF8F5]/50">
                    <td className="p-2.5">
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#E9E2D8] bg-[#FAF8F5] text-xs sm:text-sm text-[#30251F] focus:border-[#593A2C] outline-none"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
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
                        className="w-full px-2 py-1.5 text-center rounded-lg border border-[#E9E2D8] bg-[#FAF8F5] text-xs sm:text-sm text-[#30251F] focus:border-[#593A2C] outline-none"
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#E9E2D8]">
          <div className="flex-1 max-w-sm">
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Supplier dispatch notes, tracking reference..."
            />
          </div>

          <div className="text-right space-y-1">
            <span className="text-xs text-[#918477]">Total Procurement Cost</span>
            <div className="text-2xl font-bold text-[#30251F]">
              {formatCurrency(subtotal, settings.currency)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E2D8]">
          <Button variant="secondary" onClick={onClose}>
            {APP_STRINGS.COMMON.CANCEL}
          </Button>
          <Button variant="primary" type="submit">
            Confirm Purchase Order
          </Button>
        </div>
      </form>
    </Modal>
  );
};
