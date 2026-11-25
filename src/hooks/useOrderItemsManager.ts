"use client";

import { useState, useMemo } from "react";
import { Product } from "@/types";

export interface LineItemState {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  rate: number;
  total: number;
}

export function useOrderItemsManager(products: Product[], defaultPriceField: "sellingPrice" | "purchasePrice" = "sellingPrice") {
  const [items, setItems] = useState<LineItemState[]>([
    {
      productId: products[0]?.id || "",
      productName: products[0]?.name || "",
      sku: products[0]?.sku || "",
      quantity: 1,
      rate: products[0] ? products[0][defaultPriceField] : 0,
      total: products[0] ? products[0][defaultPriceField] : 0,
    },
  ]);

  const handleProductChange = (index: number, selectedProdId: string) => {
    const prod = products.find((p) => p.id === selectedProdId);
    if (!prod) return;

    setItems((prev) => {
      const updated = [...prev];
      const rate = prod[defaultPriceField];
      const quantity = updated[index]?.quantity || 1;
      updated[index] = {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity,
        rate,
        total: quantity * rate,
      };
      return updated;
    });
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const safeQty = Math.max(1, qty || 1);
    setItems((prev) => {
      const updated = [...prev];
      const current = updated[index];
      if (!current) return prev;
      updated[index] = {
        ...current,
        quantity: safeQty,
        total: safeQty * current.rate,
      };
      return updated;
    });
  };

  const handleRateChange = (index: number, rate: number) => {
    const safeRate = Math.max(0, rate || 0);
    setItems((prev) => {
      const updated = [...prev];
      const current = updated[index];
      if (!current) return prev;
      updated[index] = {
        ...current,
        rate: safeRate,
        total: current.quantity * safeRate,
      };
      return updated;
    });
  };

  const addItemRow = () => {
    const defaultProd = products[0];
    if (!defaultProd) return;
    const rate = defaultProd[defaultPriceField];
    setItems((prev) => [
      ...prev,
      {
        productId: defaultProd.id,
        productName: defaultProd.name,
        sku: defaultProd.sku,
        quantity: 1,
        rate,
        total: rate,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const resetItems = () => {
    const defaultProd = products[0];
    if (!defaultProd) return;
    const rate = defaultProd[defaultPriceField];
    setItems([
      {
        productId: defaultProd.id,
        productName: defaultProd.name,
        sku: defaultProd.sku,
        quantity: 1,
        rate,
        total: rate,
      },
    ]);
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.total, 0);
  }, [items]);

  return {
    items,
    subtotal,
    handleProductChange,
    handleQuantityChange,
    handleRateChange,
    addItemRow,
    removeItemRow,
    resetItems,
  };
}
