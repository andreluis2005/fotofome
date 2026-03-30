import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "FotoFome AI | Revolucione seus pratos no Delivery",
    template: "%s | FotoFome AI",
  },
  description: "Transforme fotos simples de comida em imagens profissionais com IA. Aumente suas vendas no iFood e Rappi com fotos de qualidade comercial.",
  keywords: ["foto comida", "IA", "delivery", "ifood", "rappi", "fotografia gastronômica", "inteligência artificial"],
  authors: [{ name: "FotoFome AI" }],
  creator: "FotoFome AI",
  metadataBase: new URL("https://fotofome.ai"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://fotofome.ai",
    siteName: "FotoFome AI",
    title: "FotoFome AI | Fotos profissionais de comida com IA",
    description: "Transforme fotos amadoras em imagens profissionais para delivery. Aumente suas vendas no iFood e Rappi.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FotoFome AI — Fotos profissionais de comida com IA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FotoFome AI | Fotos profissionais de comida com IA",
    description: "Transforme fotos amadoras em imagens comerciais para delivery com Inteligência Artificial.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// SEO8: JSON-LD Schema markup
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FotoFome AI",
  applicationCategory: "PhotographyApplication",
  operatingSystem: "Web",
  description: "Plataforma de IA que transforma fotos amadoras de comida em imagens profissionais para delivery.",
  url: "https://fotofome.ai",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "BRL",
    lowPrice: "0",
    highPrice: "349.90",
    offerCount: "4",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "150",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} min-h-screen dark-gradient text-white antialiased`}>
        <Navbar />
        <main className="pt-20 min-h-screen">
          {children}
        </main>
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  );
}
