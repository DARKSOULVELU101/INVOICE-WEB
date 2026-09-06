import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const kateru = localFont({
  src: [
    {
      path: "./fonts/Kateru-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Kateru-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-kateru",
  display: "swap",
});

const asfar = localFont({
  src: "./fonts/Asfar-Regular.ttf",
  weight: "400",
  style: "normal",
  variable: "--font-asfar",
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
    <html lang="en" suppressHydrationWarning className={`${kateru.variable} ${asfar.variable}`}>
      <body className="min-h-screen bg-surface font-sans antialiased">{children}</body>
    </html>
  );
}