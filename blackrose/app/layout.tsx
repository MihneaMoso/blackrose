import type { Metadata } from "next";
import { Inter, Playfair_Display, Geist } from "next/font/google";
import { Providers } from "./providers";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Black Rose | Premium Floral Designs",
  description: "High-end, dark-themed floral arrangements and delivery.",
  icons: {
    icon: "/images/blackrose-logo-white.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("dark", "h-full", "antialiased", playfair.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col pt-16">
        <Providers>
          <NavBar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
