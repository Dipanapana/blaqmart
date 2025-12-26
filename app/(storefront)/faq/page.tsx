import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, HelpCircle, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "FAQ | Blaqmart Stationery",
  description: "Frequently asked questions about Blaqmart Stationery orders, delivery, and products.",
}

const faqs = [
  {
    category: "Orders & Payment",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept credit/debit cards via Yoco, PayFast (including Instant EFT), and Cash on Delivery (COD) for Warrenton and Jan Kempdorp only."
      },
      {
        q: "Can I pay cash on delivery?",
        a: "Yes! Cash on Delivery is available for orders in Warrenton and Jan Kempdorp. Please have the exact amount ready as our drivers may not carry change."
      },
      {
        q: "How do I track my order?",
        a: "Once your order is dispatched, you'll receive a WhatsApp message with delivery updates. You can also check your order status by logging into your account."
      },
      {
        q: "Can I cancel or modify my order?",
        a: "You can cancel or modify your order if it hasn't been dispatched yet. Please contact us immediately via WhatsApp at +27 72 123 4567."
      },
    ]
  },
  {
    category: "Delivery",
    questions: [
      {
        q: "Where do you deliver?",
        a: "We deliver to Warrenton, Jan Kempdorp, Hartswater, Christiana, Kimberley, Douglas, Barkly West, Bloemhof, Hoopstad, and Boshof in the Northern Cape and Free State."
      },
      {
        q: "How much is delivery?",
        a: "Delivery is FREE for Warrenton and Jan Kempdorp. For other areas, fees range from R50-R75 depending on location. Orders over R500 qualify for free delivery everywhere."
      },
      {
        q: "How long does delivery take?",
        a: "Same-day delivery for Warrenton and Jan Kempdorp if ordered before 2pm. Other areas typically take 1-3 business days."
      },
      {
        q: "What is school collection?",
        a: "We can deliver your order directly to your child's school at our partner locations. It's free and convenient - just select 'Collect at School' during checkout."
      },
    ]
  },
  {
    category: "Products & Stationery Packs",
    questions: [
      {
        q: "What's included in your stationery packs?",
        a: "Our packs are curated based on typical requirements for each grade. They include quality brands like Staedtler, Croxley, and Casio. Check each pack's details page for the full item list."
      },
      {
        q: "Are your packs suitable for all schools?",
        a: "Our packs cover common requirements, but we recommend checking with your child's school for their specific list. We can also create custom packs for bulk orders."
      },
      {
        q: "Do you sell individual items?",
        a: "Yes! Besides our convenient packs, we sell individual stationery items. Browse our products page to shop item by item."
      },
      {
        q: "What brands do you stock?",
        a: "We stock quality SA brands including Staedtler, Croxley, Casio, BIC, Faber-Castell, Stabilo, Helix, Bantex, and more."
      },
    ]
  },
  {
    category: "Returns & Refunds",
    questions: [
      {
        q: "What is your return policy?",
        a: "You can return unused items in original packaging within 7 days of delivery. See our Returns page for full details."
      },
      {
        q: "How do I return an item?",
        a: "Contact us via WhatsApp or email to initiate a return. We'll arrange collection or provide drop-off instructions."
      },
      {
        q: "How long do refunds take?",
        a: "Refunds are processed within 7-14 business days after we receive and inspect the returned items."
      },
    ]
  },
  {
    category: "Account & Support",
    questions: [
      {
        q: "Do I need an account to order?",
        a: "No, you can checkout as a guest. However, creating an account lets you track orders, save addresses, and checkout faster."
      },
      {
        q: "How do I contact customer support?",
        a: "WhatsApp us at +27 72 123 4567 for quick responses, call +27 53 497 0000, or email orders@blaqmart.co.za."
      },
      {
        q: "What are your business hours?",
        a: "Monday - Friday: 08:00 - 17:00, Saturday: 08:00 - 13:00, Sunday: Closed."
      },
    ]
  },
]

export default function FAQPage() {
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
            <HelpCircle className="h-8 w-8" />
            Frequently Asked Questions
          </h1>
          <p className="mt-2 text-white/80 max-w-xl">
            Find answers to common questions about orders, delivery, products, and more.
          </p>
        </div>
      </div>

      <div className="container px-4 py-10 max-w-4xl">
        {faqs.map((category) => (
          <div key={category.category} className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-primary">{category.category}</h2>
            <Card>
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, index) => (
                    <AccordionItem key={index} value={`${category.category}-${index}`}>
                      <AccordionTrigger className="px-6 text-left">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Still have questions */}
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-6 text-center">
            <h3 className="font-bold text-lg mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              We&apos;re here to help! Reach out to us and we&apos;ll get back to you as soon as possible.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="accent" asChild>
                <a href="https://wa.me/27721234567">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp Us
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Page</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
