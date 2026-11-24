"use client";

import React, { useState } from "react";
import { Sliders, RefreshCw, Save, Building, Globe, Check } from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { toast } from "sonner";

export default function SettingsPage() {
  const { settings, updateSettings, resetToSampleData } = useInventoryStore();

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [businessEmail, setBusinessEmail] = useState(settings.businessEmail);
  const [currency, setCurrency] = useState(settings.currency);
  const [dateFormat, setDateFormat] = useState(settings.dateFormat);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName: businessName.trim(),
      businessEmail: businessEmail.trim(),
      currency,
      dateFormat,
      phone: phone.trim(),
      address: address.trim(),
    });
    toast.success("Settings updated successfully");
  };

  const handleResetData = () => {
    if (
      confirm(
        "Are you sure you want to reset all inventory, orders, and customer data to default sample seed data?"
      )
    ) {
      resetToSampleData();
      toast.success("Sample seed data restored successfully");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-3 border-b border-[#E9E2D8]">
        <h1 className="text-[32px] sm:text-[34px] font-bold text-[#30251F] tracking-tight leading-tight">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-[#918477] mt-1">
          Configure business profile, currency conventions, and data management.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E9E2D8] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E9E2D8]">
            <Building className="w-5 h-5 text-[#593A2C]" />
            <h2 className="text-xl sm:text-[22px] font-bold text-[#30251F]">Company Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block font-semibold text-[#593A2C] mb-1">Business Name</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#593A2C] mb-1">Business Email</label>
              <input
                type="email"
                required
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#593A2C] mb-1">Business Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#593A2C] mb-1">Business Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Currency & Regional Preferences */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E9E2D8] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E9E2D8]">
            <Globe className="w-5 h-5 text-[#593A2C]" />
            <h2 className="text-xl sm:text-[22px] font-bold text-[#30251F]">Regional & Currency Formatting</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block font-semibold text-[#593A2C] mb-1">Currency Symbol</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
              >
                <option value="₹">INR (₹) — Indian Rupee (Default)</option>
                <option value="$">USD ($) — US Dollar</option>
                <option value="€">EUR (€) — Euro</option>
                <option value="£">GBP (£) — British Pound</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#593A2C] mb-1">Date Format</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E2D8] bg-[#FAF8F5] text-[#30251F] focus:border-[#593A2C] outline-none text-sm"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (Standard)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Design System & Aesthetic Information */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E9E2D8] shadow-sm space-y-3">
          <h2 className="text-xl sm:text-[22px] font-bold text-[#30251F]">Theme & Palette Identity</h2>
          <p className="text-sm text-[#918477]">
            Stockwell uses a warm beige, cream, and brown aesthetic inspired by premium minimalist
            SaaS design.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-sm">
            <div className="p-3 rounded-xl border border-[#E9E2D8] bg-[#F8F6F1] flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-md bg-[#F8F6F1] border border-[#E9E2D8]"></span>
              <span className="font-mono text-xs text-[#593A2C]">#F8F6F1 (Bg)</span>
            </div>
            <div className="p-3 rounded-xl border border-[#E9E2D8] bg-[#F0EBE2] flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-md bg-[#F0EBE2] border border-[#E9E2D8]"></span>
              <span className="font-mono text-xs text-[#593A2C]">#F0EBE2 (Sidebar)</span>
            </div>
            <div className="p-3 rounded-xl border border-[#E9E2D8] bg-white flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-md bg-[#593A2C]"></span>
              <span className="font-mono text-xs text-[#593A2C]">#593A2C (Primary)</span>
            </div>
            <div className="p-3 rounded-xl border border-[#E9E2D8] bg-white flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-md bg-[#A78B73]"></span>
              <span className="font-mono text-xs text-[#593A2C]">#A78B73 (Taupe)</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E9E2D8] bg-white hover:bg-[#FEE2E2]/50 text-sm font-semibold text-[#B91C1C] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Sample Data</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#593A2C] hover:bg-[#472E23] text-white text-sm sm:text-base font-semibold shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
