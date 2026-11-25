"use client";

import React, { useState } from "react";
import { Package, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { formatCurrency, calculateStockStatus, getStockStatusLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { AddProductModal } from "@/components/modals/AddProductModal";
import { AdjustStockModal } from "@/components/modals/AdjustStockModal";
import { useProductList } from "@/hooks/useProductList";
import { toast } from "sonner";
import { Product } from "@/types";
import { APP_STRINGS } from "@/constants/strings";

export default function ProductsPage() {
  const { products, settings, deleteProduct } = useInventoryStore();

  const {
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
  } = useProductList(products);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToView, setProductToView] = useState<Product | null>(null);
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

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
            Manage your product catalogue, unit economics, retail margins, and threshold warnings.
          </p>
        </div>
        <Button
          onClick={() => {
            setProductToEdit(null);
            setIsAddModalOpen(true);
          }}
          size="lg"
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-sm">
        {/* Search */}
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
          placeholder="Search by product name, SKU, or category..."
          className="max-w-md"
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-40">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-xs font-semibold text-[#765440] uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => toggleSort("name")}
                  className="py-3.5 px-4 cursor-pointer hover:text-[#30251F] transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Product & SKU</span>
                    {sortBy === "name" && (
                      <span className="text-[#593A2C] font-bold">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Cost Price</th>
                <th
                  onClick={() => toggleSort("price")}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-[#30251F] transition-colors select-none"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Selling Price</span>
                    {sortBy === "price" && (
                      <span className="text-[#593A2C] font-bold">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("stock")}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-[#30251F] transition-colors select-none"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Available Stock</span>
                    {sortBy === "stock" && (
                      <span className="text-[#593A2C] font-bold">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E2D8]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#918477]">
                    <Package className="w-8 h-8 text-[#A78B73] mx-auto mb-2 opacity-60" />
                    <p className="font-medium text-sm text-[#593A2C]">No products found matching filters</p>
                    <p className="text-xs mt-1">Try resetting search or adjusting category selection</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = calculateStockStatus(product.stockQuantity, product.minStockLevel);
                  const marginPercent = Math.round(
                    ((product.sellingPrice - product.purchasePrice) / product.sellingPrice) * 100
                  );

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-[#FAF8F5]/60 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#30251F] group-hover:text-[#593A2C] transition-colors">
                          {product.name}
                        </div>
                        <div className="text-xs text-[#918477] font-mono mt-0.5">
                          {product.sku}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-[#F0EBE2] text-xs font-medium text-[#765440]">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs sm:text-sm text-[#918477]">
                        {formatCurrency(product.purchasePrice, settings.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-[#30251F] text-xs sm:text-sm">
                        {formatCurrency(product.sellingPrice, settings.currency)}
                        <span className="block text-[11px] font-normal text-[#2E6930]">
                          {marginPercent}% margin
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-sm text-[#30251F]">
                          {product.stockQuantity}
                        </span>
                        <span className="text-[11px] text-[#918477] block">
                          min {product.minStockLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={status}>{getStockStatusLabel(status)}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setProductToView(product)}
                            title="View Product Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setProductToEdit(product);
                              setIsAddModalOpen(true);
                            }}
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setProductToDelete(product)}
                            title="Delete Product"
                            className="hover:text-[#B91C1C]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />

      {/* Adjust Stock Modal */}
      {productToAdjust && (
        <AdjustStockModal
          isOpen={Boolean(productToAdjust)}
          onClose={() => setProductToAdjust(null)}
          preselectedProductId={productToAdjust.id}
        />
      )}

      {/* Product Details View Modal */}
      {productToView && (
        <Modal
          isOpen={Boolean(productToView)}
          onClose={() => setProductToView(null)}
          title={productToView.name}
          subtitle={`SKU: ${productToView.sku} • Category: ${productToView.category}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8]">
              <div>
                <span className="text-xs text-[#918477]">Selling Price</span>
                <p className="text-lg font-bold text-[#30251F]">
                  {formatCurrency(productToView.sellingPrice, settings.currency)}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#918477]">Purchase Cost</span>
                <p className="text-lg font-bold text-[#765440]">
                  {formatCurrency(productToView.purchasePrice, settings.currency)}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#918477]">Available Stock</span>
                <p className="text-lg font-bold text-[#593A2C]">
                  {productToView.stockQuantity} units
                </p>
              </div>
              <div>
                <span className="text-xs text-[#918477]">Low Stock Threshold</span>
                <p className="text-lg font-bold text-[#B45309]">
                  {productToView.minStockLevel} units
                </p>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#593A2C]">Product Description</span>
              <p className="text-xs sm:text-sm text-[#765440] mt-1 leading-relaxed">
                {productToView.description || "No detailed description provided."}
              </p>
            </div>

            <div className="pt-2">
              <span className="text-xs font-semibold text-[#593A2C]">Primary Supplier</span>
              <p className="text-xs sm:text-sm text-[#30251F] mt-0.5">
                {productToView.supplierName || "Direct / Internal"}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E9E2D8]">
              <Button
                variant="secondary"
                onClick={() => {
                  setProductToAdjust(productToView);
                  setProductToView(null);
                }}
              >
                Adjust Stock
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setProductToEdit(productToView);
                  setProductToView(null);
                  setIsAddModalOpen(true);
                }}
              >
                Edit Product
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}" (${productToDelete?.sku})? This product will be removed from your active catalogue.`}
        confirmText="Delete Product"
        isDestructive
      />
    </div>
  );
}
