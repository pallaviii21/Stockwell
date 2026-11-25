"use client";

import React, { useState, useEffect } from "react";
import { Building, Save, RotateCcw } from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { CURRENCY_OPTIONS } from "@/constants/inventory";
import { APP_STRINGS } from "@/constants/strings";

export default function SettingsPage() {
  const { settings, updateSettings, resetToSampleData } = useInventoryStore();

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [businessEmail, setBusinessEmail] = useState(settings.businessEmail);
  const [currency, setCurrency] = useState(settings.currency);
  const [dateFormat, setDateFormat] = useState(settings.dateFormat);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  useEffect(() => {
    setBusinessName(settings.businessName);
    setBusinessEmail(settings.businessEmail);
    setCurrency(settings.currency);
    setDateFormat(settings.dateFormat);
    setPhone(settings.phone);
    setAddress(settings.address);
  }, [settings]);

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
    toast.success(APP_STRINGS.TOASTS.SETTINGS_SAVED);
  };

  const handleResetConfirm = () => {
    resetToSampleData();
    setIsResetConfirmOpen(false);
    toast.success(APP_STRINGS.TOASTS.DATA_RESET);
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
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E9E2D8]">
            <Building className="w-5 h-5 text-[#593A2C]" />
            <h2 className="text-xl sm:text-[22px] font-bold text-[#30251F]">Company Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Input
              label="Business Name"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />

            <Input
              label="Business Email"
              type="email"
              required
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
            />

            <Input
              label="Business Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Input
              label="Business Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </Card>

        {/* Currency & Formatting */}
        <Card className="space-y-4">
          <h2 className="text-xl sm:text-[22px] font-bold text-[#30251F] pb-3 border-b border-[#E9E2D8]">
            Regional & Localization
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Select
              label="Primary Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c.code} value={c.symbol}>
                  {c.label}
                </option>
              ))}
            </Select>

            <Select
              label="Date Display Format"
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 25/11/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 11/25/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
            </Select>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="primary" size="lg" type="submit">
            <Save className="w-4 h-4 mr-2" />
            <span>{APP_STRINGS.COMMON.SAVE}</span>
          </Button>
        </div>
      </form>

      {/* Data Management Section */}
      <Card className="border-[#FDE68A] bg-[#FEF9E7]/30 space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#B45309]">Reset Sample Data</h3>
          <p className="text-xs sm:text-sm text-[#765440] mt-1">
            Need to restart or prepare a live demo? Restore all products, sales orders, purchase
            orders, and customer records to their default seed states.
          </p>
        </div>

        <div>
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsResetConfirmOpen(true)}
            className="border-[#B45309] text-[#B45309] hover:bg-[#FEF3C7]"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            <span>Reset to Sample Data</span>
          </Button>
        </div>
      </Card>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetConfirm}
        title="Reset All Sample Data"
        message="Are you sure you want to reset all inventory, orders, customer records, and stock history to initial sample seed data? Any manual edits will be overwritten."
        confirmText="Reset Everything"
        isDestructive={false}
      />
    </div>
  );
}
