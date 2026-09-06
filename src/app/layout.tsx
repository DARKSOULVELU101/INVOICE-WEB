import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const futura = localFont({
  src: [
    {
      path: "./fonts/FuturaNext-Book.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/FuturaNext-BookOblique.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/FuturaNext-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-futura",
  display: "swap",
});

const corpta = localFont({
  src: "./fonts/Corpta-Regular.otf",
  weight: "400",
  style: "normal",
  variable: "--font-corpta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  title: {
    default: "GENVOUCH Invoice Studio",
    template: "%s · GENVOUCH Invoice Studio",
  },
  description:
    "A modern business operating system for freelancers, agencies, startups and SMEs — create, manage, send and get paid for invoices.",
  applicationName: "GENVOUCH Invoice Studio",
  keywords: [
    "invoice",
    "invoicing software",
    "GENVOUCH",
    "billing",
    "freelance invoice",
    "estimate",
    "business",
  ],
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#39489D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${futura.variable} ${corpta.variable}`}>
      <body className="min-h-screen bg-surface font-sans antialiased">{children}</body>
    </html>
  );
}