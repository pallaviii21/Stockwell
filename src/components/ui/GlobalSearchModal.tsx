"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Package, ShoppingCart, Truck, Users, X, ArrowRight } from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { products, customers, suppliers, salesOrders, settings } = useInventoryStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const matchedProducts = products
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 4);

    const matchedCustomers = customers
      .filter((c) => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedSuppliers = suppliers
      .filter((s) => s.name.toLowerCase().includes(q) || s.company.toLowerCase().includes(q))
      .slice(0, 3);

    const matchedSales = salesOrders
      .filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q)
      )
      .slice(0, 3);

    return {
      products: matchedProducts,
      customers: matchedCustomers,
      suppliers: matchedSuppliers,
      sales: matchedSales,
      total:
        matchedProducts.length +
        matchedCustomers.length +
        matchedSuppliers.length +
        matchedSales.length,
    };
  }, [query, products, customers, suppliers, salesOrders]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#E9E2D8] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E9E2D8] bg-[#FAF8F5]">
          <Search className="w-5 h-5 text-[#918477] mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, orders, customers, suppliers... (e.g. Mouse, WM001, SO-1001)"
            className="w-full bg-transparent text-sm text-[#30251F] placeholder-[#918477] outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-[#918477] hover:text-[#30251F] rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold text-[#765440] bg-[#EAE4DC] rounded border border-[#D9CEBF]">
            ESC
          </kbd>
        </div>

        {/* Results view */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {!query.trim() && (
            <div className="text-center py-8">
              <Search className="w-8 h-8 text-[#A78B73] mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-[#593A2C]">Type to search everything in Stockwell</p>
              <p className="text-xs text-[#918477] mt-1">
                Quickly locate inventory items, customer files, invoices, or POs
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-[#765440]">
                <button
                  onClick={() => setQuery("Keyboard")}
                  className="px-2.5 py-1 rounded-lg bg-[#F0EBE2] hover:bg-[#EAE4DC]"
                >
                  &quot;Keyboard&quot;
                </button>
                <button
                  onClick={() => setQuery("SO-")}
                  className="px-2.5 py-1 rounded-lg bg-[#F0EBE2] hover:bg-[#EAE4DC]"
                >
                  &quot;SO-&quot;
                </button>
                <button
                  onClick={() => setQuery("Cable")}
                  className="px-2.5 py-1 rounded-lg bg-[#F0EBE2] hover:bg-[#EAE4DC]"
                >
                  &quot;Cable&quot;
                </button>
              </div>
            </div>
          )}

          {searchResults && searchResults.total === 0 && (
            <div className="text-center py-10">
              <p className="text-sm font-medium text-[#30251F]">No results found for &quot;{query}&quot;</p>
              <p className="text-xs text-[#918477] mt-1">
                Try searching by SKU, product title, order number, or person name.
              </p>
            </div>
          )}

          {searchResults && searchResults.total > 0 && (
            <div className="space-y-4">
              {/* Products */}
              {searchResults.products.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#918477] uppercase tracking-wider mb-2">
                    <Package className="w-3.5 h-3.5" />
                    <span>Products</span>
                  </div>
                  <div className="space-y-1.5">
                    {searchResults.products.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => navigateTo("/products")}
                        className="p-2.5 rounded-xl border border-[#E9E2D8] hover:border-[#593A2C] hover:bg-[#FAF8F5] cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="text-sm font-medium text-[#30251F]">{p.name}</div>
                          <div className="text-xs text-[#918477]">
                            SKU: {p.sku} • Category: {p.category} • Stock: {p.stockQuantity} units
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-[#593A2C]">
                            {formatCurrency(p.sellingPrice, settings.currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sales Orders */}
              {searchResults.sales.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#918477] uppercase tracking-wider mb-2">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Sales Orders</span>
                  </div>
                  <div className="space-y-1.5">
                    {searchResults.sales.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => navigateTo("/sales")}
                        className="p-2.5 rounded-xl border border-[#E9E2D8] hover:border-[#593A2C] hover:bg-[#FAF8F5] cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="text-sm font-medium text-[#30251F]">
                            {s.id} — {s.customerName}
                          </div>
                          <div className="text-xs text-[#918477]">
                            Status: {s.orderStatus} • {s.items.length} items
                          </div>
                        </div>
                        <span className="text-sm font-bold text-[#2E6930]">
                          {formatCurrency(s.totalAmount, settings.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {searchResults.customers.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#918477] uppercase tracking-wider mb-2">
                    <Users className="w-3.5 h-3.5" />
                    <span>Customers</span>
                  </div>
                  <div className="space-y-1.5">
                    {searchResults.customers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => navigateTo("/customers")}
                        className="p-2.5 rounded-xl border border-[#E9E2D8] hover:border-[#593A2C] hover:bg-[#FAF8F5] cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="text-sm font-medium text-[#30251F]">{c.name}</div>
                          <div className="text-xs text-[#918477]">{c.company} • {c.email}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#A78B73]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suppliers */}
              {searchResults.suppliers.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#918477] uppercase tracking-wider mb-2">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Suppliers</span>
                  </div>
                  <div className="space-y-1.5">
                    {searchResults.suppliers.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => navigateTo("/suppliers")}
                        className="p-2.5 rounded-xl border border-[#E9E2D8] hover:border-[#593A2C] hover:bg-[#FAF8F5] cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="text-sm font-medium text-[#30251F]">{s.name}</div>
                          <div className="text-xs text-[#918477]">{s.company} • {s.phone}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#A78B73]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal footer shortcut guide */}
        <div className="px-4 py-2.5 bg-[#F0EBE2] border-t border-[#E9E2D8] flex items-center justify-between text-xs text-[#765440]">
          <span>Tip: Press <strong>Esc</strong> to close</span>
          <span>Click any result to jump directly to module</span>
        </div>
      </div>
    </div>
  );
};
