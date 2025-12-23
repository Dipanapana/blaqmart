import Link from "next/link"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  }

  return (
    <Link href="/" className={`font-bold ${sizes[size]} ${className}`}>
      <span className="text-primary">Blaq</span>
      <span className="text-accent">mart</span>
    </Link>
  )
}
