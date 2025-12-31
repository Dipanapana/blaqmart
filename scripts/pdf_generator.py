#!/usr/bin/env python3
"""
Blaqmart PDF Generator

Generate professional PDF documents for:
- School stationery lists (printable with checkboxes)
- Order receipts/invoices
- Delivery slips

Usage:
    python pdf_generator.py stationery input.json output.pdf
    python pdf_generator.py receipt input.json output.pdf
"""

import json
import sys
import os
from datetime import datetime
from io import BytesIO

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.platypus import (
        SimpleDocTemplate, Table, TableStyle, Paragraph,
        Spacer, Image, HRFlowable
    )
    from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
except ImportError:
    print("Error: reportlab not installed. Run: pip install reportlab")
    sys.exit(1)

# Brand colors
NAVY = colors.HexColor("#1E3A5F")
GOLD = colors.HexColor("#FFB81C")
LIGHT_GRAY = colors.HexColor("#F5F5F5")


def get_styles():
    """Get custom paragraph styles for PDFs."""
    styles = getSampleStyleSheet()

    # Title style
    styles.add(ParagraphStyle(
        name='CustomTitle',
        parent=styles['Title'],
        fontSize=24,
        textColor=NAVY,
        spaceAfter=12,
    ))

    # Heading style
    styles.add(ParagraphStyle(
        name='CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=NAVY,
        spaceBefore=12,
        spaceAfter=6,
    ))

    # Section heading
    styles.add(ParagraphStyle(
        name='SectionHeading',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=NAVY,
        spaceBefore=8,
        spaceAfter=4,
    ))

    # Footer style
    styles.add(ParagraphStyle(
        name='Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.gray,
        alignment=TA_CENTER,
    ))

    return styles


def generate_stationery_list_pdf(data: dict, output_path: str = None) -> bytes:
    """
    Generate a printable stationery list PDF with checkboxes.

    Args:
        data: {
            school: { name, town, logo? },
            grade: { name },
            items: [{ name, quantity, price, isRequired, notes? }],
            totals: { required, optional, total }
        }
        output_path: Optional file path to save PDF (if None, returns bytes)

    Returns:
        PDF bytes if output_path is None, else None
    """
    buffer = BytesIO() if output_path is None else None
    doc = SimpleDocTemplate(
        buffer or output_path,
        pagesize=A4,
        leftMargin=20*mm,
        rightMargin=20*mm,
        topMargin=20*mm,
        bottomMargin=20*mm,
    )

    styles = get_styles()
    elements = []

    # Header
    school_name = data.get('school', {}).get('name', 'School')
    grade_name = data.get('grade', {}).get('name', 'Grade')
    town = data.get('school', {}).get('town', '')

    elements.append(Paragraph(f"<b>{school_name}</b>", styles['CustomTitle']))
    if town:
        elements.append(Paragraph(f"<i>{town}</i>", styles['Normal']))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f"{grade_name} Stationery List - 2025", styles['CustomHeading']))
    elements.append(Spacer(1, 15))

    # Required items
    items = data.get('items', [])
    required_items = [i for i in items if i.get('isRequired', True)]
    optional_items = [i for i in items if not i.get('isRequired', True)]

    if required_items:
        elements.append(Paragraph("<b>Required Items</b>", styles['SectionHeading']))
        elements.append(Spacer(1, 5))

        # Table header
        table_data = [["", "Item", "Qty", "Price", "Total"]]

        required_total = 0
        for item in required_items:
            qty = item.get('quantity', 1)
            price = float(item.get('price', 0))
            total = qty * price
            required_total += total

            table_data.append([
                "\u2610",  # Empty checkbox ☐
                item.get('name', ''),
                str(qty),
                f"R{price:.2f}",
                f"R{total:.2f}",
            ])

        # Subtotal row
        table_data.append(["", "", "", "Subtotal:", f"R{required_total:.2f}"])

        table = Table(table_data, colWidths=[15*mm, 90*mm, 15*mm, 25*mm, 25*mm])
        table.setStyle(TableStyle([
            # Header
            ('BACKGROUND', (0, 0), (-1, 0), NAVY),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),

            # Body
            ('FONTSIZE', (0, 1), (-1, -2), 10),
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('ALIGN', (2, 0), (-1, -1), 'CENTER'),

            # Grid
            ('GRID', (0, 0), (-1, -2), 0.5, colors.gray),
            ('LINEBELOW', (0, -1), (-1, -1), 1, NAVY),

            # Subtotal row
            ('FONTNAME', (3, -1), (-1, -1), 'Helvetica-Bold'),

            # Alternating row colors
            *[('BACKGROUND', (0, i), (-1, i), LIGHT_GRAY)
              for i in range(2, len(table_data)-1, 2)],
        ]))
        elements.append(table)
        elements.append(Spacer(1, 15))

    # Optional items
    if optional_items:
        elements.append(Paragraph("<b>Optional Items</b>", styles['SectionHeading']))
        elements.append(Spacer(1, 5))

        table_data = [["", "Item", "Qty", "Price", "Total"]]

        optional_total = 0
        for item in optional_items:
            qty = item.get('quantity', 1)
            price = float(item.get('price', 0))
            total = qty * price
            optional_total += total

            table_data.append([
                "\u2610",
                item.get('name', ''),
                str(qty),
                f"R{price:.2f}",
                f"R{total:.2f}",
            ])

        table_data.append(["", "", "", "Subtotal:", f"R{optional_total:.2f}"])

        table = Table(table_data, colWidths=[15*mm, 90*mm, 15*mm, 25*mm, 25*mm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.gray),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('ALIGN', (2, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -2), 0.5, colors.gray),
            ('FONTNAME', (3, -1), (-1, -1), 'Helvetica-Bold'),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 15))

    # Grand total
    totals = data.get('totals', {})
    grand_total = totals.get('total', 0)
    if not grand_total:
        grand_total = sum(
            (i.get('quantity', 1) * float(i.get('price', 0)))
            for i in items
        )

    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=2, color=NAVY))
    elements.append(Spacer(1, 10))

    total_table = Table([
        ["GRAND TOTAL", f"R{grand_total:.2f}"]
    ], colWidths=[130*mm, 40*mm])
    total_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 14),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 0), (-1, -1), NAVY),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    elements.append(total_table)

    # Footer with ordering info
    elements.append(Spacer(1, 30))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.gray))
    elements.append(Spacer(1, 10))

    footer_text = """
    <b>Order Online:</b> www.blaqmart.co.za<br/>
    <b>WhatsApp:</b> 079 402 2296<br/>
    <b>Free delivery</b> in Warrenton &amp; Jan Kempdorp for orders over R500
    """
    elements.append(Paragraph(footer_text, styles['Footer']))

    # Build PDF
    doc.build(elements)

    if buffer:
        return buffer.getvalue()
    return None


def generate_receipt_pdf(data: dict, output_path: str = None) -> bytes:
    """
    Generate an order receipt/invoice PDF.

    Args:
        data: {
            order: { orderNumber, createdAt, status, total, subtotal, deliveryFee },
            customer: { name, email, phone },
            address: { streetAddress, suburb, city, postalCode },
            items: [{ name, quantity, unitPrice, totalPrice }],
            payment: { provider, status }
        }
        output_path: Optional file path to save PDF

    Returns:
        PDF bytes if output_path is None
    """
    buffer = BytesIO() if output_path is None else None
    doc = SimpleDocTemplate(
        buffer or output_path,
        pagesize=A4,
        leftMargin=20*mm,
        rightMargin=20*mm,
        topMargin=20*mm,
        bottomMargin=20*mm,
    )

    styles = get_styles()
    elements = []

    # Header
    elements.append(Paragraph("<b>BLAQMART STATIONERY</b>", styles['CustomTitle']))
    elements.append(Paragraph("Tax Invoice / Receipt", styles['CustomHeading']))
    elements.append(Spacer(1, 20))

    order = data.get('order', {})
    customer = data.get('customer', {})
    address = data.get('address', {})

    # Order details and customer info in two columns
    order_date = order.get('createdAt', datetime.now().isoformat())
    if isinstance(order_date, str):
        try:
            order_date = datetime.fromisoformat(order_date.replace('Z', '+00:00'))
        except:
            order_date = datetime.now()

    info_table = Table([
        ["Order Number:", f"#{order.get('orderNumber', 'N/A')}",
         "Customer:", customer.get('name', 'N/A')],
        ["Date:", order_date.strftime("%d %b %Y"),
         "Email:", customer.get('email', 'N/A')],
        ["Status:", order.get('status', 'N/A'),
         "Phone:", customer.get('phone', 'N/A')],
    ], colWidths=[30*mm, 55*mm, 25*mm, 60*mm])

    info_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 0), (0, -1), NAVY),
        ('TEXTCOLOR', (2, 0), (2, -1), NAVY),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 15))

    # Delivery address
    if address:
        elements.append(Paragraph("<b>Delivery Address:</b>", styles['SectionHeading']))
        addr_text = f"""
        {address.get('streetAddress', '')}<br/>
        {address.get('suburb', '')}, {address.get('city', '')}<br/>
        {address.get('postalCode', '')}
        """
        elements.append(Paragraph(addr_text, styles['Normal']))
        elements.append(Spacer(1, 15))

    # Items table
    elements.append(Paragraph("<b>Order Items</b>", styles['SectionHeading']))
    elements.append(Spacer(1, 5))

    items = data.get('items', [])
    table_data = [["Item", "Qty", "Unit Price", "Total"]]

    for item in items:
        table_data.append([
            item.get('name', ''),
            str(item.get('quantity', 1)),
            f"R{float(item.get('unitPrice', 0)):.2f}",
            f"R{float(item.get('totalPrice', 0)):.2f}",
        ])

    table = Table(table_data, colWidths=[95*mm, 20*mm, 30*mm, 30*mm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
        *[('BACKGROUND', (0, i), (-1, i), LIGHT_GRAY)
          for i in range(2, len(table_data), 2)],
    ]))
    elements.append(table)
    elements.append(Spacer(1, 15))

    # Totals
    subtotal = float(order.get('subtotal', 0))
    delivery_fee = float(order.get('deliveryFee', 0))
    discount = float(order.get('discount', 0))
    total = float(order.get('total', subtotal + delivery_fee - discount))

    totals_data = [
        ["Subtotal:", f"R{subtotal:.2f}"],
        ["Delivery:", f"R{delivery_fee:.2f}"],
    ]
    if discount > 0:
        totals_data.append(["Discount:", f"-R{discount:.2f}"])
    totals_data.append(["TOTAL:", f"R{total:.2f}"])

    totals_table = Table(totals_data, colWidths=[130*mm, 40*mm])
    totals_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, -1), (-1, -1), NAVY),
        ('LINEABOVE', (0, -1), (-1, -1), 1, NAVY),
    ]))
    elements.append(totals_table)

    # Payment info
    payment = data.get('payment', {})
    if payment:
        elements.append(Spacer(1, 15))
        elements.append(Paragraph(
            f"<b>Payment:</b> {payment.get('provider', 'N/A')} - {payment.get('status', 'N/A')}",
            styles['Normal']
        ))

    # Footer
    elements.append(Spacer(1, 30))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.gray))
    elements.append(Spacer(1, 10))

    footer_text = """
    Thank you for shopping with Blaqmart Stationery!<br/>
    Questions? WhatsApp us: 079 402 2296<br/>
    www.blaqmart.co.za
    """
    elements.append(Paragraph(footer_text, styles['Footer']))

    doc.build(elements)

    if buffer:
        return buffer.getvalue()
    return None


def main():
    """CLI entry point."""
    if len(sys.argv) < 4:
        print("Usage:")
        print("  python pdf_generator.py stationery <input.json> <output.pdf>")
        print("  python pdf_generator.py receipt <input.json> <output.pdf>")
        print("")
        print("Or pass JSON via stdin:")
        print("  echo '{...}' | python pdf_generator.py stationery - output.pdf")
        sys.exit(1)

    pdf_type = sys.argv[1]
    input_path = sys.argv[2]
    output_path = sys.argv[3]

    # Load input data
    if input_path == "-":
        data = json.load(sys.stdin)
    else:
        with open(input_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

    # Generate PDF
    if pdf_type == "stationery":
        generate_stationery_list_pdf(data, output_path)
        print(f"Generated stationery list: {output_path}")
    elif pdf_type == "receipt":
        generate_receipt_pdf(data, output_path)
        print(f"Generated receipt: {output_path}")
    else:
        print(f"Unknown PDF type: {pdf_type}")
        print("Valid types: stationery, receipt")
        sys.exit(1)


if __name__ == "__main__":
    main()
