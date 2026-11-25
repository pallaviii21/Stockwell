"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useInventoryStore } from "@/store/useInventoryStore";
import { toast } from "sonner";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { APP_STRINGS } from "@/constants/strings";

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

  useEffect(() => {
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
        <Select
          label="Select Product"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku}) — Available: {p.stockQuantity}
            </option>
          ))}
        </Select>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">
            Adjustment Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setType("add")}
              className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                type === "add"
                  ? "border-[#2E6930] bg-[#EBF5ED] text-[#2E6930] font-semibold shadow-xs"
                  : "border-[#E9E2D8] bg-[#FAF8F5] text-[#765440] hover:bg-[#F0EBE2]"
              }`}
            >
              + Add Units
            </button>
            <button
              type="button"
              onClick={() => setType("subtract")}
              className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                type === "subtract"
                  ? "border-[#B91C1C] bg-[#FEE2E2] text-[#B91C1C] font-semibold shadow-xs"
                  : "border-[#E9E2D8] bg-[#FAF8F5] text-[#765440] hover:bg-[#F0EBE2]"
              }`}
            >
              - Remove Units
            </button>
            <button
              type="button"
              onClick={() => setType("set")}
              className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                type === "set"
                  ? "border-[#593A2C] bg-[#F0EBE2] text-[#593A2C] font-semibold shadow-xs"
                  : "border-[#E9E2D8] bg-[#FAF8F5] text-[#765440] hover:bg-[#F0EBE2]"
              }`}
            >
              Set Exact Count
            </button>
          </div>
        </div>

        <Input
          label={type === "set" ? "New Exact Quantity" : "Quantity Change Delta"}
          type="number"
          min="1"
          required
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        {/* Live Calculation Preview Banner */}
        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8] flex items-center justify-between">
          <div className="text-xs text-[#918477]">
            <span>Current: </span>
            <span className="font-semibold text-[#30251F]">{currentQty}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#A78B73]" />
          <div className="text-xs">
            <span className="text-[#918477]">Updated: </span>
            <span
              className={`font-bold ${
                isInvalidNegative
                  ? "text-[#B91C1C]"
                  : calculatedNewQty <= (selectedProduct?.minStockLevel || 10)
                  ? "text-[#B45309]"
                  : "text-[#2E6930]"
              }`}
            >
              {calculatedNewQty} units
            </span>
          </div>
        </div>

        {isInvalidNegative && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FEE2E2] text-[#B91C1C] text-xs font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Cannot reduce quantity below zero units</span>
          </div>
        )}

        <Input
          label="Reason for Adjustment *"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Quarterly physical recount, damaged stock..."
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E2D8]">
          <Button variant="secondary" onClick={onClose}>
            {APP_STRINGS.COMMON.CANCEL}
          </Button>
          <Button variant="primary" type="submit" disabled={isInvalidNegative}>
            Apply Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
