"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useInventoryStore } from "@/store/useInventoryStore";
import { toast } from "sonner";
import { Product } from "@/types";
import { PRODUCT_CATEGORIES } from "@/constants/inventory";
import { APP_STRINGS } from "@/constants/strings";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { suppliers, addProduct, updateProduct } = useInventoryStore();

  const isEdit = Boolean(productToEdit);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState<string>(PRODUCT_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [minStockLevel, setMinStockLevel] = useState("10");
  const [supplierId, setSupplierId] = useState("");

  useEffect(() => {
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
      setCategory(PRODUCT_CATEGORIES[0]);
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
      toast.error(APP_STRINGS.TOASTS.PRODUCT_NAME_REQUIRED);
      return;
    }
    if (!sku.trim()) {
      toast.error(APP_STRINGS.TOASTS.SKU_REQUIRED);
      return;
    }

    const pPrice = parseFloat(purchasePrice);
    const sPrice = parseFloat(sellingPrice);
    const qty = parseInt(stockQuantity, 10);
    const minQty = parseInt(minStockLevel, 10);

    if (isNaN(pPrice) || pPrice < 0) {
      toast.error(APP_STRINGS.TOASTS.PURCHASE_PRICE_INVALID);
      return;
    }
    if (isNaN(sPrice) || sPrice < 0) {
      toast.error(APP_STRINGS.TOASTS.SELLING_PRICE_INVALID);
      return;
    }
    if (isNaN(qty) || qty < 0) {
      toast.error(APP_STRINGS.TOASTS.STOCK_NEGATIVE);
      return;
    }

    const selectedSupplier = suppliers.find((s) => s.id === supplierId);
    const supplierName = selectedSupplier ? selectedSupplier.name : "Direct Manufacturer";

    if (isEdit && productToEdit) {
      updateProduct(productToEdit.id, {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category,
        description: description.trim(),
        purchasePrice: pPrice,
        sellingPrice: sPrice,
        stockQuantity: qty,
        minStockLevel: isNaN(minQty) ? 10 : minQty,
        supplierId,
        supplierName,
      });
      toast.success(APP_STRINGS.TOASTS.PRODUCT_UPDATED);
    } else {
      addProduct({
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category,
        description: description.trim(),
        purchasePrice: pPrice,
        sellingPrice: sPrice,
        stockQuantity: qty,
        minStockLevel: isNaN(minQty) ? 10 : minQty,
        supplierId,
        supplierName,
      });
      toast.success(APP_STRINGS.TOASTS.PRODUCT_CREATED);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Product" : "Add New Product"}
      subtitle={
        isEdit
          ? `Update catalogue specifications and pricing for ${productToEdit?.sku}`
          : "Add a new SKU to your centralized inventory catalogue"
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Product Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mechanical Wireless Keyboard"
          />

          <Input
            label="SKU (Stock Keeping Unit) *"
            required
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="e.g. KB-RGB-001"
          />

          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>

          <Select
            label="Primary Supplier"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
          >
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.company})
              </option>
            ))}
          </Select>

          <Input
            label="Purchase / Cost Price (₹) *"
            type="number"
            min="0"
            step="0.01"
            required
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="0.00"
          />

          <Input
            label="Selling / Retail Price (₹) *"
            type="number"
            min="0"
            step="0.01"
            required
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            placeholder="0.00"
          />

          <Input
            label="Available Stock Units *"
            type="number"
            min="0"
            required
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            placeholder="0"
          />

          <Input
            label="Low Stock Alert Threshold *"
            type="number"
            min="1"
            required
            value={minStockLevel}
            onChange={(e) => setMinStockLevel(e.target.value)}
            placeholder="10"
            hint="Trigger alert when stock falls below this quantity"
          />
        </div>

        <Textarea
          label="Product Description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed product specifications, color, warranty..."
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E9E2D8]">
          <Button variant="secondary" onClick={onClose}>
            {APP_STRINGS.COMMON.CANCEL}
          </Button>
          <Button variant="primary" type="submit">
            {isEdit ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
