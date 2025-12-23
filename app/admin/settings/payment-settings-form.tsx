"use client"

import { useState } from "react"
import { AlertTriangle, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function PaymentSettingsForm() {
  const [showKeys, setShowKeys] = useState(false)

  return (
    <div className="space-y-6">
      {/* PayFast Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">PayFast</h3>
            <p className="text-sm text-muted-foreground">
              South African payment gateway
            </p>
          </div>
          <Badge variant="success">Connected</Badge>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Payment credentials are managed via environment variables
              </p>
              <p className="mt-1 text-yellow-700 dark:text-yellow-300">
                For security, PayFast credentials should be set in your{" "}
                <code className="rounded bg-yellow-100 px-1 dark:bg-yellow-900">
                  .env
                </code>{" "}
                file. Never expose credentials in the admin interface.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="merchantId">Merchant ID</Label>
              <Input
                id="merchantId"
                type={showKeys ? "text" : "password"}
                value="••••••••••••"
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="merchantKey">Merchant Key</Label>
              <Input
                id="merchantKey"
                type={showKeys ? "text" : "password"}
                value="••••••••••••"
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passphrase">Passphrase</Label>
            <Input
              id="passphrase"
              type={showKeys ? "text" : "password"}
              value="••••••••••••"
              disabled
              className="bg-muted"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowKeys(!showKeys)}
          >
            {showKeys ? "Hide" : "Show"} masked values
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://www.payfast.co.za/dashboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              PayFast Dashboard
            </a>
          </Button>
        </div>
      </div>

      {/* Environment Variables Guide */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Environment Variables</h3>
        <p className="text-sm text-muted-foreground">
          Add these variables to your <code>.env</code> file:
        </p>
        <div className="rounded-lg bg-muted p-4 font-mono text-sm">
          <pre className="whitespace-pre-wrap">
{`# PayFast Configuration
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase
PAYFAST_SANDBOX=true

# Payment URLs (update for production)
NEXT_PUBLIC_SITE_URL=http://localhost:3000`}
          </pre>
        </div>
      </div>

      {/* Test Mode Notice */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">Sandbox Mode</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          PayFast is currently running in sandbox mode. Set{" "}
          <code className="rounded bg-muted px-1">PAYFAST_SANDBOX=false</code>{" "}
          for production payments.
        </p>
      </div>

      {/* Other Payment Methods */}
      <div className="space-y-4 pt-6 border-t">
        <h3 className="text-lg font-medium">Additional Payment Methods</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Cash on Delivery</span>
              <Badge variant="success">Enabled</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Accept cash payments upon delivery
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">EFT/Bank Transfer</span>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Manual bank transfer payments
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
