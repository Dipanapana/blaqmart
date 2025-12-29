import Link from "next/link"
import Image from "next/image"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizes = {
    sm: { height: 32, width: 120 },
    md: { height: 40, width: 150 },
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
