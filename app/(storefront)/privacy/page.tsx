import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Privacy Policy | Blaqmart Stationery",
  description: "Privacy policy for Blaqmart Stationery - how we collect, use, and protect your information.",
}

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="mt-2 text-white/80">Last updated: January 2025</p>
        </div>
      </div>

      <div className="container px-4 py-10 max-w-3xl">
        <div className="prose prose-gray max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Blaqmart Stationery (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and safeguard your personal information
            when you use our website and services.
          </p>

          <h2>2. Information We Collect</h2>
          <h3>Personal Information</h3>
          <p>When you place an order or create an account, we may collect:</p>
          <ul>
            <li>Name and contact information (email, phone number)</li>
            <li>Delivery address</li>
            <li>Payment information (processed securely via our payment providers)</li>
            <li>Order history and preferences</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <p>When you visit our website, we may automatically collect:</p>
          <ul>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>IP address</li>
            <li>Pages visited and time spent on our site</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your orders</li>
            <li>Provide customer support</li>
            <li>Send promotional emails (with your consent)</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Information Sharing</h2>
          <p>We may share your information with:</p>
          <ul>
            <li><strong>Delivery partners:</strong> To fulfill your orders</li>
            <li><strong>Payment processors:</strong> To process your payments securely</li>
            <li><strong>Legal authorities:</strong> When required by law</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>

          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your
            personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
          <p>
            Payment information is processed securely through our payment providers (Yoco and PayFast)
            and is not stored on our servers.
          </p>

          <h2>6. Your Rights</h2>
          <p>Under POPIA (Protection of Personal Information Act), you have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Object to processing of your information</li>
            <li>Withdraw consent at any time</li>
          </ul>

          <h2>7. Cookies</h2>
          <p>
            We use cookies to enhance your browsing experience, remember your preferences,
            and analyze site traffic. You can control cookie settings through your browser.
          </p>

          <h2>8. Children&apos;s Privacy</h2>
          <p>
            Our services are intended for parents and guardians purchasing school supplies.
            We do not knowingly collect personal information from children under 18.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on
            this page with an updated revision date.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or wish to exercise your rights,
            please{" "}
            <Link href="/contact" className="text-primary hover:underline">
              contact us
            </Link>
            :
          </p>
          <ul>
            <li>Email: orders@blaqmart.co.za</li>
            <li>Phone: +27 53 497 0000</li>
            <li>Address: Warrenton, Northern Cape, South Africa</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
