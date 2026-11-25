export const PRODUCT_CATEGORIES = [
  "Accessories",
  "Peripherals",
  "Displays",
  "Audio",
  "Cables",
  "Storage",
  "Networking",
  "Power & Batteries",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const DATE_FILTER_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 days" },
  { value: "30days", label: "Last 30 days" },
  { value: "all", label: "All time" },
] as const;

export const CURRENCY_OPTIONS = [
  { symbol: "₹", code: "INR", label: "Indian Rupee (₹)" },
  { symbol: "$", code: "USD", label: "US Dollar ($)" },
  { symbol: "€", code: "EUR", label: "Euro (€)" },
  { symbol: "£", code: "GBP", label: "British Pound (£)" },
] as const;

export const DEFAULT_MIN_STOCK_LEVEL = 10;
