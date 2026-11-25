"use client";

import { useState, useMemo } from "react";
import { Product } from "@/types";
import { calculateStockStatus } from "@/lib/utils";

export type ProductSortField = "name" | "price" | "stock";
export type SortOrder = "asc" | "desc";

export function useProductList(products: Product[]) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<ProductSortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return Array.from(set);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products
      .filter((p) => {
        const matchesSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);

        const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;

        const currentStatus = calculateStockStatus(p.stockQuantity, p.minStockLevel);
        const matchesStatus = statusFilter === "all" || currentStatus === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        let compare = 0;
        if (sortBy === "name") compare = a.name.localeCompare(b.name);
        if (sortBy === "price") compare = a.sellingPrice - b.sellingPrice;
        if (sortBy === "stock") compare = a.stockQuantity - b.stockQuantity;
        return sortOrder === "asc" ? compare : -compare;
      });
  }, [products, search, categoryFilter, statusFilter, sortBy, sortOrder]);

  const toggleSort = (field: ProductSortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  return {
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    sortOrder,
    toggleSort,
    categories,
    filteredProducts,
    clearFilters,
  };
}
