"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useRouter } from "next/navigation";
import { APP_STRINGS } from "@/constants/strings";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { products, customers, suppliers, salesOrders } = useInventoryStore();

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
                  <div className="text-xs font-bold text-[#A78B73] uppercase tracking-wider mb-2">
                    Products ({searchResults.products.length})
                  </div>
                  <div className="space-y-1">
                    {searchResults.products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => navigateTo("/products")}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-sm font-semibold text-[#30251F] group-hover:text-[#593A2C]">
                            {p.name}
                          </div>
                          <div className="text-xs text-[#918477]">
                            SKU: {p.sku} • Category: {p.category}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F0EBE2] text-[#593A2C]">
                            {p.stockQuantity} in stock
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sales Orders */}
              {searchResults.sales.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-[#A78B73] uppercase tracking-wider mb-2">
                    Sales Orders ({searchResults.sales.length})
                  </div>
                  <div className="space-y-1">
                    {searchResults.sales.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => navigateTo("/sales")}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-sm font-semibold text-[#30251F] group-hover:text-[#593A2C]">
                            Order {o.id}
                          </div>
                          <div className="text-xs text-[#918477]">
                            Customer: {o.customerName} • {o.items.length} items
                          </div>
                        </div>
                        <span className="text-xs capitalize font-medium text-[#765440]">
                          {o.orderStatus}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {searchResults.customers.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-[#A78B73] uppercase tracking-wider mb-2">
                    Customers ({searchResults.customers.length})
                  </div>
                  <div className="space-y-1">
                    {searchResults.customers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => navigateTo("/customers")}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-sm font-semibold text-[#30251F] group-hover:text-[#593A2C]">
                            {c.name}
                          </div>
                          <div className="text-xs text-[#918477]">{c.company}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suppliers */}
              {searchResults.suppliers.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-[#A78B73] uppercase tracking-wider mb-2">
                    Suppliers ({searchResults.suppliers.length})
                  </div>
                  <div className="space-y-1">
                    {searchResults.suppliers.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => navigateTo("/suppliers")}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-sm font-semibold text-[#30251F] group-hover:text-[#593A2C]">
                            {s.name}
                          </div>
                          <div className="text-xs text-[#918477]">{s.company}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
