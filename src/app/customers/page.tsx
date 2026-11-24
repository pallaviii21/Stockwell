"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building,
  MapPin,
  ShoppingCart,
} from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { Customer } from "@/types";

export default function CustomersPage() {
  const { customers, salesOrders, settings, addCustomer, updateCustomer, deleteCustomer } =
    useInventoryStore();

  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerToView, setCustomerToView] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );
  }, [customers, search]);

  const openAddOrEditModal = (cust?: Customer) => {
    if (cust) {
      setCustomerToEdit(cust);
      setName(cust.name);
      setEmail(cust.email);
      setPhone(cust.phone);
      setCompany(cust.company);
      setAddress(cust.address);
    } else {
      setCustomerToEdit(null);
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
      toast.error("Customer name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Customer email is required");
      return;
    }

    if (customerToEdit) {
      updateCustomer(customerToEdit.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim(),
        address: address.trim(),
      });
      toast.success(`Customer "${name}" updated successfully`);
    } else {
      addCustomer({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim(),
        address: address.trim(),
      });
      toast.success(`Customer "${name}" created successfully`);
    }

    setIsAddModalOpen(false);
    setCustomerToEdit(null);
  };

  const handleDeleteConfirm = () => {
    if (!customerToDelete) return;
    deleteCustomer(customerToDelete.id);
    toast.success(`Customer "${customerToDelete.name}" deleted`);
    setCustomerToDelete(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E9E2D8]">
        <div>
          <h1 className="text-[32px] sm:text-[34px] font-bold text-[#30251F] tracking-tight leading-tight">
            Customers
          </h1>
          <p className="text-sm sm:text-base text-[#918477] mt-1">
            Manage your client directory, contact records, and lifetime order volumes.
          </p>
        </div>
        <button
          onClick={() => openAddOrEditModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#593A2C] hover:bg-[#472E23] text-white text-sm sm:text-base font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
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
            placeholder="Search by customer name, email, or company..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] placeholder-[#918477] focus:border-[#593A2C] focus:bg-white outline-none transition-colors text-sm"
          />
        </div>
        <span className="text-[#918477] text-xs sm:text-sm hidden sm:inline-block">
          {filteredCustomers.length} registered accounts
        </span>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl border border-[#E9E2D8] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-xs sm:text-sm text-[#918477]">
                <th className="py-3 px-4 font-semibold">Customer Name</th>
                <th className="py-3 px-4 font-semibold">Company</th>
                <th className="py-3 px-4 font-semibold">Contact Details</th>
                <th className="py-3 px-4 font-semibold text-center">Total Orders</th>
                <th className="py-3 px-4 font-semibold text-right">Lifetime Sales</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E2D8] text-sm sm:text-base">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#918477]">
                    <Users className="w-8 h-8 text-[#A78B73] mx-auto mb-2 opacity-50" />
                    <p className="font-medium text-sm text-[#30251F]">No customers found</p>
                    <p className="text-xs mt-1">Add your first customer to begin recording orders.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const customerOrders = salesOrders.filter((o) => o.customerId === c.id);
                  const totalSpend = customerOrders
                    .filter((o) => o.orderStatus === "completed")
                    .reduce((sum, o) => sum + o.totalAmount, 0);

                  return (
                    <tr key={c.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#30251F]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#F0EBE2] text-[#593A2C] flex items-center justify-center font-bold text-xs shrink-0">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold block">{c.name}</span>
                            <span className="text-[10px] text-[#918477]">ID: {c.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#593A2C] font-medium">{c.company}</td>
                      <td className="py-3.5 px-4 text-[#765440]">
                        <span className="block">{c.email}</span>
                        <span className="text-[11px] text-[#918477]">{c.phone}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-[#30251F]">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F0EBE2] text-[#593A2C]">
                          {customerOrders.length} orders
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#2E6930]">
                        {formatCurrency(totalSpend, settings.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setCustomerToView(c)}
                            className="p-1.5 text-[#918477] hover:text-[#593A2C] hover:bg-[#F0EBE2] rounded-lg transition-colors"
                            title="View Customer File"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openAddOrEditModal(c)}
                            className="p-1.5 text-[#918477] hover:text-[#30251F] hover:bg-[#F0EBE2] rounded-lg transition-colors"
                            title="Edit Customer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCustomerToDelete(c)}
                            className="p-1.5 text-[#918477] hover:text-[#B91C1C] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                            title="Delete Customer"
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

      {/* ADD / EDIT CUSTOMER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={customerToEdit ? "Edit Customer Account" : "Add New Customer"}
        subtitle="Maintain verified billing and shipping client information"
        maxWidth="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#593A2C] mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Nair"
              className="w-full px-3 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#593A2C] mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. priya@company.io"
              className="w-full px-3 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#593A2C] mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98452 31908"
              className="w-full px-3 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#593A2C] mb-1">Company / Organization</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. InnovaTex Labs"
              className="w-full px-3 py-2 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#593A2C] mb-1">Billing / Shipping Address</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="City, State, Postal Code"
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
              {customerToEdit ? "Save Changes" : "Create Customer"}
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW CUSTOMER DETAILS & SALES HISTORY */}
      {customerToView && (
        <Modal
          isOpen={Boolean(customerToView)}
          onClose={() => setCustomerToView(null)}
          title={`Customer: ${customerToView.name}`}
          subtitle={`Organization: ${customerToView.company}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8]">
              <div>
                <span className="text-[#918477] block text-[11px]">Email</span>
                <span className="font-semibold text-[#30251F]">{customerToView.email}</span>
              </div>
              <div>
                <span className="text-[#918477] block text-[11px]">Phone</span>
                <span className="font-semibold text-[#30251F]">{customerToView.phone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#918477] block text-[11px]">Address</span>
                <span className="text-[#30251F]">{customerToView.address || "N/A"}</span>
              </div>
            </div>

            {/* Customer's Sales History */}
            <div>
              <h4 className="font-semibold text-[#30251F] mb-2 flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-[#593A2C]" />
                <span>Order History</span>
              </h4>
              <div className="border border-[#E9E2D8] rounded-xl overflow-hidden bg-white max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-[11px] text-[#918477]">
                      <th className="p-2.5 font-semibold">Order ID</th>
                      <th className="p-2.5 font-semibold">Date</th>
                      <th className="p-2.5 font-semibold">Status</th>
                      <th className="p-2.5 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E2D8]">
                    {salesOrders.filter((o) => o.customerId === customerToView.id).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-[#918477]">
                          No purchase history for this customer.
                        </td>
                      </tr>
                    ) : (
                      salesOrders
                        .filter((o) => o.customerId === customerToView.id)
                        .map((order) => (
                          <tr key={order.id}>
                            <td className="p-2.5 font-mono font-semibold text-[#593A2C]">
                              {order.id}
                            </td>
                            <td className="p-2.5 text-[#765440]">{formatDate(order.orderDate)}</td>
                            <td className="p-2.5">
                              <span className="capitalize">{order.orderStatus}</span>
                            </td>
                            <td className="p-2.5 text-right font-bold text-[#30251F]">
                              {formatCurrency(order.totalAmount, settings.currency)}
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
                onClick={() => setCustomerToView(null)}
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
        isOpen={Boolean(customerToDelete)}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        message={`Are you sure you want to delete customer "${customerToDelete?.name}"? Historical orders will remain preserved for accounting.`}
        confirmText="Delete Customer"
        isDestructive={true}
      />
    </div>
  );
}
