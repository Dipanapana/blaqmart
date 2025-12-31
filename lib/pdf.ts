import { jsPDF } from "jspdf"
import "jspdf-autotable"

// Extend jsPDF type for autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF
    lastAutoTable: { finalY: number }
  }
}

interface AutoTableOptions {
  startY?: number
  head?: string[][]
  body?: (string | number)[][]
  theme?: "striped" | "grid" | "plain"
  headStyles?: {
    fillColor?: number[]
    textColor?: number[]
    fontStyle?: "bold" | "normal" | "italic"
    fontSize?: number
  }
  styles?: {
    fontSize?: number
    cellPadding?: number
  }
  columnStyles?: Record<number, { cellWidth?: number | "auto"; halign?: "left" | "center" | "right" }>
  margin?: { left?: number; right?: number }
}

interface StationeryListData {
  school: {
    name: string
    town?: string
    logo?: string
  }
  grade: {
    name: string
  }
  items: Array<{
    name: string
    quantity: number
    price: number
    isRequired: boolean
    notes?: string
  }>
  totals: {
    required: number
    optional: number
    total: number
  }
}

interface ReceiptData {
  order: {
    orderNumber: string
    createdAt: string | Date
    status: string
    subtotal: number
    deliveryFee: number
    discount?: number
    total: number
  }
  customer: {
    name: string
    email: string
    phone: string
  }
  address: {
    streetAddress: string
    suburb: string
    city: string
    postalCode: string
  }
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  payment?: {
    provider: string
    status: string
  }
}

// Brand colors
const NAVY = [30, 58, 95] // #1E3A5F
const GOLD = [255, 184, 28] // #FFB81C
const GRAY = [128, 128, 128]
const BLACK = [0, 0, 0]

/**
 * Format currency in South African Rand
 */
function formatCurrency(amount: number): string {
  return `R ${amount.toFixed(2)}`
}

/**
 * Format date for display
 */
function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * Generate a stationery list PDF.
 *
 * @example
 * const pdf = await generateStationeryListPDF({
 *   school: { name: "Warrenton Primary", town: "Warrenton" },
 *   grade: { name: "Grade 4" },
 *   items: [
 *     { name: "Exercise Book A4", quantity: 5, price: 12.99, isRequired: true },
 *   ],
 *   totals: { required: 64.95, optional: 0, total: 64.95 }
 * })
 */
export async function generateStationeryListPDF(
  data: StationeryListData
): Promise<Buffer> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let yPos = 20

  // Header - School Name
  doc.setFontSize(20)
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2])
  doc.setFont("helvetica", "bold")
  doc.text(data.school.name, pageWidth / 2, yPos, { align: "center" })
  yPos += 10

  // Subheader - Grade and Year
  doc.setFontSize(14)
  doc.setFont("helvetica", "normal")
  doc.text(`${data.grade.name} Stationery List - 2025`, pageWidth / 2, yPos, {
    align: "center",
  })
  yPos += 8

  // Town (if available)
  if (data.school.town) {
    doc.setFontSize(10)
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2])
    doc.text(data.school.town, pageWidth / 2, yPos, { align: "center" })
    yPos += 5
  }

  // Horizontal line
  yPos += 5
  doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2])
  doc.setLineWidth(0.5)
  doc.line(20, yPos, pageWidth - 20, yPos)
  yPos += 15

  // Required Items Section
  const requiredItems = data.items.filter((item) => item.isRequired)
  if (requiredItems.length > 0) {
    doc.setFontSize(12)
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2])
    doc.setFont("helvetica", "bold")
    doc.text("Required Items", 20, yPos)
    yPos += 5

    // Table for required items
    const requiredTableData = requiredItems.map((item) => [
      "\u2610", // Empty checkbox ☐
      item.name,
      item.quantity.toString(),
      formatCurrency(item.price),
      formatCurrency(item.price * item.quantity),
    ])

    doc.autoTable({
      startY: yPos,
      head: [["", "Item", "Qty", "Price", "Total"]],
      body: requiredTableData,
      theme: "grid",
      headStyles: {
        fillColor: NAVY,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 15, halign: "center" },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 25, halign: "right" },
      },
      margin: { left: 20, right: 20 },
    })

    yPos = doc.lastAutoTable.finalY + 10

    // Required items subtotal
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text(
      `Required Items Subtotal: ${formatCurrency(data.totals.required)}`,
      pageWidth - 20,
      yPos,
      { align: "right" }
    )
    yPos += 15
  }

  // Optional Items Section
  const optionalItems = data.items.filter((item) => !item.isRequired)
  if (optionalItems.length > 0) {
    doc.setFontSize(12)
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2])
    doc.setFont("helvetica", "bold")
    doc.text("Optional Items", 20, yPos)
    yPos += 5

    const optionalTableData = optionalItems.map((item) => [
      "\u2610",
      item.name,
      item.quantity.toString(),
      formatCurrency(item.price),
      formatCurrency(item.price * item.quantity),
    ])

    doc.autoTable({
      startY: yPos,
      head: [["", "Item", "Qty", "Price", "Total"]],
      body: optionalTableData,
      theme: "grid",
      headStyles: {
        fillColor: GRAY,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 15, halign: "center" },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 25, halign: "right" },
      },
      margin: { left: 20, right: 20 },
    })

    yPos = doc.lastAutoTable.finalY + 10

    // Optional items subtotal
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text(
      `Optional Items Subtotal: ${formatCurrency(data.totals.optional)}`,
      pageWidth - 20,
      yPos,
      { align: "right" }
    )
    yPos += 15
  }

  // Grand Total
  doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2])
  doc.setLineWidth(0.5)
  doc.line(pageWidth - 80, yPos, pageWidth - 20, yPos)
  yPos += 8

  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2])
  doc.text(
    `GRAND TOTAL: ${formatCurrency(data.totals.total)}`,
    pageWidth - 20,
    yPos,
    { align: "right" }
  )
  yPos += 25

  // Footer Section
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(20, yPos, pageWidth - 20, yPos)
  yPos += 10

  doc.setFontSize(10)
  doc.setTextColor(BLACK[0], BLACK[1], BLACK[2])
  doc.setFont("helvetica", "bold")
  doc.text("Order Online:", 20, yPos)
  doc.setFont("helvetica", "normal")
  doc.text("www.blaqmart.co.za", 55, yPos)
  yPos += 6

  doc.setFont("helvetica", "bold")
  doc.text("WhatsApp:", 20, yPos)
  doc.setFont("helvetica", "normal")
  doc.text("079 402 2296", 50, yPos)
  yPos += 6

  doc.setFont("helvetica", "italic")
  doc.setFontSize(9)
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2])
  doc.text(
    "Free delivery in Warrenton & Jan Kempdorp for orders over R500",
    20,
    yPos
  )

  // Convert to Buffer
  const arrayBuffer = doc.output("arraybuffer")
  return Buffer.from(arrayBuffer)
}

/**
 * Generate an order receipt PDF.
 */
export async function generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let yPos = 20

  // Header - Blaqmart
  doc.setFontSize(24)
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2])
  doc.setFont("helvetica", "bold")
  doc.text("BLAQMART", pageWidth / 2, yPos, { align: "center" })
  yPos += 8

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2])
  doc.text("School Stationery", pageWidth / 2, yPos, { align: "center" })
  yPos += 15

  // Order Receipt Title
  doc.setFontSize(16)
  doc.setTextColor(BLACK[0], BLACK[1], BLACK[2])
  doc.setFont("helvetica", "bold")
  doc.text("ORDER RECEIPT", pageWidth / 2, yPos, { align: "center" })
  yPos += 10

  // Order number and date
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Order #: ${data.order.orderNumber}`, 20, yPos)
  doc.text(`Date: ${formatDate(data.order.createdAt)}`, pageWidth - 20, yPos, {
    align: "right",
  })
  yPos += 6
  doc.text(`Status: ${data.order.status}`, 20, yPos)
  yPos += 15

  // Customer Details
  doc.setFillColor(245, 245, 245)
  doc.rect(20, yPos - 5, pageWidth - 40, 35, "F")

  doc.setFont("helvetica", "bold")
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2])
  doc.text("Customer Details", 25, yPos)
  yPos += 7

  doc.setFont("helvetica", "normal")
  doc.setTextColor(BLACK[0], BLACK[1], BLACK[2])
  doc.setFontSize(9)
  doc.text(`Name: ${data.customer.name}`, 25, yPos)
  yPos += 5
  doc.text(`Email: ${data.customer.email}`, 25, yPos)
  yPos += 5
  doc.text(`Phone: ${data.customer.phone}`, 25, yPos)
  yPos += 15

  // Delivery Address
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2])
  doc.text("Delivery Address", 20, yPos)
  yPos += 6

  doc.setFont("helvetica", "normal")
  doc.setTextColor(BLACK[0], BLACK[1], BLACK[2])
  doc.setFontSize(9)
  doc.text(data.address.streetAddress, 20, yPos)
  yPos += 5
  doc.text(`${data.address.suburb}, ${data.address.city}`, 20, yPos)
  yPos += 5
  doc.text(data.address.postalCode, 20, yPos)
  yPos += 15

  // Order Items Table
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2])
  doc.text("Order Items", 20, yPos)
  yPos += 5

  const itemsTableData = data.items.map((item) => [
    item.name,
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency(item.totalPrice),
  ])

  doc.autoTable({
    startY: yPos,
    head: [["Item", "Qty", "Unit Price", "Total"]],
    body: itemsTableData,
    theme: "striped",
    headStyles: {
      fillColor: NAVY,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 30, halign: "right" },
    },
    margin: { left: 20, right: 20 },
  })

  yPos = doc.lastAutoTable.finalY + 10

  // Order Summary
  const summaryX = pageWidth - 70

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(BLACK[0], BLACK[1], BLACK[2])

  doc.text("Subtotal:", summaryX, yPos)
  doc.text(formatCurrency(data.order.subtotal), pageWidth - 20, yPos, {
    align: "right",
  })
  yPos += 6

  doc.text("Delivery:", summaryX, yPos)
  doc.text(formatCurrency(data.order.deliveryFee), pageWidth - 20, yPos, {
    align: "right",
  })
  yPos += 6

  if (data.order.discount && data.order.discount > 0) {
    doc.setTextColor(34, 197, 94) // Green for discount
    doc.text("Discount:", summaryX, yPos)
    doc.text(`-${formatCurrency(data.order.discount)}`, pageWidth - 20, yPos, {
      align: "right",
    })
    yPos += 6
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2])
  }

  // Total line
  doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2])
  doc.setLineWidth(0.5)
  doc.line(summaryX, yPos, pageWidth - 20, yPos)
  yPos += 6

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2])
  doc.text("TOTAL:", summaryX, yPos)
  doc.text(formatCurrency(data.order.total), pageWidth - 20, yPos, {
    align: "right",
  })
  yPos += 15

  // Payment Info (if available)
  if (data.payment) {
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2])
    doc.text(
      `Payment: ${data.payment.provider} - ${data.payment.status}`,
      20,
      yPos
    )
    yPos += 15
  }

  // Footer
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(20, yPos, pageWidth - 20, yPos)
  yPos += 10

  doc.setFontSize(9)
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2])
  doc.setFont("helvetica", "normal")
  doc.text("Thank you for shopping with Blaqmart!", pageWidth / 2, yPos, {
    align: "center",
  })
  yPos += 5
  doc.text("www.blaqmart.co.za | WhatsApp: 079 402 2296", pageWidth / 2, yPos, {
    align: "center",
  })

  // Convert to Buffer
  const arrayBuffer = doc.output("arraybuffer")
  return Buffer.from(arrayBuffer)
}

/**
 * Check if PDF generation is available.
 * With jsPDF, this is always true since it's a pure JavaScript library.
 */
export async function isPdfGenerationAvailable(): Promise<boolean> {
  return true
}
