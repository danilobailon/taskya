import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TaskYa — Contrata profesionales con confianza en Ecuador",
  description:
    "TaskYa conecta tus proyectos con profesionales verificados del Ecuador. Publica lo que necesitas, compara propuestas y paga con protección.",
  metadataBase: new URL("https://taskya.vercel.app"),
  openGraph: {
    title: "TaskYa — Marketplace de servicios profesionales del Ecuador",
    description:
      "Encuentra profesionales confiables para cualquier servicio. Pago protegido y reputación transparente.",
    locale: "es_EC",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${bricolage.variable} ${instrument.variable}`}>
      <body>{children}</body>
    </html>
  );
}
