import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, RefreshCcw, Check, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Returns & Refunds | Blaqmart Stationery",
  description: "Returns and refund policy for Blaqmart Stationery purchases.",
}

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary/90 py-8 text-white">
        <div className="container px-4">
          <Button variant="ghost" size="sm" className="mb-4 text-white/80 hover:text-white" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <RefreshCcw className="h-8 w-8" />
            Returns & Refunds
          </h1>
          <p className="mt-2 text-white/80 max-w-xl">
            Not happy with your purchase? We've got you covered with our hassle-free returns policy.
          </p>
        </div>
      </div>

      <div className="container px-4 py-10 max-w-4xl">
        {/* Return Period */}
        <Card className="mb-8 bg-green-50 border-green-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="text-5xl">7</div>
            <div>
              <h2 className="text-xl font-bold text-green-800">Day Return Period</h2>
              <p className="text-green-700">
                You have 7 days from the date of delivery to return eligible items.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Return Conditions */}
        <div className="grid gap-6 sm:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Check className="h-5 w-5" />
                Eligible for Return
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span>Items in original, unopened packaging</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span>Unused and undamaged products</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span>Wrong item delivered</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span>Defective or damaged upon arrival</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span>Items with valid proof of purchase</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <X className="h-5 w-5" />
                Not Eligible for Return
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <X className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <span>Opened or used items</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <span>Items damaged by the customer</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <span>Returns after 7 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <span>Items without proof of purchase</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <span>Personalized or custom items</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Return Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How to Return an Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-1">Contact Us</h3>
                <p className="text-sm text-muted-foreground">
                  WhatsApp us at +27 72 123 4567 or email orders@blaqmart.co.za
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-1">Pack the Item</h3>
                <p className="text-sm text-muted-foreground">
                  Pack the item securely in its original packaging with proof of purchase.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-1">We Collect</h3>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll arrange collection or you can drop it off at our location.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refund Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Refund Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Once we receive and inspect your return, we will process your refund within
              <strong> 7-14 business days</strong>. Refunds will be issued to the original payment method.
            </p>
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Cash on Delivery Orders</p>
                <p className="text-sm text-amber-700">
                  For COD orders, refunds will be processed via EFT. Please provide your banking
                  details when initiating the return.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exchange Option */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">Prefer an Exchange?</h3>
            <p className="text-muted-foreground mb-4">
              If you&apos;d prefer to exchange your item for a different product, we&apos;re happy to help!
              Contact us and we&apos;ll arrange the exchange. No extra fees if the items are the same price.
            </p>
            <Button asChild>
              <Link href="/contact">Contact Us for Exchange</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
