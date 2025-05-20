import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Providers } from "./providers";
import SideBar from "@/components/SideBar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "ZeroBeta Marketplace",
  description: "ZeroBeta - Your Trusted Online Marketplace",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SideBar />
          <div className="flex flex-col h-100dvh w-full">
            <Navbar />
            <div className="grow-1">
              {children}
              <Toaster />
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
