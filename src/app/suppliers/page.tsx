"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Truck,
  FileSpreadsheet,
} from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { Supplier } from "@/types";

export default function SuppliersPage() {
  const { suppliers, purchaseOrders, settings, addSupplier, updateSupplier, deleteSupplier } =
    useInventoryStore();

  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [supplierToView, setSupplierToView] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.company.toLowerCase().includes(search.toLowerCase()) ||
        s.phone.includes(search)
    );
  }, [suppliers, search]);

  const openAddOrEditModal = (sup?: Supplier) => {
    if (sup) {
      setSupplierToEdit(sup);
      setName(sup.name);
      setEmail(sup.email);
      setPhone(sup.phone);
      setCompany(sup.company);
      setAddress(sup.address);
    } else {
      setSupplierToEdit(null);
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setAddress("");
    }
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Supplier contact name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Supplier email is required");
      return;
    }

    if (supplierToEdit) {
      updateSupplier(supplierToEdit.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim(),
        address: address.trim(),
      });
      toast.success(`Supplier "${name}" updated successfully`);
    } else {
      addSupplier({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim(),
        address: address.trim(),
      });
      toast.success(`Supplier "${name}" added to directory`);
    }

    setIsAddModalOpen(false);
    setSupplierToEdit(null);
  };

  const handleDeleteConfirm = () => {
    if (!supplierToDelete) return;
    deleteSupplier(supplierToDelete.id);
    toast.success(`Supplier "${supplierToDelete.name}" deleted`);
    setSupplierToDelete(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E9E2D8]">
        <div>
          <h1 className="text-[32px] sm:text-[34px] font-bold text-[#30251F] tracking-tight leading-tight">
            Suppliers
          </h1>
          <p className="text-sm sm:text-base text-[#918477] mt-1">
            Manage your verified vendor network, procurement contacts, and procurement spend.
          </p>
        </div>
        <button
          onClick={() => openAddOrEditModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#593A2C] hover:bg-[#472E23] text-white text-sm sm:text-base font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E9E2D8] shadow-sm flex items-center justify-between text-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#A78B73] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by supplier name, company, or email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] placeholder-[#918477] focus:border-[#593A2C] focus:bg-white outline-none transition-colors text-sm"
          />
        </div>
        <span className="text-[#918477] text-xs sm:text-sm hidden sm:inline-block">
          {filteredSuppliers.length} vendor partners
        </span>
      </div>

      {/* Suppliers Table */}
      <div className="rounded-2xl border border-[#E9E2D8] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-xs sm:text-sm text-[#918477]">
                <th className="py-3 px-4 font-semibold">Supplier Name</th>
                <th className="py-3 px-4 font-semibold">Company</th>
                <th className="py-3 px-4 font-semibold">Contact Details</th>
                <th className="py-3 px-4 font-semibold text-center">Total Purchase Orders</th>
                <th className="py-3 px-4 font-semibold text-right">Total Procurement Value</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E2D8] text-sm sm:text-base">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#918477]">
                    <Building2 className="w-8 h-8 text-[#A78B73] mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-sm text-[#30251F]">No suppliers found</p>
                    <p className="text-xs mt-1">Add your verified suppliers to generate POs.</p>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => {
                  const supplierPOs = purchaseOrders.filter((p) => p.supplierId === s.id);
                  const totalSpent = supplierPOs
                    .filter((p) => p.status === "received")
                    .reduce((sum, p) => sum + p.totalAmount, 0);

                  return (
                    <tr key={s.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#30251F]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#F0EBE2] text-[#593A2C] flex items-center justify-center font-bold text-xs shrink-0">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold block">{s.name}</span>
                            <span className="text-[10px] text-[#918477]">ID: {s.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#593A2C] font-semibold">{s.company}</td>
                      <td className="py-3.5 px-4 text-[#765440]">
                        <span className="block">{s.email}</span>
                        <span className="text-[11px] text-[#918477]">{s.phone}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-[#30251F]">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F0EBE2] text-[#593A2C]">
                          {supplierPOs.length} POs
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#593A2C]">
                        {formatCurrency(totalSpent, settings.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSupplierToView(s)}
                            className="p-1.5 text-[#918477] hover:text-[#593A2C] hover:bg-[#F0EBE2] rounded-lg transition-colors"
                            title="View Supplier Info"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openAddOrEditModal(s)}
                            className="p-1.5 text-[#918477] hover:text-[#30251F] hover:bg-[#F0EBE2] rounded-lg transition-colors"
                            title="Edit Supplier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSupplierToDelete(s)}
                            className="p-1.5 text-[#918477] hover:text-[#B91C1C] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                            title="Delete Supplier"
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
      </div>

      {/* ADD / EDIT SUPPLIER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={supplierToEdit ? "Edit Supplier Record" : "Add New Supplier"}
        subtitle="Register vendors for inventory restocking orders"
        maxWidth="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#593A2C] mb-1">
              Contact Person / Representative <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NexGen Sales Desk"
              className="w-full px-3 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#593A2C] mb-1">
              Official Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. orders@vendor.com"
              className="w-full px-3 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#593A2C] mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 11 2389 4410"
              className="w-full px-3 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#593A2C] mb-1">Company Legal Entity</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. NexGen Hub Pvt Ltd"
              className="w-full px-3 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#593A2C] mb-1">Warehouse / Factory Address</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Industrial Area, City, Pin"
              className="w-full px-3 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E9E2D8]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 font-medium text-[#593A2C] bg-[#F0EBE2] hover:bg-[#EAE4DC] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-medium text-white bg-[#593A2C] hover:bg-[#472E23] rounded-xl shadow-xs transition-colors"
            >
              {supplierToEdit ? "Save Changes" : "Register Supplier"}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW SUPPLIER DETAILS & PO HISTORY */}
      {supplierToView && (
        <Modal
          isOpen={Boolean(supplierToView)}
          onClose={() => setSupplierToView(null)}
          title={`Supplier: ${supplierToView.name}`}
          subtitle={`Company: ${supplierToView.company}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8]">
              <div>
                <span className="text-[#918477] block text-[11px]">Email</span>
                <span className="font-semibold text-[#30251F]">{supplierToView.email}</span>
              </div>
              <div>
                <span className="text-[#918477] block text-[11px]">Phone</span>
                <span className="font-semibold text-[#30251F]">{supplierToView.phone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#918477] block text-[11px]">Address</span>
                <span className="text-[#30251F]">{supplierToView.address || "N/A"}</span>
              </div>
            </div>

            {/* Inbound Purchase Order History */}
            <div>
              <h4 className="font-semibold text-[#30251F] mb-2 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#593A2C]" />
                <span>Purchase Orders Dispatched</span>
              </h4>
              <div className="border border-[#E9E2D8] rounded-xl overflow-hidden bg-white max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-[11px] text-[#918477]">
                      <th className="p-2.5 font-semibold">PO Number</th>
                      <th className="p-2.5 font-semibold">Date</th>
                      <th className="p-2.5 font-semibold">Status</th>
                      <th className="p-2.5 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E2D8]">
                    {purchaseOrders.filter((p) => p.supplierId === supplierToView.id).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-[#918477]">
                          No purchase orders issued to this supplier yet.
                        </td>
                      </tr>
                    ) : (
                      purchaseOrders
                        .filter((p) => p.supplierId === supplierToView.id)
                        .map((po) => (
                          <tr key={po.id}>
                            <td className="p-2.5 font-mono font-semibold text-[#593A2C]">{po.id}</td>
                            <td className="p-2.5 text-[#765440]">{formatDate(po.orderDate)}</td>
                            <td className="p-2.5">
                              <span className="capitalize">{po.status}</span>
                            </td>
                            <td className="p-2.5 text-right font-bold text-[#30251F]">
                              {formatCurrency(po.totalAmount, settings.currency)}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSupplierToView(null)}
                className="px-4 py-2 rounded-xl bg-[#593A2C] text-white font-medium hover:bg-[#472E23]"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={Boolean(supplierToDelete)}
        onClose={() => setSupplierToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Supplier"
        message={`Are you sure you want to remove supplier "${supplierToDelete?.name}" from your vendor directory?`}
        confirmText="Delete Supplier"
        isDestructive={true}
      />
    </div>
  );
}
