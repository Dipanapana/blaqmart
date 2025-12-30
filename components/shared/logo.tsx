import Link from "next/link"
import Image from "next/image"

interface LogoProps {
  className?: string
  size?: "xs" | "sm" | "md" | "lg"
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizes = {
    xs: { height: 28, width: 100 },
    sm: { height: 32, width: 115 },
    md: { height: 36, width: 130 },
    lg: { height: 48, width: 180 },
  }

  const { height, width } = sizes[size]

  return (
    <Link href="/" className={`relative block ${className}`}>
      <Image
        src="/images/logo.png"
        alt="Blaqmart Stationery"
        width={width}
        height={height}
        priority
        className="object-contain"
      />
    </Link>
  )
}
