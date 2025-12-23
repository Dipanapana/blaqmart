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
    default: "Blaqmart Stationery - Quality School Supplies Delivered",
    template: "%s | Blaqmart Stationery",
  },
  description:
    "Quality school stationery delivered to Warrenton, Jan Kempdorp, Hartswater, and Christiana. Shop by grade, get complete stationery packs, and enjoy COD for local deliveries.",
  keywords: [
    "school stationery",
    "stationery packs",
    "school supplies",
    "Warrenton",
    "Jan Kempdorp",
    "Hartswater",
    "Christiana",
    "Northern Cape",
    "back to school",
    "grade stationery",
  ],
  authors: [{ name: "Blaqmart Stationery" }],
  creator: "Blaqmart Stationery",
  openGraph: {
    title: "Blaqmart Stationery - Quality School Supplies Delivered",
    description:
      "Quality school stationery delivered to Northern Cape. Shop by grade and get complete stationery packs.",
    url: "https://blaqmart.co.za",
    siteName: "Blaqmart Stationery",
    locale: "en_ZA",
    type: "website",
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
