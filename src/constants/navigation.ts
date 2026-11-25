import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Layers,
  BarChart3,
  Users,
  Building2,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export const NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    title: "WORKSPACE",
    items: [
      {
        name: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      {
        name: "Products",
        href: "/products",
        icon: Package,
      },
      {
        name: "Sales",
        href: "/sales",
        icon: ShoppingCart,
      },
      {
        name: "Purchases",
        href: "/purchases",
        icon: Truck,
      },
      {
        name: "Stock",
        href: "/stock",
        icon: Layers,
      },
    ],
  },
  {
    title: "ANALYTICS",
    items: [
      {
        name: "Reports",
        href: "/reports",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      {
        name: "Customers",
        href: "/customers",
        icon: Users,
      },
      {
        name: "Suppliers",
        href: "/suppliers",
        icon: Building2,
      },
    ],
  },
  {
    title: "PREFERENCES",
    items: [
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];
