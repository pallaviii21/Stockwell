"use client";

import React, { useState, useMemo } from "react";
import {
  Truck,
  Plus,
  Search,
  Eye,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  PackageCheck,
} from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { CreatePurchaseOrderModal } from "@/components/modals/CreatePurchaseOrderModal";
import { toast } from "sonner";
import { PurchaseOrder, PurchaseStatus } from "@/types";

export default function PurchasesPage() {
  const { purchaseOrders, settings, updatePurchaseOrder, deletePurchaseOrder } =
    useInventoryStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [poToView, setPoToView] = useState<PurchaseOrder | null>(null);
  const [poToDelete, setPoToDelete] = useState<PurchaseOrder | null>(null);

  // Filtered orders
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchesSearch =
        po.id.toLowerCase().includes(search.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(search.toLowerCase()) ||
        po.items.some((item) => item.productName.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === "all" || po.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, search, statusFilter]);

  const handleStatusChange = (poId: string, newStatus: PurchaseStatus) => {
    const res = updatePurchaseOrder(poId, { status: newStatus });
    if (res.success) {
      toast.success(`Purchase Order ${poId} marked as ${newStatus}`);
    } else {
      toast.error(res.error || "Failed to update purchase order status");
    }
  };

  const handleDeleteConfirm = () => {
    if (!poToDelete) return;
    const res = deletePurchaseOrder(poToDelete.id);
    if (res.success) {
      toast.success(`Purchase order ${poToDelete.id} deleted`);
      setPoToDelete(null);
    } else {
      toast.error(res.error || "Failed to delete purchase order");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E9E2D8]">
        <div>
          <h1 className="text-[32px] sm:text-[34px] font-bold text-[#30251F] tracking-tight leading-tight">
            Purchase Orders
          </h1>
          <p className="text-sm sm:text-base text-[#918477] mt-1">
            Manage suppliers, track incoming shipments, and restock warehouse inventory.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#593A2C] hover:bg-[#472E23] text-white text-sm sm:text-base font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E9E2D8] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#A78B73] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by PO ID, Supplier, or item name..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] placeholder-[#918477] focus:border-[#593A2C] focus:bg-white outline-none transition-colors text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-sm">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="received">Received (Stock Added)</option>
            <option value="pending">Pending Delivery</option>
            <option value="ordered">Ordered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* PO Table */}
      <div className="rounded-2xl border border-[#E9E2D8] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-xs sm:text-sm text-[#918477]">
                <th className="py-3 px-4 font-semibold">PO Number</th>
                <th className="py-3 px-4 font-semibold">Supplier</th>
                <th className="py-3 px-4 font-semibold">Order Date</th>
                <th className="py-3 px-4 font-semibold">Expected Delivery</th>
                <th className="py-3 px-4 font-semibold">Items</th>
                <th className="py-3 px-4 font-semibold">Total Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E2D8] text-sm sm:text-base">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#918477]">
                    <Truck className="w-8 h-8 text-[#A78B73] mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-sm text-[#30251F]">No purchase orders found</p>
                    <p className="text-xs mt-1">Issue a purchase order to record inbound supplier stock.</p>
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po) => {
                  const itemCount = po.items.reduce((sum, item) => sum + item.quantity, 0);
                  const itemsSummary = po.items
                    .map((item) => `${item.productName} (x${item.quantity})`)
                    .join(", ");

                  return (
                    <tr key={po.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#593A2C]">{po.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#30251F]">
                        {po.supplierName}
                      </td>
                      <td className="py-3.5 px-4 text-[#765440]">{formatDate(po.orderDate)}</td>
                      <td className="py-3.5 px-4 text-[#918477]">
                        {formatDate(po.expectedDelivery)}
                      </td>
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <span className="text-[11px] font-medium text-[#30251F] block truncate">
                          {itemsSummary}
                        </span>
                        <span className="text-[10px] text-[#918477]">
                          {itemCount} units ordered across {po.items.length} line(s)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#30251F] text-sm">
                        {formatCurrency(po.totalAmount, settings.currency)}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={po.status}
                          onChange={(e) =>
                            handleStatusChange(po.id, e.target.value as PurchaseStatus)
                          }
                          className={`px-2 py-0.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                            po.status === "received"
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                              : po.status === "pending"
                              ? "bg-amber-50 border-amber-300 text-amber-800"
                              : po.status === "ordered"
                              ? "bg-blue-50 border-blue-300 text-blue-800"
                              : "bg-red-50 border-red-300 text-red-700"
                          }`}
                        >
                          <option value="received">Received (In Stock)</option>
                          <option value="pending">Pending Delivery</option>
                          <option value="ordered">Ordered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPoToView(po)}
                            className="p-1.5 text-[#918477] hover:text-[#593A2C] hover:bg-[#F0EBE2] rounded-lg transition-colors"
                            title="View PO Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPoToDelete(po)}
                            className="p-1.5 text-[#918477] hover:text-[#B91C1C] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                            title="Delete PO"
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

        {/* Footer */}
        <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#E9E2D8] flex items-center justify-between text-xs text-[#918477]">
          <span>
            Total: <strong>{filteredPOs.length}</strong> purchase orders (
            <strong>
              {formatCurrency(
                filteredPOs.reduce((sum, p) => sum + p.totalAmount, 0),
                settings.currency
              )}
            </strong>{" "}
            total procurement value)
          </span>
          <span className="font-mono text-[11px]">Real-time inventory replenishment</span>
        </div>
      </div>

      {/* VIEW PO DETAILS MODAL */}
      {poToView && (
        <Modal
          isOpen={Boolean(poToView)}
          onClose={() => setPoToView(null)}
          title={`Purchase Order — ${poToView.id}`}
          subtitle={`Supplier: ${poToView.supplierName} • Ordered: ${formatDate(
            poToView.orderDate
          )}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8]">
              <div>
                <span className="text-[#918477] block text-[11px]">Supplier</span>
                <span className="font-semibold text-[#30251F]">{poToView.supplierName}</span>
              </div>
              <div>
                <span className="text-[#918477] block text-[11px]">Expected Delivery</span>
                <span className="font-medium text-[#765440]">
                  {formatDate(poToView.expectedDelivery)}
                </span>
              </div>
              <div>
                <span className="text-[#918477] block text-[11px]">Status</span>
                <Badge variant={poToView.status} size="sm">
                  {poToView.status.toUpperCase()}
                </Badge>
              </div>
              <div>
                <span className="text-[#918477] block text-[11px]">Warehouse Units</span>
                <span
                  className={`font-semibold ${
                    poToView.inventoryAdded ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {poToView.inventoryAdded ? "Stock Received" : "Awaiting Goods"}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-[#E9E2D8] rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-[11px] text-[#918477]">
                    <th className="p-3 font-semibold">Item & SKU</th>
                    <th className="p-3 font-semibold text-center">Quantity</th>
                    <th className="p-3 font-semibold text-right">Unit Cost</th>
                    <th className="p-3 font-semibold text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E2D8]">
                  {poToView.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-medium text-[#30251F]">
                        <span>{item.productName}</span>
                        <span className="text-[10px] font-mono text-[#918477] block">
                          SKU: {item.sku}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-[#765440]">{item.quantity}</td>
                      <td className="p-3 text-right text-[#918477]">
                        {formatCurrency(item.unitCost, settings.currency)}
                      </td>
                      <td className="p-3 text-right font-bold text-[#30251F]">
                        {formatCurrency(item.total, settings.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#918477] block">Procurement Notes:</span>
                <p className="text-[#30251F] text-xs">
                  {poToView.notes || "Standard procurement batch."}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#918477] block">Total PO Value</span>
                <span className="text-xl font-bold text-[#593A2C]">
                  {formatCurrency(poToView.totalAmount, settings.currency)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPoToView(null)}
                className="px-4 py-2 rounded-xl bg-[#593A2C] text-white font-medium hover:bg-[#472E23] transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE PO MODAL */}
      <CreatePurchaseOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(poToDelete)}
        onClose={() => setPoToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Purchase Order"
        message={`Are you sure you want to delete purchase order "${poToDelete?.id}" from ${poToDelete?.supplierName}? If received, the added stock will be subtracted from inventory.`}
        confirmText="Delete PO"
        isDestructive={true}
      />
    </div>
  );
}
