#!/usr/bin/env python3
"""
Blaqmart SMS Service

Send SMS notifications to customers using BulkSMS (South Africa) or Twilio.
Designed for non-tech-savvy users - messages are SHORT and CLEAR.

Usage:
    python sms_service.py send <phone> <template> [--data '{"key": "value"}']
    python sms_service.py test <phone>

Environment variables:
    BULKSMS_USERNAME - BulkSMS account username
    BULKSMS_PASSWORD - BulkSMS account password
    OR
    TWILIO_ACCOUNT_SID - Twilio account SID
    TWILIO_AUTH_TOKEN - Twilio auth token
    TWILIO_PHONE_NUMBER - Twilio sender phone number
"""

import os
import sys
import json
import argparse
from typing import Optional, Dict, Any

try:
    import requests
except ImportError:
    print("Error: requests not installed. Run: pip install requests")
    sys.exit(1)

# Try to load .env file if python-dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


# SMS Message Templates (max 160 chars for single SMS)
TEMPLATES = {
    "ORDER_CONFIRMED": (
        "Blaqmart: Order #{order_number} confirmed! "
        "Total: R{total}. We'll SMS when ready. "
        "Questions? 0794022296"
    ),
    "ORDER_PROCESSING": (
        "Blaqmart: Your order #{order_number} is being packed. "
        "Delivery in 1-3 days. "
        "Track: blaqmart.co.za/orders"
    ),
    "ORDER_SHIPPED": (
        "Blaqmart: Order #{order_number} is on the way! "
        "Delivery today. "
        "Call if needed: 0794022296"
    ),
    "ORDER_DELIVERED": (
        "Blaqmart: Order #{order_number} delivered! "
        "Thank you for shopping with us. "
        "Shop again: blaqmart.co.za"
    ),
    "ORDER_CANCELLED": (
        "Blaqmart: Order #{order_number} cancelled. "
        "Refund in 3-5 days. "
        "Questions? Call 0794022296"
    ),
    "TEST": (
        "Blaqmart Test: If you received this, "
        "SMS notifications are working! "
        "- Blaqmart Team"
    ),
}


def normalize_phone(phone: str) -> str:
    """
    Normalize South African phone number to international format.

    Args:
        phone: Phone number in any format (e.g., "0791234567", "+27791234567")

    Returns:
        Phone number in international format (e.g., "+27791234567")
    """
    phone = phone.strip().replace(" ", "").replace("-", "")

    if phone.startswith("0"):
        return "+27" + phone[1:]
    elif phone.startswith("27"):
        return "+" + phone
    elif not phone.startswith("+"):
        return "+27" + phone

    return phone


def send_sms_bulksms(phone: str, message: str) -> Dict[str, Any]:
    """
    Send SMS using BulkSMS API (cheaper for SA).

    Args:
        phone: Normalized phone number
        message: SMS message content

    Returns:
        Result dict with success status and message_id or error
    """
    username = os.getenv("BULKSMS_USERNAME")
    password = os.getenv("BULKSMS_PASSWORD")

    if not username or not password:
        return {
            "success": False,
            "error": "BULKSMS_USERNAME and BULKSMS_PASSWORD not configured"
        }

    try:
        response = requests.post(
            "https://api.bulksms.com/v1/messages",
            auth=(username, password),
            json={
                "to": phone,
                "body": message,
            },
            timeout=30,
        )

        if response.status_code == 201:
            data = response.json()
            return {
                "success": True,
                "message_id": data[0].get("id") if data else None,
                "provider": "bulksms",
            }
        else:
            return {
                "success": False,
                "error": response.text,
                "status_code": response.status_code,
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


def send_sms_twilio(phone: str, message: str) -> Dict[str, Any]:
    """
    Send SMS using Twilio API.

    Args:
        phone: Normalized phone number
        message: SMS message content

    Returns:
        Result dict with success status and message_id or error
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_PHONE_NUMBER")

    if not all([account_sid, auth_token, from_number]):
        return {
            "success": False,
            "error": "TWILIO credentials not configured"
        }

    try:
        response = requests.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json",
            auth=(account_sid, auth_token),
            data={
                "To": phone,
                "From": from_number,
                "Body": message,
            },
            timeout=30,
        )

        if response.status_code in [200, 201]:
            data = response.json()
            return {
                "success": True,
                "message_id": data.get("sid"),
                "provider": "twilio",
            }
        else:
            return {
                "success": False,
                "error": response.text,
                "status_code": response.status_code,
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


def send_sms(phone: str, message: str) -> Dict[str, Any]:
    """
    Send SMS using available provider.
    Tries BulkSMS first (cheaper for SA), then Twilio.

    Args:
        phone: Phone number (will be normalized)
        message: SMS message content

    Returns:
        Result dict with success status
    """
    phone = normalize_phone(phone)

    # Try BulkSMS first
    if os.getenv("BULKSMS_USERNAME"):
        result = send_sms_bulksms(phone, message)
        if result["success"]:
            return result

    # Try Twilio as fallback
    if os.getenv("TWILIO_ACCOUNT_SID"):
        result = send_sms_twilio(phone, message)
        if result["success"]:
            return result

    return {
        "success": False,
        "error": "No SMS provider configured. Set BULKSMS or TWILIO credentials.",
    }


def send_template_sms(
    phone: str,
    template: str,
    data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Send SMS using a predefined template.

    Args:
        phone: Phone number
        template: Template name (e.g., "ORDER_CONFIRMED")
        data: Template variables (e.g., {"order_number": "BM-001", "total": "250.00"})

    Returns:
        Result dict with success status
    """
    if template not in TEMPLATES:
        return {
            "success": False,
            "error": f"Unknown template: {template}. Available: {list(TEMPLATES.keys())}"
        }

    message_template = TEMPLATES[template]

    # Replace template variables
    if data:
        try:
            message = message_template.format(**data)
        except KeyError as e:
            return {
                "success": False,
                "error": f"Missing template variable: {e}"
            }
    else:
        message = message_template

    # Check message length (SMS limit is 160 chars for single SMS)
    if len(message) > 160:
        print(f"Warning: Message length ({len(message)}) exceeds 160 chars, will be split")

    return send_sms(phone, message)


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Blaqmart SMS Service",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  Send order confirmation:
    python sms_service.py send 0791234567 ORDER_CONFIRMED --data '{"order_number": "BM-001", "total": "250.00"}'

  Send test SMS:
    python sms_service.py test 0791234567

  List available templates:
    python sms_service.py templates
        """
    )

    subparsers = parser.add_subparsers(dest="command", required=True)

    # Send command
    send_parser = subparsers.add_parser("send", help="Send SMS from template")
    send_parser.add_argument("phone", help="Recipient phone number")
    send_parser.add_argument("template", help="Template name")
    send_parser.add_argument(
        "--data", "-d",
        type=json.loads,
        default={},
        help="Template data as JSON"
    )

    # Test command
    test_parser = subparsers.add_parser("test", help="Send test SMS")
    test_parser.add_argument("phone", help="Recipient phone number")

    # Templates command
    subparsers.add_parser("templates", help="List available templates")

    args = parser.parse_args()

    if args.command == "templates":
        print("Available SMS templates:")
        print("-" * 40)
        for name, template in TEMPLATES.items():
            print(f"\n{name}:")
            print(f"  {template}")
        return

    if args.command == "test":
        result = send_template_sms(args.phone, "TEST")
    else:
        result = send_template_sms(args.phone, args.template, args.data)

    # Output as JSON for programmatic use
    print(json.dumps(result, indent=2))

    # Exit with error code if failed
    if not result.get("success"):
        sys.exit(1)


if __name__ == "__main__":
    main()
