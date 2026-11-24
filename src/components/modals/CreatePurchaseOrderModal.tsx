"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useInventoryStore } from "@/store/useInventoryStore";
import { toast } from "sonner";
import { PurchaseOrderItem, PurchaseStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

interface CreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePurchaseOrderModal: React.FC<CreatePurchaseOrderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { suppliers, products, settings, createPurchaseOrder } = useInventoryStore();

  const [supplierId, setSupplierId] = useState(suppliers.length > 0 ? suppliers[0].id : "");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedDelivery, setExpectedDelivery] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<PurchaseStatus>("received");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<PurchaseOrderItem[]>([
    {
      productId: products[0]?.id || "",
      productName: products[0]?.name || "",
      sku: products[0]?.sku || "",
      quantity: 10,
      unitCost: products[0]?.purchasePrice || 0,
      total: (products[0]?.purchasePrice || 0) * 10,
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
        quantity: 10,
        unitCost: prod.purchasePrice,
        total: 10 * prod.purchasePrice,
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
        total: safeQty * updated[index].unitCost,
      };
      return updated;
    });
  };

  const handleUnitCostChange = (index: number, cost: number) => {
    const safeCost = Math.max(0, cost || 0);
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        unitCost: safeCost,
        total: updated[index].quantity * safeCost,
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
        quantity: 10,
        unitCost: defaultProd.purchasePrice,
        total: 10 * defaultProd.purchasePrice,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) {
      toast.error("Purchase order must contain at least one line item");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      toast.error("Please select a supplier");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) {
      toast.error("Selected supplier not found");
      return;
    }

    const res = createPurchaseOrder({
      supplierId: supplier.id,
      supplierName: supplier.name,
      orderDate: new Date(orderDate).toISOString(),
      expectedDelivery: new Date(expectedDelivery).toISOString(),
      items,
      totalAmount,
      status,
      notes: notes.trim(),
    });

    if (res.success) {
      toast.success(`Purchase Order ${res.order?.id} created successfully`);
      onClose();
    } else {
      toast.error(res.error || "Failed to create purchase order");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Purchase Order"
      subtitle="Restock inventory and order goods from verified suppliers"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        {/* Supplier & Delivery Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8]">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">
              Supplier <span className="text-red-500">*</span>
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-white text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.company})
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
              Expected Delivery <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={expectedDelivery}
              onChange={(e) => setExpectedDelivery(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-white text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PurchaseStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-white text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
            >
              <option value="received">Received (Adds stock immediately)</option>
              <option value="pending">Pending Delivery (In transit)</option>
              <option value="ordered">Ordered (PO Dispatched)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">Notes / Instructions</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Expedited freight via Bluedart air"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-white text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
            />
          </div>
        </div>

        {status === "received" && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#EBF5ED] border border-[#C3E3C8] text-[#2E6930] text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Marking this purchase order as <strong>Received</strong> will automatically increment inventory stock levels and record incoming movement logs.
            </span>
          </div>
        )}

        {/* Line Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-[#30251F] uppercase tracking-wider">
              Purchase Items
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
                  <th className="p-3 font-semibold w-28">Order Units</th>
                  <th className="p-3 font-semibold w-32">Unit Cost (₹)</th>
                  <th className="p-3 font-semibold w-32 text-right">Line Total</th>
                  <th className="p-3 font-semibold w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E2D8]">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3">
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#E9E2D8] bg-[#FAF8F5] text-xs font-medium text-[#30251F]"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value, 10))}
                        className="w-24 px-2.5 py-1.5 rounded-lg border border-[#E9E2D8] bg-[#FAF8F5] text-xs font-medium"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.unitCost}
                        onChange={(e) => handleUnitCostChange(idx, parseFloat(e.target.value))}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PO Total & Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E9E2D8]">
          <div className="text-left">
            <span className="text-xs sm:text-sm text-[#918477]">Total Purchase Cost:</span>
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
              Issue Purchase Order
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
