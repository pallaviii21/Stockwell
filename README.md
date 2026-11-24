# Stockwell — Premium Inventory Management SaaS

> **Tagline:** Inventory, sales and purchasing — beautifully organized.

Stockwell is a full-featured, minimalist, and elegant B2B Inventory Management SaaS web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Zustand**, and **Recharts**.

Inspired functionally by **Zoho Inventory** and aesthetically by **Linear** and modern warm-toned design systems, Stockwell provides small business owners and operations teams with a calm, sophisticated interface to manage products, sales orders, purchase orders, stock movements, customers, suppliers, and financial reports.

---

## 🎨 Design System & Aesthetic

Stockwell embraces a warm beige, cream, and brown aesthetic:

- **Main background:** `#F8F6F1`
- **Sidebar background:** `#F0EBE2`
- **Card background:** `#FFFFFF`
- **Primary brown:** `#593A2C`
- **Secondary brown:** `#765440`
- **Taupe:** `#A78B73`
- **Borders:** `#E9E2D8`
- **Primary typography:** `#30251F`
- **Muted text:** `#918477`

### Status Indicators
- **In Stock / Completed / Received / Paid:** `#EBF5ED` with `#2E6930`
- **Low Stock / Pending / Ordered / Partial:** `#FEF3C7` with `#B45309`
- **Out of Stock / Unpaid:** `#FEE2E2` with `#B91C1C`
- **Cancelled / Draft:** `#F3F4F6` with `#4B5563`

---

## 🚀 Key Modules & Capabilities

### 1. Dashboard Overview (`/`)
- Dynamic metric cards (Total Products, Wholesale Inventory Value, Completed Sales Revenue, Low Stock Alerts).
- Interactive **Sales Overview Area Chart** with time-range filtering (Today, 7 Days, 30 Days, All Time).
- **Inventory Health Donut Chart** displaying In Stock, Low Stock, and Out of Stock distribution.
- **Low Stock Alerts Table** with 1-click restock actions.
- **Recent Transactions & Live Activity Feed**.
- **Quick Action Triggers** (`+ Add Product`, `+ New Sale`, `+ New Purchase`, `Adjust Stock`).

### 2. Products Catalogue (`/products`)
- Full inventory catalogue with Name, SKU, Category, Purchase Price, Selling Price, Available Units, and Dynamic Status.
- Real-time search and dual filtering by Category and Stock Status.
- Column sorting by Name, Selling Price, and Stock Quantity.
- Product Details Modal showing gross profit margins and vendor relationships.
- Add, Edit, and Delete (with confirmation dialog) workflows.

### 3. Sales Management (`/sales`)
- Complete customer order tracking with Payment Status and Order Status badges.
- Create Sales Order slide-over modal with multi-product line items, unit price customization, and subtotal calculation.
- **Automated Inventory Logic:**
  - Marking an order **Completed** validates stock sufficiency and automatically deducts units.
  - Generates outgoing `sale` stock movement audit logs.
  - Prevents negative inventory.
  - Automatically restores inventory if a completed order is cancelled or deleted.
  - Guards against duplicate deductions.

### 4. Purchase Management (`/purchases`)
- Inbound supplier purchase order tracking with Expected Delivery dates.
- Create Purchase Order modal with line items and automatic procurement cost calculation.
- **Automated Replenishment Logic:**
  - Marking a PO **Received** automatically increments stock levels for each item.
  - Generates incoming `purchase` stock movement audit logs.
  - Guards against duplicate additions.

### 5. Stock & Movements (`/stock`)
- Top metric cards: Total SKUs, Total Physical Warehouse Units, Low Stock items, Out of Stock items.
- **Current Inventory Tab:** Real-time stock status, minimum thresholds, and 1-click adjustment triggers.
- **Stock History & Audit Log Tab:** Comprehensive immutable log recording Date/Time, Reference ID, Product, Movement Type (`purchase`, `sale`, `adjustment`), Quantity Delta (Green `+` / Red `-`), Previous Qty, New Qty, and Reason.
- **Manual Stock Adjustment Modal:** Add, subtract, or set exact counts with live preview and negative-stock prevention.

### 6. Reports & Analytics (`/reports`)
- **Sales Report:** Total revenue, fulfilled orders, pending orders, revenue trend chart, and itemized sales log.
- **Purchase Report:** Total procurement spend, received orders, in-transit orders, and vendor spending chart.
- **Stock Valuation Report:** Warehouse cost valuation, potential retail revenue, product-by-product valuation, and profit margins.
- **1-Click CSV Export** for all three report categories.

### 7. Customer Directory (`/customers`)
- Client database with company names, emails, phone numbers, and addresses.
- Lifetime sales totals and order counts.
- Customer file modal with integrated purchase order history.

### 8. Supplier Directory (`/suppliers`)
- Vendor registry with official contacts and factory addresses.
- Procurement volume tracking and dispatched PO history.

### 9. Settings (`/settings`)
- Business Profile (Name, Email, Phone, Address).
- Currency selection (Default `₹` INR, `$`, `€`, `£`).
- Date format selector.
- **Reset to Sample Data button** to quickly restore seed demonstrations.

### 10. Global Search & Notifications (`Header`)
- Global Search modal (`⌘K` or search icon) to search across products, sales orders, customers, and suppliers with direct navigation.
- Notification dropdown with real-time low stock warnings and recent activity events.
- Live system date indicator.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 14 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) with LocalStorage persistence
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/)

---

## 🏃 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:4000](http://localhost:4000) in your browser.

> **Note on Windows Port Reservation:** If Windows reports `EACCES: permission denied` on port 4000 due to Hyper-V/WinNAT port exclusion ranges, start on port 4001:
> ```bash
> npm run dev -- -p 4001
> ```

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 📦 Vercel Deployment

Stockwell is fully optimized for single-click deployment to Vercel:
1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Next.js App Router settings will be automatically detected.
4. Deploy!
