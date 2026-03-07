import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "+Facturas | Software de Faturação",
  description: "Software de faturação para o mercado de Angola",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-AO">
      <body className={`${inter.className} min-h-screen bg-slate-50`}>
        {children}
      </body>
    </html>
  );
}