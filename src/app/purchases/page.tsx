"use client";

import React, { useState } from "react";
import { Plus, Eye, Trash2 } from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { CreatePurchaseOrderModal } from "@/components/modals/CreatePurchaseOrderModal";
import { usePurchasesList } from "@/hooks/usePurchasesList";
import { toast } from "sonner";
import { PurchaseOrder, PurchaseStatus } from "@/types";
import { APP_STRINGS } from "@/constants/strings";

export default function PurchasesPage() {
  const { purchaseOrders, settings, updatePurchaseOrder, deletePurchaseOrder } =
    useInventoryStore();

  const { search, setSearch, statusFilter, setStatusFilter, filteredPOs } =
    usePurchasesList(purchaseOrders);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [poToView, setPoToView] = useState<PurchaseOrder | null>(null);
  const [poToDelete, setPoToDelete] = useState<PurchaseOrder | null>(null);

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
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="lg"
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-sm">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
          placeholder="Search by PO ID, Supplier, or item name..."
          className="max-w-md"
        />

        <div className="w-44">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="received">Received (In Stock)</option>
            <option value="ordered">Ordered</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </Card>

      {/* Purchase Orders Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-xs font-semibold text-[#765440] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">PO Number</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Order Date</th>
                <th className="py-3.5 px-4">Expected Delivery</th>
                <th className="py-3.5 px-4 text-center">Items</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-center">Delivery Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E2D8]">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#918477]">
                    <p className="font-medium text-sm text-[#593A2C]">No purchase orders found</p>
                    <p className="text-xs mt-1">Try adjusting search criteria or issue a new PO</p>
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po) => (
                  <tr
                    key={po.id}
                    className="hover:bg-[#FAF8F5]/60 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#30251F]">
                      {po.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#30251F]">
                      {po.supplierName}
                    </td>
                    <td className="py-3.5 px-4 text-xs sm:text-sm text-[#765440]">
                      {formatDate(po.orderDate)}
                    </td>
                    <td className="py-3.5 px-4 text-xs sm:text-sm text-[#765440]">
                      {formatDate(po.expectedDelivery)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-medium text-xs px-2 py-0.5 rounded-full bg-[#F0EBE2] text-[#593A2C]">
                        {po.items.length} items
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#30251F] text-xs sm:text-sm">
                      {formatCurrency(po.totalAmount, settings.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-block relative">
                        <select
                          value={po.status}
                          onChange={(e) =>
                            handleStatusChange(po.id, e.target.value as PurchaseStatus)
                          }
                          className="appearance-none cursor-pointer bg-transparent outline-none text-center"
                        >
                          <option value="received">Received</option>
                          <option value="ordered">Ordered</option>
                          <option value="pending">Pending</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <Badge variant={po.status} size="sm">
                          {po.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPoToView(po)}
                          title="View PO Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPoToDelete(po)}
                          title="Delete PO"
                          className="hover:text-[#B91C1C]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Purchase Order Modal */}
      <CreatePurchaseOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* View PO Details Modal */}
      {poToView && (
        <Modal
          isOpen={Boolean(poToView)}
          onClose={() => setPoToView(null)}
          title={`Purchase Order — ${poToView.id}`}
          subtitle={`Issued to ${poToView.supplierName} • Ordered on ${formatDate(poToView.orderDate)}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-sm">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8]">
              <div>
                <span className="text-xs text-[#918477]">Delivery Status</span>
                <div className="mt-1">
                  <Badge variant={poToView.status}>{poToView.status}</Badge>
                </div>
              </div>
              <div>
                <span className="text-xs text-[#918477]">Expected Delivery</span>
                <p className="text-sm font-semibold text-[#30251F] mt-1">
                  {formatDate(poToView.expectedDelivery)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#918477]">Total Procurement Value</span>
                <div className="text-xl font-bold text-[#30251F] mt-0.5">
                  {formatCurrency(poToView.totalAmount, settings.currency)}
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#593A2C] mb-2 block">
                Ordered Products ({poToView.items.length})
              </span>
              <div className="rounded-xl border border-[#E9E2D8] overflow-hidden bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FAF8F5] text-xs font-semibold text-[#765440] border-b border-[#E9E2D8]">
                    <tr>
                      <th className="p-3">Product Name</th>
                      <th className="p-3 text-center">SKU</th>
                      <th className="p-3 text-center">Units Ordered</th>
                      <th className="p-3 text-right">Unit Cost</th>
                      <th className="p-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E2D8]">
                    {poToView.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-medium text-[#30251F]">{item.productName}</td>
                        <td className="p-3 text-center font-mono text-xs text-[#918477]">
                          {item.sku}
                        </td>
                        <td className="p-3 text-center font-semibold text-[#30251F]">
                          {item.quantity}
                        </td>
                        <td className="p-3 text-right text-[#765440]">
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
            </div>

            {poToView.notes && (
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8]">
                <span className="text-xs font-semibold text-[#593A2C]">Procurement Notes:</span>
                <p className="text-xs text-[#765440] mt-0.5">{poToView.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[#E9E2D8]">
              <span className="text-xs text-[#918477]">
                Stock Added: {poToView.inventoryAdded ? "Yes (Units in warehouse)" : "Pending receipt"}
              </span>
              <Button variant="secondary" onClick={() => setPoToView(null)}>
                {APP_STRINGS.COMMON.CLOSE}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(poToDelete)}
        onClose={() => setPoToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Purchase Order"
        message={`Are you sure you want to delete purchase order ${poToDelete?.id}? This action will permanently remove the PO record.`}
        confirmText="Delete PO"
        isDestructive
      />
    </div>
  );
}
