import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "./globals.css";

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
  themeColor: "#1F41F5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-surface font-sans antialiased">
        {children}
      </body>
    </html>
  );
}