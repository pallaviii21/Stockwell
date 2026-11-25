"use client";

import React, { useState, useMemo } from "react";
import { Plus, Eye, Edit, Trash2, Mail, Phone } from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { toast } from "sonner";
import { Supplier } from "@/types";
import { APP_STRINGS } from "@/constants/strings";

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
    const q = search.trim().toLowerCase();
    return suppliers.filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.company.toLowerCase().includes(q) ||
        s.phone.includes(q)
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
      toast.error(APP_STRINGS.TOASTS.SUPPLIER_NAME_REQUIRED);
      return;
    }
    if (!email.trim()) {
      toast.error(APP_STRINGS.TOASTS.SUPPLIER_EMAIL_REQUIRED);
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
            Maintain authorized vendor contacts, procurement spend, and purchase history.
          </p>
        </div>
        <Button
          onClick={() => openAddOrEditModal()}
          size="lg"
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-sm">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
          placeholder="Search suppliers by vendor name, company, email..."
          className="max-w-md"
        />
        <div className="text-xs text-[#918477] font-medium self-center">
          Showing {filteredSuppliers.length} of {suppliers.length} active suppliers
        </div>
      </Card>

      {/* Suppliers Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-xs font-semibold text-[#765440] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Contact Name</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4 text-center">Purchase Orders</th>
                <th className="py-3.5 px-4 text-right">Procurement Spend</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E2D8]">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#918477]">
                    <p className="font-medium text-sm text-[#593A2C]">No suppliers found</p>
                    <p className="text-xs mt-1">Try another search or add a supplier to your directory</p>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((sup) => {
                  const supplierPOs = purchaseOrders.filter((p) => p.supplierId === sup.id);
                  const totalSpent = supplierPOs
                    .filter((p) => p.status === "received")
                    .reduce((sum, p) => sum + p.totalAmount, 0);

                  return (
                    <tr
                      key={sup.id}
                      className="hover:bg-[#FAF8F5]/60 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-semibold text-[#30251F] group-hover:text-[#593A2C] transition-colors">
                        {sup.name}
                      </td>
                      <td className="py-3.5 px-4 text-[#765440] font-medium">
                        {sup.company}
                      </td>
                      <td className="py-3.5 px-4 text-xs space-y-0.5">
                        <div className="text-[#30251F] flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#A78B73]" />
                          <span>{sup.email}</span>
                        </div>
                        <div className="text-[#918477] flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#A78B73]" />
                          <span>{sup.phone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-semibold text-xs px-2.5 py-1 rounded-full bg-[#F0EBE2] text-[#593A2C]">
                          {supplierPOs.length} POs
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#30251F] text-xs sm:text-sm">
                        {formatCurrency(totalSpent, settings.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSupplierToView(sup)}
                            title="View Supplier File"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openAddOrEditModal(sup)}
                            title="Edit Supplier"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSupplierToDelete(sup)}
                            title="Delete Supplier"
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

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={supplierToEdit ? "Edit Supplier Record" : "Add New Supplier"}
        subtitle="Manage official vendor procurement details and factory locations"
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
          <Input
            label="Contact Person Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rajesh Kumar"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Official Email *"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rajesh@siliconcomp.com"
            />

            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 80 4123 7890"
            />
          </div>

          <Input
            label="Supplier Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Silicon Components Ltd"
          />

          <Input
            label="Warehouse / Factory Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Industrial Area, City"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E2D8]">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              {APP_STRINGS.COMMON.CANCEL}
            </Button>
            <Button variant="primary" type="submit">
              {supplierToEdit ? "Update Supplier" : "Save Supplier"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Supplier Details Modal */}
      {supplierToView && (
        <Modal
          isOpen={Boolean(supplierToView)}
          onClose={() => setSupplierToView(null)}
          title={supplierToView.name}
          subtitle={`Supplier Profile • ${supplierToView.company}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8]">
              <div>
                <span className="text-xs text-[#918477]">Contact Email</span>
                <p className="font-semibold text-[#30251F]">{supplierToView.email}</p>
              </div>
              <div>
                <span className="text-xs text-[#918477]">Phone</span>
                <p className="font-semibold text-[#30251F]">{supplierToView.phone || "—"}</p>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-[#918477]">Factory / Shipping Address</span>
                <p className="font-semibold text-[#30251F]">{supplierToView.address || "—"}</p>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#593A2C] mb-2 block">
                Purchase Order History ({purchaseOrders.filter((p) => p.supplierId === supplierToView.id).length})
              </span>
              <div className="rounded-xl border border-[#E9E2D8] overflow-hidden bg-white max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] font-semibold text-[#765440] border-b border-[#E9E2D8]">
                    <tr>
                      <th className="p-2.5">PO ID</th>
                      <th className="p-2.5">Order Date</th>
                      <th className="p-2.5 text-right">Value</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E2D8]">
                    {purchaseOrders
                      .filter((p) => p.supplierId === supplierToView.id)
                      .map((p) => (
                        <tr key={p.id}>
                          <td className="p-2.5 font-mono font-bold text-[#30251F]">{p.id}</td>
                          <td className="p-2.5 text-[#765440]">{formatDate(p.orderDate)}</td>
                          <td className="p-2.5 text-right font-bold text-[#30251F]">
                            {formatCurrency(p.totalAmount, settings.currency)}
                          </td>
                          <td className="p-2.5 text-center capitalize">{p.status}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E9E2D8]">
              <Button variant="secondary" onClick={() => setSupplierToView(null)}>
                {APP_STRINGS.COMMON.CLOSE}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(supplierToDelete)}
        onClose={() => setSupplierToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Supplier"
        message={`Are you sure you want to remove "${supplierToDelete?.name}" from your active supplier directory?`}
        confirmText="Delete Supplier"
        isDestructive
      />
    </div>
  );
}
