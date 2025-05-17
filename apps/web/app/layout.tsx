import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "ZeroBeta Marketplace",
  description: "ZeroBeta - Your Trusted Online Marketplace",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body>
          <div className="flex flex-col h-100dvh w-full">
            <div className="grow-1">
              {children}
              <Toaster />
            </div>
          </div>
      </body>
    </html>
  );
}
