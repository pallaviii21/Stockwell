"use client";

import React, { useState, useMemo } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { formatCurrency, calculateStockStatus, getStockStatusLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { AddProductModal } from "@/components/modals/AddProductModal";
import { AdjustStockModal } from "@/components/modals/AdjustStockModal";
import { toast } from "sonner";
import { Product, StockStatus } from "@/types";

export default function ProductsPage() {
  const { products, settings, deleteProduct } = useInventoryStore();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToView, setProductToView] = useState<Product | null>(null);
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return Array.from(set);
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase());

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

  const toggleSort = (field: "name" | "price" | "stock") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleDeleteConfirm = () => {
    if (!productToDelete) return;
    const res = deleteProduct(productToDelete.id);
    if (res.success) {
      toast.success(`Product "${productToDelete.name}" deleted`);
      setProductToDelete(null);
    } else {
      toast.error(res.error || "Failed to delete product");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E9E2D8]">
        <div>
          <h1 className="text-[32px] sm:text-[34px] font-bold text-[#30251F] tracking-tight leading-tight">
            Products
          </h1>
          <p className="text-sm sm:text-base text-[#918477] mt-1">
            Manage your product catalogue, unit pricing and inventory levels.
          </p>
        </div>
        <button
          onClick={() => {
            setProductToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#593A2C] hover:bg-[#472E23] text-white text-sm sm:text-base font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E9E2D8] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#A78B73] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU or category..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] placeholder-[#918477] focus:border-[#593A2C] focus:bg-white outline-none transition-colors text-sm"
          />
        </div>

        {/* Category & Status Filters */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-[#E9E2D8] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-xs sm:text-sm text-[#918477]">
                <th
                  onClick={() => toggleSort("name")}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-[#30251F]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Product</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#A78B73]" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">SKU</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Purchase Price</th>
                <th
                  onClick={() => toggleSort("price")}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-[#30251F]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Selling Price</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#A78B73]" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("stock")}
                  className="py-3 px-4 font-semibold text-center cursor-pointer hover:text-[#30251F]"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Available Stock</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#A78B73]" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E2D8] text-sm sm:text-base">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#918477]">
                    <Package className="w-8 h-8 text-[#A78B73] mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-sm text-[#30251F]">No products found</p>
                    <p className="text-xs mt-1">Try modifying your search or filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const status = calculateStockStatus(p.stockQuantity, p.minStockLevel);
                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#30251F]">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#F0EBE2] text-[#593A2C] flex items-center justify-center font-bold text-xs shrink-0">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold block">{p.name}</span>
                            <span className="text-[11px] text-[#918477] line-clamp-1">
                              {p.description || "No description"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-[#765440]">{p.sku}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-[#F0EBE2] text-[#593A2C] font-medium text-[11px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#918477]">
                        {formatCurrency(p.purchasePrice, settings.currency)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#30251F]">
                        {formatCurrency(p.sellingPrice, settings.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs ${
                            p.stockQuantity === 0
                              ? "bg-red-100 text-red-700"
                              : p.stockQuantity <= p.minStockLevel
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {p.stockQuantity} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={status} size="sm">
                          {getStockStatusLabel(status)}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick view */}
                          <button
                            onClick={() => setProductToView(p)}
                            className="p-1.5 text-[#918477] hover:text-[#593A2C] hover:bg-[#F0EBE2] rounded-lg transition-colors"
                            title="View Product Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Adjust stock */}
                          <button
                            onClick={() => setProductToAdjust(p)}
                            className="p-1.5 text-[#918477] hover:text-[#B45309] hover:bg-[#FEF3C7] rounded-lg transition-colors"
                            title="Adjust Stock"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => {
                              setProductToEdit(p);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 text-[#918477] hover:text-[#30251F] hover:bg-[#F0EBE2] rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 text-[#918477] hover:text-[#B91C1C] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#E9E2D8] flex items-center justify-between text-xs text-[#918477]">
          <span>
            Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong>{" "}
            products
          </span>
          <span className="font-mono text-[11px]">Default Sorting: {sortBy.toUpperCase()}</span>
        </div>
      </div>

      {/* PRODUCT DETAILS MODAL */}
      {productToView && (
        <Modal
          isOpen={Boolean(productToView)}
          onClose={() => setProductToView(null)}
          title={productToView.name}
          subtitle={`Catalogue details & inventory status for SKU: ${productToView.sku}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8]">
              <div>
                <span className="text-[#918477] block text-[11px]">Category</span>
                <span className="font-semibold text-[#30251F]">{productToView.category}</span>
              </div>
              <div>
                <span className="text-[#918477] block text-[11px]">Stock Status</span>
                <Badge
                  variant={calculateStockStatus(
                    productToView.stockQuantity,
                    productToView.minStockLevel
                  )}
                  size="sm"
                >
                  {getStockStatusLabel(
                    calculateStockStatus(
                      productToView.stockQuantity,
                      productToView.minStockLevel
                    )
                  )}
                </Badge>
              </div>
              <div>
                <span className="text-[#918477] block text-[11px]">Current Quantity</span>
                <span className="font-bold text-[#30251F] text-sm">
                  {productToView.stockQuantity} units
                </span>
              </div>
              <div>
                <span className="text-[#918477] block text-[11px]">Wholesale Cost</span>
                <span className="font-semibold text-[#593A2C]">
                  {formatCurrency(productToView.purchasePrice, settings.currency)}
                </span>
              </div>
              <div>
                <span className="text-[#918477] block text-[11px]">Selling Price</span>
                <span className="font-bold text-[#2E6930]">
                  {formatCurrency(productToView.sellingPrice, settings.currency)}
                </span>
              </div>
              <div>
                <span className="text-[#918477] block text-[11px]">Gross Margin</span>
                <span className="font-bold text-[#765440]">
                  {(
                    ((productToView.sellingPrice - productToView.purchasePrice) /
                      productToView.sellingPrice) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>

            <div>
              <span className="text-[#918477] font-semibold block mb-1">Description:</span>
              <p className="p-3 rounded-xl bg-[#F8F6F1] border border-[#E9E2D8] text-[#30251F] leading-relaxed">
                {productToView.description || "No description provided."}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F0EBE2] border border-[#E9E2D8] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#918477] block">Preferred Supplier</span>
                <span className="font-semibold text-[#30251F]">{productToView.supplierName}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#918477] block">Min Reorder Level</span>
                <span className="font-semibold text-[#30251F]">
                  {productToView.minStockLevel} units
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E9E2D8]">
              <button
                onClick={() => {
                  const target = productToView;
                  setProductToView(null);
                  setProductToAdjust(target);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#F0EBE2] hover:bg-[#EAE4DC] text-[#593A2C] font-semibold"
              >
                Adjust Stock
              </button>
              <button
                onClick={() => {
                  const target = productToView;
                  setProductToView(null);
                  setProductToEdit(target);
                  setIsAddModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#593A2C] hover:bg-[#472E23] text-white font-semibold"
              >
                Edit Product
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD / EDIT MODAL */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />

      {/* ADJUST STOCK MODAL */}
      {productToAdjust && (
        <AdjustStockModal
          isOpen={Boolean(productToAdjust)}
          onClose={() => setProductToAdjust(null)}
          preselectedProductId={productToAdjust.id}
        />
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}" (${productToDelete?.sku}) from your inventory catalogue? This action cannot be undone.`}
        confirmText="Delete Product"
        isDestructive={true}
      />
    </div>
  );
}
