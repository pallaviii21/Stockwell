"use client";

import { useState, useMemo } from "react";
import { PurchaseOrder } from "@/types";

export function usePurchasesList(purchaseOrders: PurchaseOrder[]) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredPOs = useMemo(() => {
    const q = search.trim().toLowerCase();

    return purchaseOrders.filter((po) => {
      const matchesSearch =
        !q ||
        po.id.toLowerCase().includes(q) ||
        po.supplierName.toLowerCase().includes(q) ||
        po.items.some((item) => item.productName.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "all" || po.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, search, statusFilter]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredPOs,
    clearFilters,
  };
}
