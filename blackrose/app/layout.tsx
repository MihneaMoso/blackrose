import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import NavBar from "@/components/layout/NavBar";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Black Rose | Premium Floral Designs",
  description: "High-end, dark-themed floral arrangements and delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pt-16">
        <NavBar />
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
