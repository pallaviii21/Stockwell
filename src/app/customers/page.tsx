"use client";

import React, { useState, useMemo } from "react";
import { Plus, Eye, Edit, Trash2, Mail, Phone, Building, MapPin, ShoppingCart } from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/ui/SearchInput";
import { toast } from "sonner";
import { Customer } from "@/types";
import { APP_STRINGS } from "@/constants/strings";

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
    const q = search.trim().toLowerCase();
    return customers.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.phone.includes(q)
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
      toast.error(APP_STRINGS.TOASTS.CUSTOMER_NAME_REQUIRED);
      return;
    }
    if (!email.trim()) {
      toast.error(APP_STRINGS.TOASTS.CUSTOMER_EMAIL_REQUIRED);
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
            Maintain customer records, view order history, and track lifetime commercial sales.
          </p>
        </div>
        <Button
          onClick={() => openAddOrEditModal()}
          size="lg"
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-sm">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
          placeholder="Search customers by name, company, email, or phone..."
          className="max-w-md"
        />
        <div className="text-xs text-[#918477] font-medium self-center">
          Showing {filteredCustomers.length} of {customers.length} client accounts
        </div>
      </Card>

      {/* Customers Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#E9E2D8] text-xs font-semibold text-[#765440] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Contact Details</th>
                <th className="py-3.5 px-4 text-center">Total Orders</th>
                <th className="py-3.5 px-4 text-right">Lifetime Purchase</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E2D8]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#918477]">
                    <p className="font-medium text-sm text-[#593A2C]">No customers found</p>
                    <p className="text-xs mt-1">Try another search or add a customer to your directory</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const customerOrders = salesOrders.filter((o) => o.customerId === cust.id);
                  const lifetimeSpend = customerOrders
                    .filter((o) => o.orderStatus === "completed")
                    .reduce((sum, o) => sum + o.totalAmount, 0);

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-[#FAF8F5]/60 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-semibold text-[#30251F] group-hover:text-[#593A2C] transition-colors">
                        {cust.name}
                      </td>
                      <td className="py-3.5 px-4 text-[#765440] font-medium">
                        {cust.company}
                      </td>
                      <td className="py-3.5 px-4 text-xs space-y-0.5">
                        <div className="text-[#30251F] flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#A78B73]" />
                          <span>{cust.email}</span>
                        </div>
                        <div className="text-[#918477] flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#A78B73]" />
                          <span>{cust.phone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-semibold text-xs px-2.5 py-1 rounded-full bg-[#F0EBE2] text-[#593A2C]">
                          {customerOrders.length} orders
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#30251F] text-xs sm:text-sm">
                        {formatCurrency(lifetimeSpend, settings.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCustomerToView(cust)}
                            title="View Customer File"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openAddOrEditModal(cust)}
                            title="Edit Customer"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCustomerToDelete(cust)}
                            title="Delete Customer"
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

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={customerToEdit ? "Edit Customer Record" : "Add Customer"}
        subtitle="Manage client account contact profile and business billing terms"
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
          <Input
            label="Full Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Sharma"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. priya@acme.in"
            />

            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 12345"
            />
          </div>

          <Input
            label="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Acme Tech Solutions"
          />

          <Input
            label="Delivery / Billing Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="City, State, PIN"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E2D8]">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              {APP_STRINGS.COMMON.CANCEL}
            </Button>
            <Button variant="primary" type="submit">
              {customerToEdit ? "Update Customer" : "Save Customer"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Customer Details Modal */}
      {customerToView && (
        <Modal
          isOpen={Boolean(customerToView)}
          onClose={() => setCustomerToView(null)}
          title={customerToView.name}
          subtitle={`Client File • ${customerToView.company}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#E9E2D8]">
              <div>
                <span className="text-xs text-[#918477]">Email</span>
                <p className="font-semibold text-[#30251F]">{customerToView.email}</p>
              </div>
              <div>
                <span className="text-xs text-[#918477]">Phone</span>
                <p className="font-semibold text-[#30251F]">{customerToView.phone || "—"}</p>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-[#918477]">Address</span>
                <p className="font-semibold text-[#30251F]">{customerToView.address || "—"}</p>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#593A2C] mb-2 block">
                Order History ({salesOrders.filter((o) => o.customerId === customerToView.id).length})
              </span>
              <div className="rounded-xl border border-[#E9E2D8] overflow-hidden bg-white max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] font-semibold text-[#765440] border-b border-[#E9E2D8]">
                    <tr>
                      <th className="p-2.5">Order ID</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5 text-right">Amount</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E2D8]">
                    {salesOrders
                      .filter((o) => o.customerId === customerToView.id)
                      .map((o) => (
                        <tr key={o.id}>
                          <td className="p-2.5 font-mono font-bold text-[#30251F]">{o.id}</td>
                          <td className="p-2.5 text-[#765440]">{formatDate(o.orderDate)}</td>
                          <td className="p-2.5 text-right font-bold text-[#30251F]">
                            {formatCurrency(o.totalAmount, settings.currency)}
                          </td>
                          <td className="p-2.5 text-center capitalize">{o.orderStatus}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E9E2D8]">
              <Button variant="secondary" onClick={() => setCustomerToView(null)}>
                {APP_STRINGS.COMMON.CLOSE}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(customerToDelete)}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        message={`Are you sure you want to remove "${customerToDelete?.name}" from your customer directory?`}
        confirmText="Delete Customer"
        isDestructive
      />
    </div>
  );
}
