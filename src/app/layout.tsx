import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "sonner";

export const viewport: Viewport = {
  themeColor: "#593A2C",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Stockwell — Premium Inventory Management SaaS",
  description: "Inventory, sales and purchasing — beautifully organized.",
  applicationName: "Stockwell",
  keywords: [
    "inventory management",
    "saas",
    "sales orders",
    "purchase orders",
    "stock tracking",
    "zoho inventory",
    "b2b dashboard"
  ],
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Stockwell — Premium Inventory Management SaaS",
    description: "Inventory, sales and purchasing — beautifully organized.",
    siteName: "Stockwell",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F8F6F1] text-[#30251F] selection:bg-[#E2D8CC] selection:text-[#30251F]">
        <AppShell>{children}</AppShell>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#30251F",
              border: "1px solid #E9E2D8",
              borderRadius: "14px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
