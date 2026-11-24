"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useInventoryStore } from "@/store/useInventoryStore";
import { toast } from "sonner";
import { Product } from "@/types";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const CATEGORIES = [
  "Accessories",
  "Peripherals",
  "Displays",
  "Audio",
  "Cables",
  "Storage",
  "Networking",
  "Power & Batteries",
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { suppliers, addProduct, updateProduct } = useInventoryStore();

  const isEdit = Boolean(productToEdit);

  const [name, setName] = useState(productToEdit?.name || "");
  const [sku, setSku] = useState(productToEdit?.sku || "");
  const [category, setCategory] = useState(productToEdit?.category || CATEGORIES[0]);
  const [description, setDescription] = useState(productToEdit?.description || "");
  const [purchasePrice, setPurchasePrice] = useState(productToEdit?.purchasePrice.toString() || "");
  const [sellingPrice, setSellingPrice] = useState(productToEdit?.sellingPrice.toString() || "");
  const [stockQuantity, setStockQuantity] = useState(productToEdit?.stockQuantity.toString() || "0");
  const [minStockLevel, setMinStockLevel] = useState(productToEdit?.minStockLevel.toString() || "10");
  const [supplierId, setSupplierId] = useState(
    productToEdit?.supplierId || (suppliers.length > 0 ? suppliers[0].id : "")
  );

  // Re-sync when modal opens with productToEdit
  React.useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku);
      setCategory(productToEdit.category);
      setDescription(productToEdit.description);
      setPurchasePrice(productToEdit.purchasePrice.toString());
      setSellingPrice(productToEdit.sellingPrice.toString());
      setStockQuantity(productToEdit.stockQuantity.toString());
      setMinStockLevel(productToEdit.minStockLevel.toString());
      setSupplierId(productToEdit.supplierId);
    } else {
      setName("");
      setSku(`SKU-${Math.floor(100 + Math.random() * 900)}`);
      setCategory(CATEGORIES[0]);
      setDescription("");
      setPurchasePrice("");
      setSellingPrice("");
      setStockQuantity("0");
      setMinStockLevel("10");
      setSupplierId(suppliers.length > 0 ? suppliers[0].id : "");
    }
  }, [productToEdit, isOpen, suppliers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a product name");
      return;
    }
    if (!sku.trim()) {
      toast.error("Please enter an SKU");
      return;
    }

    const pPrice = parseFloat(purchasePrice);
    const sPrice = parseFloat(sellingPrice);
    const qty = parseInt(stockQuantity, 10);
    const minQty = parseInt(minStockLevel, 10);

    if (isNaN(pPrice) || pPrice < 0) {
      toast.error("Please enter a valid purchase price");
      return;
    }
    if (isNaN(sPrice) || sPrice < 0) {
      toast.error("Please enter a valid selling price");
      return;
    }
    if (isNaN(qty) || qty < 0) {
      toast.error("Stock quantity cannot be negative");
      return;
    }
    if (isNaN(minQty) || minQty < 0) {
      toast.error("Minimum stock level cannot be negative");
      return;
    }

    const supplier = suppliers.find((s) => s.id === supplierId);
    const supplierName = supplier ? supplier.name : "Direct Purchase";

    if (isEdit && productToEdit) {
      const res = updateProduct(productToEdit.id, {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category,
        description: description.trim(),
        purchasePrice: pPrice,
        sellingPrice: sPrice,
        stockQuantity: qty,
        minStockLevel: minQty,
        supplierId,
        supplierName,
      });

      if (res.success) {
        toast.success(`Product "${name}" updated successfully`);
        onClose();
      } else {
        toast.error("Failed to update product");
      }
    } else {
      const res = addProduct({
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category,
        description: description.trim(),
        purchasePrice: pPrice,
        sellingPrice: sPrice,
        stockQuantity: qty,
        minStockLevel: minQty,
        supplierId,
        supplierName,
      });

      if (res.success) {
        toast.success(`Product "${name}" added to inventory`);
        onClose();
      } else {
        toast.error(res.error || "Failed to add product");
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Product" : "Add New Product"}
      subtitle={isEdit ? "Update catalogue item specifications" : "Register a new item in your inventory catalogue"}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Product Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ergonomic Bluetooth Mouse"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] focus:bg-white outline-none transition-colors text-sm"
            />
          </div>

          {/* SKU */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">
              SKU <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              placeholder="e.g. WM001"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] focus:bg-white outline-none font-mono transition-colors text-sm"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] focus:bg-white outline-none transition-colors text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Purchase Price */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">
              Purchase Cost (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] focus:bg-white outline-none transition-colors text-sm"
            />
          </div>

          {/* Selling Price */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">
              Selling Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] focus:bg-white outline-none transition-colors text-sm"
            />
          </div>

          {/* Opening Stock */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">
              {isEdit ? "Current Stock Units" : "Opening Stock Units"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              placeholder="0"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] focus:bg-white outline-none transition-colors text-sm"
            />
          </div>

          {/* Minimum Stock Level */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">
              Minimum Stock Threshold <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={minStockLevel}
              onChange={(e) => setMinStockLevel(e.target.value)}
              placeholder="10"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] focus:bg-white outline-none transition-colors text-sm"
            />
            <span className="text-xs text-[#918477] mt-1 block">
              Triggers low stock warning when inventory drops to or below this.
            </span>
          </div>

          {/* Supplier */}
          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">Preferred Supplier</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] focus:bg-white outline-none transition-colors text-sm"
            >
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name} ({sup.company})
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-semibold text-[#593A2C] mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed specifications, warranty information, shelf location..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] focus:bg-white outline-none transition-colors resize-none text-sm"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E9E2D8]">
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
            {isEdit ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
