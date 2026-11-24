export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';
export type OrderStatus = 'draft' | 'pending' | 'completed' | 'cancelled';
export type PurchaseStatus = 'ordered' | 'pending' | 'received' | 'cancelled';
export type MovementType = 'purchase' | 'sale' | 'adjustment';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  supplierId: string;
  supplierName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SalesOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  inventoryDeducted: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDelivery: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: PurchaseStatus;
  inventoryAdded: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  date: string;
  referenceId: string;
  productId: string;
  productName: string;
  sku: string;
  type: MovementType;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: 'sale' | 'purchase' | 'product' | 'adjustment';
  title: string;
  description: string;
  timestamp: string;
  referenceId?: string;
}

export interface BusinessSettings {
  businessName: string;
  businessEmail: string;
  currency: string;
  dateFormat: string;
  phone: string;
  address: string;
}

export interface StockAdjustmentPayload {
  productId: string;
  type: 'add' | 'subtract' | 'set';
  quantity: number;
  reason: string;
}
