import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Terms & Conditions | Blaqmart Stationery",
  description: "Terms and conditions for using Blaqmart Stationery online store.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary/90 py-8 text-white">
        <div className="container px-4">
          <Button variant="ghost" size="sm" className="mb-4 text-white/80 hover:text-white" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Terms & Conditions</h1>
          <p className="mt-2 text-white/80">Last updated: January 2025</p>
        </div>
      </div>

      <div className="container px-4 py-10 max-w-3xl">
        <div className="prose prose-gray max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Blaqmart Stationery. By accessing and using our website and services,
            you agree to be bound by these Terms and Conditions. Please read them carefully.
          </p>

          <h2>2. Products and Pricing</h2>
          <p>
            All prices displayed on our website are in South African Rand (ZAR) and include VAT
            where applicable. We reserve the right to modify prices at any time without prior notice.
          </p>
          <p>
            Product images are for illustration purposes only. Actual products may vary slightly
            in appearance from the images shown.
          </p>

          <h2>3. Orders and Payment</h2>
          <p>
            By placing an order, you are making an offer to purchase products. All orders are
            subject to acceptance and availability.
          </p>
          <p>We accept the following payment methods:</p>
          <ul>
            <li>Credit/Debit Cards (via Yoco)</li>
            <li>PayFast</li>
            <li>Cash on Delivery (Warrenton and Jan Kempdorp only)</li>
          </ul>

          <h2>4. Delivery</h2>
          <p>
            We deliver to Warrenton, Jan Kempdorp, Hartswater, Christiana, Kimberley, and
            surrounding areas in the Northern Cape and Free State.
          </p>
          <p>
            Delivery times are estimates and not guaranteed. We are not liable for delays
            caused by circumstances beyond our control.
          </p>

          <h2>5. Returns and Refunds</h2>
          <p>
            If you are not satisfied with your purchase, you may return it within 7 days
            for a full refund or exchange, provided:
          </p>
          <ul>
            <li>The product is in its original condition and packaging</li>
            <li>The product has not been used or damaged</li>
            <li>You have proof of purchase</li>
          </ul>
          <p>
            Refunds will be processed within 7-14 business days after we receive and
            inspect the returned items.
          </p>

          <h2>6. Stationery Packs</h2>
          <p>
            Our stationery packs are curated based on typical school requirements. We recommend
            checking with your child&apos;s school for their specific requirements list.
          </p>

          <h2>7. Privacy</h2>
          <p>
            Your privacy is important to us. Please review our{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>{" "}
            to understand how we collect and use your information.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            Blaqmart Stationery shall not be liable for any indirect, incidental, special,
            or consequential damages arising from your use of our products or services.
          </p>

          <h2>9. Changes to Terms</h2>
          <p>
            We may update these Terms and Conditions from time to time. Changes will be
            effective immediately upon posting on this page.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please{" "}
            <Link href="/contact" className="text-primary hover:underline">
              contact us
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
