import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  Product,
  Customer,
  Supplier,
  SalesOrder,
  PurchaseOrder,
  StockMovement,
  Activity,
  BusinessSettings,
  StockAdjustmentPayload,
  OrderStatus,
  PurchaseStatus,
} from "@/types";
import {
  initialProducts,
  initialCustomers,
  initialSuppliers,
  initialSalesOrders,
  initialPurchaseOrders,
  initialStockMovements,
  initialActivities,
  initialSettings,
} from "@/lib/seed-data";
import { calculateStockStatus } from "@/lib/utils";

interface InventoryState {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  salesOrders: SalesOrder[];
  purchaseOrders: PurchaseOrder[];
  stockMovements: StockMovement[];
  activities: Activity[];
  settings: BusinessSettings;
  isHydrated: boolean;

  setHydrated: () => void;

  // Product Actions
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => { success: boolean; error?: string };
  updateProduct: (id: string, product: Partial<Product>) => { success: boolean; error?: string };
  deleteProduct: (id: string) => { success: boolean; error?: string };

  // Customer Actions
  addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Supplier Actions
  addSupplier: (supplier: Omit<Supplier, "id" | "createdAt">) => Supplier;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Sales Order Actions
  createSalesOrder: (
    order: Omit<SalesOrder, "id" | "createdAt" | "updatedAt" | "inventoryDeducted">
  ) => { success: boolean; error?: string; order?: SalesOrder };
  updateSalesOrder: (
    id: string,
    order: Partial<SalesOrder>
  ) => { success: boolean; error?: string };
  deleteSalesOrder: (id: string) => { success: boolean; error?: string };

  // Purchase Order Actions
  createPurchaseOrder: (
    order: Omit<PurchaseOrder, "id" | "createdAt" | "updatedAt" | "inventoryAdded">
  ) => { success: boolean; error?: string; order?: PurchaseOrder };
  updatePurchaseOrder: (
    id: string,
    order: Partial<PurchaseOrder>
  ) => { success: boolean; error?: string };
  deletePurchaseOrder: (id: string) => { success: boolean; error?: string };

  // Stock Adjustment
  adjustStock: (payload: StockAdjustmentPayload) => { success: boolean; error?: string };

  // Settings & Utilities
  updateSettings: (settings: Partial<BusinessSettings>) => void;
  resetToSampleData: () => void;

  // Computed helper methods
  getMetrics: () => {
    totalProducts: number;
    inventoryValue: number;
    totalSales: number;
    lowStockCount: number;
    outOfStockCount: number;
    inStockCount: number;
    totalUnits: number;
  };
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      products: initialProducts,
      customers: initialCustomers,
      suppliers: initialSuppliers,
      salesOrders: initialSalesOrders,
      purchaseOrders: initialPurchaseOrders,
      stockMovements: initialStockMovements,
      activities: initialActivities,
      settings: initialSettings,
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      // PRODUCT ACTIONS
      addProduct: (productData) => {
        const id = `PROD-${Date.now().toString().slice(-4)}`;
        const now = new Date().toISOString();
        const newProduct: Product = {
          ...productData,
          id,
          createdAt: now,
          updatedAt: now,
        };

        const newActivity: Activity = {
          id: `ACT-${Date.now()}`,
          type: "product",
          title: "Product Added",
          description: `Added "${newProduct.name}" (${newProduct.sku}) to catalogue`,
          timestamp: now,
          referenceId: id,
        };

        const newMovements: StockMovement[] = [];
        if (newProduct.stockQuantity > 0) {
          newMovements.push({
            id: `SM-${Date.now()}`,
            date: now,
            referenceId: `OPEN-${newProduct.sku}`,
            productId: id,
            productName: newProduct.name,
            sku: newProduct.sku,
            type: "adjustment",
            quantityChange: newProduct.stockQuantity,
            previousQuantity: 0,
            newQuantity: newProduct.stockQuantity,
            reason: "Opening stock balance",
            createdAt: now,
          });
        }

        set((state) => ({
          products: [newProduct, ...state.products],
          activities: [newActivity, ...state.activities],
          stockMovements: [...newMovements, ...state.stockMovements],
        }));

        return { success: true };
      },

      updateProduct: (id, productData) => {
        const now = new Date().toISOString();
        let updated = false;

        set((state) => {
          const products = state.products.map((p) => {
            if (p.id === id) {
              updated = true;
              return { ...p, ...productData, updatedAt: now };
            }
            return p;
          });
          return { products };
        });

        return { success: updated };
      },

      deleteProduct: (id) => {
        const product = get().products.find((p) => p.id === id);
        if (!product) return { success: false, error: "Product not found" };

        const now = new Date().toISOString();
        const newActivity: Activity = {
          id: `ACT-${Date.now()}`,
          type: "product",
          title: "Product Removed",
          description: `Removed "${product.name}" (${product.sku}) from catalogue`,
          timestamp: now,
          referenceId: id,
        };

        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          activities: [newActivity, ...state.activities],
        }));

        return { success: true };
      },

      // CUSTOMER ACTIONS
      addCustomer: (customerData) => {
        const id = `CUST-${Date.now().toString().slice(-4)}`;
        const newCustomer: Customer = {
          ...customerData,
          id,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          customers: [newCustomer, ...state.customers],
        }));

        return newCustomer;
      },

      updateCustomer: (id, customerData) => {
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...customerData } : c)),
        }));
      },

      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }));
      },

      // SUPPLIER ACTIONS
      addSupplier: (supplierData) => {
        const id = `SUP-${Date.now().toString().slice(-4)}`;
        const newSupplier: Supplier = {
          ...supplierData,
          id,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          suppliers: [newSupplier, ...state.suppliers],
        }));

        return newSupplier;
      },

      updateSupplier: (id, supplierData) => {
        set((state) => ({
          suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...supplierData } : s)),
        }));
      },

      deleteSupplier: (id) => {
        set((state) => ({
          suppliers: state.suppliers.filter((s) => s.id !== id),
        }));
      },

      // SALES ORDER ACTIONS
      createSalesOrder: (orderData) => {
        const state = get();
        const id = `SO-${Date.now().toString().slice(-4)}`;
        const now = new Date().toISOString();

        const isCompleted = orderData.orderStatus === "completed";

        // If completed right away, validate stock for all items
        if (isCompleted) {
          for (const item of orderData.items) {
            const product = state.products.find((p) => p.id === item.productId);
            if (!product) {
              return { success: false, error: `Product "${item.productName}" not found.` };
            }
            if (product.stockQuantity < item.quantity) {
              return {
                success: false,
                error: `Insufficient stock for "${item.productName}". Available: ${product.stockQuantity}, Required: ${item.quantity}. Stock cannot be negative.`,
              };
            }
          }
        }

        const newOrder: SalesOrder = {
          ...orderData,
          id,
          inventoryDeducted: isCompleted,
          createdAt: now,
          updatedAt: now,
        };

        const newMovements: StockMovement[] = [];
        let updatedProducts = [...state.products];

        if (isCompleted) {
          // Deduct stock and build movements
          orderData.items.forEach((item, index) => {
            const productIndex = updatedProducts.findIndex((p) => p.id === item.productId);
            if (productIndex !== -1) {
              const prev = updatedProducts[productIndex].stockQuantity;
              const next = prev - item.quantity;
              updatedProducts[productIndex] = {
                ...updatedProducts[productIndex],
                stockQuantity: next,
                updatedAt: now,
              };

              newMovements.push({
                id: `SM-${Date.now()}-${index}`,
                date: now,
                referenceId: id,
                productId: item.productId,
                productName: item.productName,
                sku: item.sku,
                type: "sale",
                quantityChange: -item.quantity,
                previousQuantity: prev,
                newQuantity: next,
                reason: `Sales order ${id} completed`,
                createdAt: now,
              });
            }
          });
        }

        const newActivity: Activity = {
          id: `ACT-${Date.now()}`,
          type: "sale",
          title: isCompleted ? "Sale Completed" : "New Sale Created",
          description: `Order ${id} for ${orderData.customerName} (${state.settings.currency}${orderData.totalAmount.toLocaleString()}) - Status: ${orderData.orderStatus}`,
          timestamp: now,
          referenceId: id,
        };

        set((current) => ({
          salesOrders: [newOrder, ...current.salesOrders],
          products: updatedProducts,
          stockMovements: [...newMovements, ...current.stockMovements],
          activities: [newActivity, ...current.activities],
        }));

        return { success: true, order: newOrder };
      },

      updateSalesOrder: (id, updateData) => {
        const state = get();
        const existingOrder = state.salesOrders.find((o) => o.id === id);
        if (!existingOrder) return { success: false, error: "Order not found" };

        const now = new Date().toISOString();
        const nextStatus = updateData.orderStatus || existingOrder.orderStatus;
        const willBeCompleted = nextStatus === "completed";
        const wasCompleted = existingOrder.orderStatus === "completed" && existingOrder.inventoryDeducted;

        let updatedProducts = [...state.products];
        const newMovements: StockMovement[] = [];

        // CASE 1: Transitioning from Pending/Draft/Cancelled to Completed
        if (!wasCompleted && willBeCompleted) {
          // Check stock sufficiency
          for (const item of existingOrder.items) {
            const product = updatedProducts.find((p) => p.id === item.productId);
            if (!product || product.stockQuantity < item.quantity) {
              return {
                success: false,
                error: `Cannot complete order: Insufficient stock for ${item.productName}. Available: ${product ? product.stockQuantity : 0}, Required: ${item.quantity}`,
              };
            }
          }

          // Deduct stock
          existingOrder.items.forEach((item, index) => {
            const prodIdx = updatedProducts.findIndex((p) => p.id === item.productId);
            if (prodIdx !== -1) {
              const prev = updatedProducts[prodIdx].stockQuantity;
              const next = prev - item.quantity;
              updatedProducts[prodIdx] = {
                ...updatedProducts[prodIdx],
                stockQuantity: next,
                updatedAt: now,
              };

              newMovements.push({
                id: `SM-${Date.now()}-${index}`,
                date: now,
                referenceId: id,
                productId: item.productId,
                productName: item.productName,
                sku: item.sku,
                type: "sale",
                quantityChange: -item.quantity,
                previousQuantity: prev,
                newQuantity: next,
                reason: `Sales order ${id} marked completed`,
                createdAt: now,
              });
            }
          });
        }
        // CASE 2: Transitioning from Completed to Cancelled (Restock back!)
        else if (wasCompleted && nextStatus === "cancelled") {
          existingOrder.items.forEach((item, index) => {
            const prodIdx = updatedProducts.findIndex((p) => p.id === item.productId);
            if (prodIdx !== -1) {
              const prev = updatedProducts[prodIdx].stockQuantity;
              const next = prev + item.quantity;
              updatedProducts[prodIdx] = {
                ...updatedProducts[prodIdx],
                stockQuantity: next,
                updatedAt: now,
              };

              newMovements.push({
                id: `SM-${Date.now()}-${index}`,
                date: now,
                referenceId: id,
                productId: item.productId,
                productName: item.productName,
                sku: item.sku,
                type: "adjustment",
                quantityChange: item.quantity,
                previousQuantity: prev,
                newQuantity: next,
                reason: `Sales order ${id} cancelled - inventory restored`,
                createdAt: now,
              });
            }
          });
        }

        const updatedOrder: SalesOrder = {
          ...existingOrder,
          ...updateData,
          inventoryDeducted: nextStatus === "completed" ? true : nextStatus === "cancelled" ? false : existingOrder.inventoryDeducted,
          updatedAt: now,
        };

        const activityTitle =
          willBeCompleted && !wasCompleted
            ? "Sale Completed"
            : nextStatus === "cancelled" && wasCompleted
            ? "Sale Cancelled"
            : "Sale Order Updated";

        const newActivity: Activity = {
          id: `ACT-${Date.now()}`,
          type: "sale",
          title: activityTitle,
          description: `Order ${id} updated (Status: ${nextStatus})`,
          timestamp: now,
          referenceId: id,
        };

        set((current) => ({
          salesOrders: current.salesOrders.map((o) => (o.id === id ? updatedOrder : o)),
          products: updatedProducts,
          stockMovements: [...newMovements, ...current.stockMovements],
          activities: [newActivity, ...current.activities],
        }));

        return { success: true };
      },

      deleteSalesOrder: (id) => {
        const order = get().salesOrders.find((o) => o.id === id);
        if (!order) return { success: false, error: "Order not found" };

        // If completed and inventory was deducted, restore stock
        let updatedProducts = [...get().products];
        const newMovements: StockMovement[] = [];
        const now = new Date().toISOString();

        if (order.orderStatus === "completed" && order.inventoryDeducted) {
          order.items.forEach((item, index) => {
            const prodIdx = updatedProducts.findIndex((p) => p.id === item.productId);
            if (prodIdx !== -1) {
              const prev = updatedProducts[prodIdx].stockQuantity;
              const next = prev + item.quantity;
              updatedProducts[prodIdx] = {
                ...updatedProducts[prodIdx],
                stockQuantity: next,
                updatedAt: now,
              };

              newMovements.push({
                id: `SM-${Date.now()}-${index}`,
                date: now,
                referenceId: id,
                productId: item.productId,
                productName: item.productName,
                sku: item.sku,
                type: "adjustment",
                quantityChange: item.quantity,
                previousQuantity: prev,
                newQuantity: next,
                reason: `Sales order ${id} deleted - stock restored`,
                createdAt: now,
              });
            }
          });
        }

        set((state) => ({
          salesOrders: state.salesOrders.filter((o) => o.id !== id),
          products: updatedProducts,
          stockMovements: [...newMovements, ...state.stockMovements],
        }));

        return { success: true };
      },

      // PURCHASE ORDER ACTIONS
      createPurchaseOrder: (orderData) => {
        const state = get();
        const id = `PO-${Date.now().toString().slice(-4)}`;
        const now = new Date().toISOString();

        const isReceived = orderData.status === "received";

        const newOrder: PurchaseOrder = {
          ...orderData,
          id,
          inventoryAdded: isReceived,
          createdAt: now,
          updatedAt: now,
        };

        const newMovements: StockMovement[] = [];
        let updatedProducts = [...state.products];

        if (isReceived) {
          orderData.items.forEach((item, index) => {
            const prodIdx = updatedProducts.findIndex((p) => p.id === item.productId);
            if (prodIdx !== -1) {
              const prev = updatedProducts[prodIdx].stockQuantity;
              const next = prev + item.quantity;
              updatedProducts[prodIdx] = {
                ...updatedProducts[prodIdx],
                stockQuantity: next,
                updatedAt: now,
              };

              newMovements.push({
                id: `SM-${Date.now()}-${index}`,
                date: now,
                referenceId: id,
                productId: item.productId,
                productName: item.productName,
                sku: item.sku,
                type: "purchase",
                quantityChange: item.quantity,
                previousQuantity: prev,
                newQuantity: next,
                reason: `Purchase order ${id} received`,
                createdAt: now,
              });
            }
          });
        }

        const newActivity: Activity = {
          id: `ACT-${Date.now()}`,
          type: "purchase",
          title: isReceived ? "Purchase Received" : "Purchase Order Created",
          description: `PO ${id} for ${orderData.supplierName} (${state.settings.currency}${orderData.totalAmount.toLocaleString()}) - Status: ${orderData.status}`,
          timestamp: now,
          referenceId: id,
        };

        set((current) => ({
          purchaseOrders: [newOrder, ...current.purchaseOrders],
          products: updatedProducts,
          stockMovements: [...newMovements, ...current.stockMovements],
          activities: [newActivity, ...current.activities],
        }));

        return { success: true, order: newOrder };
      },

      updatePurchaseOrder: (id, updateData) => {
        const state = get();
        const existingOrder = state.purchaseOrders.find((o) => o.id === id);
        if (!existingOrder) return { success: false, error: "Purchase order not found" };

        const now = new Date().toISOString();
        const nextStatus = updateData.status || existingOrder.status;
        const willBeReceived = nextStatus === "received";
        const wasReceived = existingOrder.status === "received" && existingOrder.inventoryAdded;

        let updatedProducts = [...state.products];
        const newMovements: StockMovement[] = [];

        // CASE 1: Transitioning from Pending/Ordered to Received
        if (!wasReceived && willBeReceived) {
          existingOrder.items.forEach((item, index) => {
            const prodIdx = updatedProducts.findIndex((p) => p.id === item.productId);
            if (prodIdx !== -1) {
              const prev = updatedProducts[prodIdx].stockQuantity;
              const next = prev + item.quantity;
              updatedProducts[prodIdx] = {
                ...updatedProducts[prodIdx],
                stockQuantity: next,
                updatedAt: now,
              };

              newMovements.push({
                id: `SM-${Date.now()}-${index}`,
                date: now,
                referenceId: id,
                productId: item.productId,
                productName: item.productName,
                sku: item.sku,
                type: "purchase",
                quantityChange: item.quantity,
                previousQuantity: prev,
                newQuantity: next,
                reason: `Purchase order ${id} marked received`,
                createdAt: now,
              });
            }
          });
        }
        // CASE 2: Transitioning from Received to Cancelled (Reverse inventory if available)
        else if (wasReceived && nextStatus === "cancelled") {
          existingOrder.items.forEach((item, index) => {
            const prodIdx = updatedProducts.findIndex((p) => p.id === item.productId);
            if (prodIdx !== -1) {
              const prev = updatedProducts[prodIdx].stockQuantity;
              const next = Math.max(0, prev - item.quantity);
              updatedProducts[prodIdx] = {
                ...updatedProducts[prodIdx],
                stockQuantity: next,
                updatedAt: now,
              };

              newMovements.push({
                id: `SM-${Date.now()}-${index}`,
                date: now,
                referenceId: id,
                productId: item.productId,
                productName: item.productName,
                sku: item.sku,
                type: "adjustment",
                quantityChange: -(prev - next),
                previousQuantity: prev,
                newQuantity: next,
                reason: `Purchase order ${id} cancelled - inventory removed`,
                createdAt: now,
              });
            }
          });
        }

        const updatedOrder: PurchaseOrder = {
          ...existingOrder,
          ...updateData,
          inventoryAdded: nextStatus === "received" ? true : nextStatus === "cancelled" ? false : existingOrder.inventoryAdded,
          updatedAt: now,
        };

        const newActivity: Activity = {
          id: `ACT-${Date.now()}`,
          type: "purchase",
          title: willBeReceived && !wasReceived ? "Purchase Received" : "Purchase Order Updated",
          description: `PO ${id} updated (Status: ${nextStatus})`,
          timestamp: now,
          referenceId: id,
        };

        set((current) => ({
          purchaseOrders: current.purchaseOrders.map((o) => (o.id === id ? updatedOrder : o)),
          products: updatedProducts,
          stockMovements: [...newMovements, ...current.stockMovements],
          activities: [newActivity, ...current.activities],
        }));

        return { success: true };
      },

      deletePurchaseOrder: (id) => {
        const order = get().purchaseOrders.find((o) => o.id === id);
        if (!order) return { success: false, error: "Order not found" };

        let updatedProducts = [...get().products];
        const newMovements: StockMovement[] = [];
        const now = new Date().toISOString();

        if (order.status === "received" && order.inventoryAdded) {
          order.items.forEach((item, index) => {
            const prodIdx = updatedProducts.findIndex((p) => p.id === item.productId);
            if (prodIdx !== -1) {
              const prev = updatedProducts[prodIdx].stockQuantity;
              const next = Math.max(0, prev - item.quantity);
              updatedProducts[prodIdx] = {
                ...updatedProducts[prodIdx],
                stockQuantity: next,
                updatedAt: now,
              };

              newMovements.push({
                id: `SM-${Date.now()}-${index}`,
                date: now,
                referenceId: id,
                productId: item.productId,
                productName: item.productName,
                sku: item.sku,
                type: "adjustment",
                quantityChange: -(prev - next),
                previousQuantity: prev,
                newQuantity: next,
                reason: `PO ${id} deleted - stock reversed`,
                createdAt: now,
              });
            }
          });
        }

        set((state) => ({
          purchaseOrders: state.purchaseOrders.filter((o) => o.id !== id),
          products: updatedProducts,
          stockMovements: [...newMovements, ...state.stockMovements],
        }));

        return { success: true };
      },

      // STOCK ADJUSTMENT
      adjustStock: (payload) => {
        const state = get();
        const product = state.products.find((p) => p.id === payload.productId);
        if (!product) return { success: false, error: "Product not found" };

        let newQty = product.stockQuantity;
        if (payload.type === "add") {
          newQty = product.stockQuantity + payload.quantity;
        } else if (payload.type === "subtract") {
          newQty = product.stockQuantity - payload.quantity;
        } else if (payload.type === "set") {
          newQty = payload.quantity;
        }

        if (newQty < 0) {
          return { success: false, error: "Stock quantity cannot be negative." };
        }

        const delta = newQty - product.stockQuantity;
        if (delta === 0) {
          return { success: false, error: "No quantity change detected." };
        }

        const now = new Date().toISOString();
        const adjId = `ADJ-${Date.now().toString().slice(-4)}`;

        const updatedProducts = state.products.map((p) =>
          p.id === payload.productId ? { ...p, stockQuantity: newQty, updatedAt: now } : p
        );

        const newMovement: StockMovement = {
          id: `SM-${Date.now()}`,
          date: now,
          referenceId: adjId,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          type: "adjustment",
          quantityChange: delta,
          previousQuantity: product.stockQuantity,
          newQuantity: newQty,
          reason: payload.reason || "Manual stock adjustment",
          createdAt: now,
        };

        const newActivity: Activity = {
          id: `ACT-${Date.now()}`,
          type: "adjustment",
          title: "Stock Adjusted",
          description: `Adjusted "${product.name}" (${product.sku}): ${delta > 0 ? "+" : ""}${delta} units (${product.stockQuantity} -> ${newQty})`,
          timestamp: now,
          referenceId: adjId,
        };

        set((current) => ({
          products: updatedProducts,
          stockMovements: [newMovement, ...current.stockMovements],
          activities: [newActivity, ...current.activities],
        }));

        return { success: true };
      },

      // SETTINGS
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      resetToSampleData: () => {
        set({
          products: initialProducts,
          customers: initialCustomers,
          suppliers: initialSuppliers,
          salesOrders: initialSalesOrders,
          purchaseOrders: initialPurchaseOrders,
          stockMovements: initialStockMovements,
          activities: initialActivities,
          settings: initialSettings,
        });
      },

      // COMPUTED METRICS
      getMetrics: () => {
        const { products, salesOrders } = get();

        const totalProducts = products.length;
        const totalUnits = products.reduce((sum, p) => sum + p.stockQuantity, 0);
        const inventoryValue = products.reduce((sum, p) => sum + p.stockQuantity * p.purchasePrice, 0);

        const totalSales = salesOrders
          .filter((o) => o.orderStatus === "completed")
          .reduce((sum, o) => sum + o.totalAmount, 0);

        let lowStockCount = 0;
        let outOfStockCount = 0;
        let inStockCount = 0;

        products.forEach((p) => {
          const status = calculateStockStatus(p.stockQuantity, p.minStockLevel);
          if (status === "out_of_stock") outOfStockCount++;
          else if (status === "low_stock") lowStockCount++;
          else inStockCount++;
        });

        return {
          totalProducts,
          inventoryValue,
          totalSales,
          lowStockCount,
          outOfStockCount,
          inStockCount,
          totalUnits,
        };
      },
    }),
    {
      name: "stockwell_inventory_v1",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
