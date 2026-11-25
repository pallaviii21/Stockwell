"use client";

import { useState, useMemo } from "react";
import { SalesOrder } from "@/types";

export function useSalesList(salesOrders: SalesOrder[]) {
  const [search, setSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();

    return salesOrders.filter((order) => {
      const matchesSearch =
        !q ||
        order.id.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.items.some((item) => item.productName.toLowerCase().includes(q));

      const matchesOrderStatus =
        orderStatusFilter === "all" || order.orderStatus === orderStatusFilter;

      const matchesPaymentStatus =
        paymentStatusFilter === "all" || order.paymentStatus === paymentStatusFilter;

      return matchesSearch && matchesOrderStatus && matchesPaymentStatus;
    });
  }, [salesOrders, search, orderStatusFilter, paymentStatusFilter]);

  const clearFilters = () => {
    setSearch("");
    setOrderStatusFilter("all");
    setPaymentStatusFilter("all");
  };

  return {
    search,
    setSearch,
    orderStatusFilter,
    setOrderStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    filteredOrders,
    clearFilters,
  };
}
