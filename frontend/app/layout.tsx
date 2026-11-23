import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const title = "Demand Forecasting Demo for Wafir";
const description =
  "A sample demand forecast for a baked goods company in Kuwait. It uses dummy data and shows how send quantities could cut waste.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
  twitter: { card: "summary", title, description },
};

export const viewport: Viewport = { themeColor: "#f5f5f8", colorScheme: "light" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full">
        <SiteHeader />
        {children}
        <Footer />
      </body>
    </html>
  );
}
