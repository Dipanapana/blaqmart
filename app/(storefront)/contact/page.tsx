import { Metadata } from "next"
import Link from "next/link"
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export const metadata: Metadata = {
  title: "Contact Us | Blaqmart",
  description: "Get in touch with Blaqmart. We're here to help with orders, questions, and custom pack requests.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary/90 py-12 text-white">
        <div className="container px-4">
          <h1 className="text-3xl font-bold sm:text-4xl">Contact Us</h1>
          <p className="mt-2 text-white/80 max-w-xl">
            Have questions about your order or need a custom stationery pack? We're here to help!
          </p>
        </div>
      </section>

      <div className="container px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Get in Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Phone / WhatsApp</p>
                    <a href="tel:+27794022296" className="text-muted-foreground hover:text-primary">
                      079 402 2296
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-green-100 p-2">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">WhatsApp Us</p>
                    <a href="https://wa.me/27794022296" className="text-muted-foreground hover:text-green-600">
                      079 402 2296
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">Quick responses during business hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:orders@blaqmart.co.za" className="text-muted-foreground hover:text-primary">
                      orders@blaqmart.co.za
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">
                      Warrenton, Northern Cape<br />
                      South Africa
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Business Hours</p>
                    <p className="text-muted-foreground">
                      Monday - Friday: 08:00 - 17:00<br />
                      Saturday: 08:00 - 13:00<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">Need a Custom Pack?</h3>
                <p className="text-muted-foreground mb-4">
                  We can create custom stationery packs for your school or organization.
                  Get in touch for bulk orders and special requirements.
                </p>
                <Button variant="accent" asChild>
                  <a href="https://wa.me/27794022296?text=Hi,%20I%20need%20a%20custom%20pack">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp Us
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input id="phone" type="tel" placeholder="+27 12 345 6789" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Order inquiry, custom pack request, etc." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="How can we help you?"
                    rows={5}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
