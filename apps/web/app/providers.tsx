'use client';
import { SidebarProvider } from "@/components/ui/sidebar";
import ApiClientProvider from "@/context/ApiClientProvider";
import { AuthContextProvider } from "@/context/AuthContext";
import { CartContextProvider } from "@/context/CartContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthContextProvider>
      <SidebarProvider defaultOpen={false}>
        <CartContextProvider>
          <ApiClientProvider>
            {children}
          </ApiClientProvider>
        </CartContextProvider>
      </SidebarProvider>
    </AuthContextProvider>
  );
}