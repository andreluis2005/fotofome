import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FotoFome AI | Revolucione seus pratos no Delivery",
  description: "Traga vida a suas composições. A Inteligência Artificial da FotoFome transforma fotos simples em renders comercias estonteantes para o Ifood e Rappi.",
};

import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} min-h-screen dark-gradient text-white antialiased`}>
        <Navbar />

        {/* Root Content */}
        <main className="pt-20 min-h-screen">
          {children}
        </main>
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  );
}
