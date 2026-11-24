"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useInventoryStore } from "@/store/useInventoryStore";
import { toast } from "sonner";
import { ArrowRight, AlertTriangle } from "lucide-react";

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProductId?: string;
}

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  isOpen,
  onClose,
  preselectedProductId,
}) => {
  const { products, adjustStock } = useInventoryStore();

  const [productId, setProductId] = useState(
    preselectedProductId || (products.length > 0 ? products[0].id : "")
  );
  const [type, setType] = useState<"add" | "subtract" | "set">("add");
  const [quantity, setQuantity] = useState("5");
  const [reason, setReason] = useState("Manual audit adjustment");

  React.useEffect(() => {
    if (preselectedProductId) {
      setProductId(preselectedProductId);
    }
  }, [preselectedProductId]);

  const selectedProduct = products.find((p) => p.id === productId);
  const currentQty = selectedProduct ? selectedProduct.stockQuantity : 0;
  const numQty = parseInt(quantity, 10) || 0;

  let calculatedNewQty = currentQty;
  if (type === "add") calculatedNewQty = currentQty + numQty;
  if (type === "subtract") calculatedNewQty = currentQty - numQty;
  if (type === "set") calculatedNewQty = numQty;

  const isInvalidNegative = calculatedNewQty < 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }
    if (isNaN(numQty) || numQty <= 0) {
      toast.error("Please enter a valid quantity greater than 0");
      return;
    }
    if (isInvalidNegative) {
      toast.error("Stock quantity cannot be reduced below 0");
      return;
    }

    const res = adjustStock({
      productId: selectedProduct.id,
      type,
      quantity: numQty,
      reason: reason.trim(),
    });

    if (res.success) {
      toast.success(
        `Adjusted stock for "${selectedProduct.name}" from ${currentQty} to ${calculatedNewQty}`
      );
      onClose();
    } else {
      toast.error(res.error || "Failed to adjust stock");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Stock Quantity"
      subtitle="Record physical stock reconciliation or audit correction"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Product selection */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">Select Product</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — Available: {p.stockQuantity}
              </option>
            ))}
          </select>
        </div>

        {/* Adjustment mode */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">Adjustment Type</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setType("add")}
              className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                type === "add"
                  ? "bg-[#EBF5ED] border-[#C3E3C8] text-[#2E6930]"
                  : "bg-white border-[#E9E2D8] text-[#918477] hover:border-[#D9CEBF]"
              }`}
            >
              + Add Units
            </button>
            <button
              type="button"
              onClick={() => setType("subtract")}
              className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                type === "subtract"
                  ? "bg-[#FEE2E2] border-[#FECACA] text-[#B91C1C]"
                  : "bg-white border-[#E9E2D8] text-[#918477] hover:border-[#D9CEBF]"
              }`}
            >
              - Remove Units
            </button>
            <button
              type="button"
              onClick={() => setType("set")}
              className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                type === "set"
                  ? "bg-[#FEF3C7] border-[#FDE68A] text-[#B45309]"
                  : "bg-white border-[#E9E2D8] text-[#918477] hover:border-[#D9CEBF]"
              }`}
            >
              = Set Exact
            </button>
          </div>
        </div>

        {/* Quantity input */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">
            {type === "set" ? "New Total Count" : "Quantity to Adjust"}
          </label>
          <input
            type="number"
            min="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
          />
        </div>

        {/* Live Preview Box */}
        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#918477] block">Current Quantity</span>
            <span className="text-xl font-bold text-[#30251F]">{currentQty} units</span>
          </div>
          <ArrowRight className="w-5 h-5 text-[#A78B73]" />
          <div className="text-right">
            <span className="text-xs text-[#918477] block">New Quantity</span>
            <span
              className={`text-xl font-bold ${
                isInvalidNegative
                  ? "text-red-600"
                  : calculatedNewQty <= (selectedProduct?.minStockLevel || 0)
                  ? "text-amber-600"
                  : "text-emerald-700"
              }`}
            >
              {calculatedNewQty} units
            </span>
          </div>
        </div>

        {isInvalidNegative && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 text-red-700 text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Stock cannot be reduced below zero. Adjust quantity.</span>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">
            Reason / Audit Reference
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Physical inventory count variance, transit damage write-off"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E2D8]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 sm:px-5 sm:py-2.5 font-medium text-[#593A2C] bg-[#F0EBE2] hover:bg-[#EAE4DC] rounded-xl transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isInvalidNegative}
            className="px-5 py-2 sm:px-6 sm:py-2.5 font-semibold text-white bg-[#593A2C] hover:bg-[#472E23] rounded-xl shadow-xs transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            Apply Adjustment
          </button>
        </div>
      </form>
    </Modal>
  );
};
