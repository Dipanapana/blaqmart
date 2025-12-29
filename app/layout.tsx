import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "sonner"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1E3A5F",
}

export const metadata: Metadata = {
  title: {
    default: "Blaqmart - Quality Products Delivered",
    template: "%s | Blaqmart",
  },
  description:
    "Quality products delivered to Warrenton, Jan Kempdorp, and surrounding areas. School stationery, bundles, and more. COD available for local deliveries.",
  keywords: [
    "online shopping",
    "Warrenton",
    "Jan Kempdorp",
    "Hartswater",
    "Christiana",
    "Northern Cape",
    "school supplies",
    "stationery",
    "delivery",
    "bundles",
  ],
  authors: [{ name: "Blaqmart" }],
  creator: "Blaqmart",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "Blaqmart - Quality Products Delivered",
    description:
      "Quality products delivered to Warrenton, Jan Kempdorp, and surrounding areas. School stationery, bundles, and more.",
    url: "https://blaqmart.co.za",
    siteName: "Blaqmart",
    locale: "en_ZA",
    type: "website",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Blaqmart Stationery",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://blaqmart.co.za"),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
        <Sonner />
      </body>
    </html>
  )
}
