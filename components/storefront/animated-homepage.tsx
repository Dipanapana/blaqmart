'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import {
  ArrowRight,
  Truck,
  Shield,
  Package,
  GraduationCap,
  MapPin,
  Banknote,
  Sparkles,
  Star,
  ChevronDown,
  Heart,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GradeSelector } from '@/components/storefront/grade-selector'
import { StationeryPackCard } from '@/components/storefront/stationery-pack-card'
import { ProductGrid } from '@/components/storefront/product-grid'
import { cn } from '@/lib/utils'

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
}

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 }
}

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

// Floating animation for decorative elements
const floatingAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut' as const
  }
}

interface Grade {
  id: string
  name: string
  slug: string
}

interface Category {
  id: string
  name: string
  slug: string
  image: string | null
  _count: { products: number }
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null
  images: string[]
  isFeatured: boolean
  isActive: boolean
  sku: string
  stock: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

interface StationeryPack {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  price: number
  comparePrice?: number | null
  grade?: { name: string } | null
  school?: { name: string } | null
  items: Array<{
    id: string
    product: { name: string }
    quantity: number
  }>
  isFeatured: boolean
}

interface AnimatedHomepageProps {
  grades: Grade[]
  categories: Category[]
  featuredProducts: Product[]
  stationeryPacks: StationeryPack[]
}

// Animated section wrapper with scroll reveal
function AnimatedSection({
  children,
  className,
  delay = 0
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeInUp}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Animated Hero Section
function HeroSection() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95])

  return (
    <motion.section
      style={{ opacity, scale }}
      className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90 py-16 text-white md:py-24"
    >
      {/* Animated background particles - reduced for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-white/10"
            style={{
              left: `${(i * 16) + 10}%`,
              top: `${(i * 15) + 5}%`,
            }}
            animate={{
              y: [-20, -60],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="container relative z-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <motion.div
            className="text-center lg:text-left"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Animated badge */}
            <motion.div
              variants={fadeInUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent/20 px-5 py-2 text-sm font-medium text-accent backdrop-blur-sm"
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="h-4 w-4" />
              </motion.div>
              Back to School 2025
              <motion.span
                className="ml-1 inline-flex h-2 w-2 rounded-full bg-accent"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>

            {/* Animated heading */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            >
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                School Stationery
              </motion.span>
              <motion.span
                className="mt-2 block bg-gradient-to-r from-accent via-yellow-300 to-accent bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Delivered
              </motion.span>
              <motion.span
                className="block text-2xl font-medium text-white/80 sm:text-3xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                to Your Door
              </motion.span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg text-white/80 sm:text-xl"
            >
              Complete stationery packs for Grade R to Matric.
              Quality supplies at affordable prices, delivered throughout
              Warrenton, Jan Kempdorp, and surrounding areas.
            </motion.p>

            {/* Animated buttons */}
            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="accent" asChild className="group text-base shadow-lg shadow-accent/30">
                  <Link href="#shop-by-grade">
                    <span className="relative z-10 flex items-center">
                      Shop by Grade
                      <motion.span
                        className="ml-2"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.span>
                    </span>
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-primary"
                  asChild
                >
                  <Link href="/products">
                    <Package className="mr-2 h-5 w-5" />
                    Browse Products
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60 lg:justify-start"
            >
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-accent text-accent" />
                Trusted by 500+ families
              </span>
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Same-day delivery
              </span>
            </motion.div>
          </motion.div>

          {/* Animated feature grid */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="relative mx-auto max-w-md">
              {/* Decorative elements */}
              <motion.div
                className="absolute -left-8 -top-8"
                animate={floatingAnimation}
              >
                <div className="h-16 w-16 rounded-2xl bg-accent/30 backdrop-blur-sm" />
              </motion.div>
              <motion.div
                className="absolute -bottom-4 -right-4"
                animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 0.5 } }}
              >
                <div className="h-12 w-12 rounded-full bg-green-400/30 backdrop-blur-sm" />
              </motion.div>

              <motion.div
                className="grid grid-cols-2 gap-4 rounded-3xl bg-white/10 p-6 backdrop-blur-lg"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {[
                  { icon: Package, title: 'Complete Packs', desc: 'Everything in one box', color: 'text-accent' },
                  { icon: Truck, title: 'Local Delivery', desc: 'Same-day available', color: 'text-green-400' },
                  { icon: Banknote, title: 'Pay on Delivery', desc: 'COD for local areas', color: 'text-blue-400' },
                  { icon: MapPin, title: 'Northern Cape', desc: 'Proudly local', color: 'text-rose-400' },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    variants={scaleIn}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.25)' }}
                    className="rounded-2xl bg-white/15 p-5 backdrop-blur-sm transition-colors"
                  >
                    <motion.div
                      initial={{ rotate: -10 }}
                      animate={{ rotate: 0 }}
                      transition={{ delay: index * 0.1 + 0.8 }}
                    >
                      <item.icon className={cn('h-8 w-8', item.color)} />
                    </motion.div>
                    <p className="mt-3 font-semibold">{item.title}</p>
                    <p className="text-sm text-white/70">{item.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/60"
        >
          <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.div>

      {/* Wave decoration */}
      <svg
        className="absolute -bottom-1 left-0 right-0 w-full text-background"
        viewBox="0 0 1440 100"
        fill="currentColor"
        preserveAspectRatio="none"
      >
        <path d="M0,50 C360,100 1080,0 1440,50 L1440,100 L0,100 Z" />
      </svg>
    </motion.section>
  )
}

// Animated Trust Badges
function TrustBadges() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const badges = [
    { icon: Truck, title: 'Free Local Delivery', desc: 'Warrenton & Jan Kempdorp', color: 'bg-green-500' },
    { icon: Shield, title: 'Secure Payment', desc: 'Yoco & PayFast', color: 'bg-blue-500' },
    { icon: Banknote, title: 'Cash on Delivery', desc: 'Local areas only', color: 'bg-amber-500' },
    { icon: Package, title: 'Complete Packs', desc: 'Grade R - Matric', color: 'bg-purple-500' },
  ]

  return (
    <section ref={ref} className="border-b py-8 sm:py-10">
      <div className="container">
        <motion.div
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {badges.map((badge, index) => (
            <motion.div
              key={badge.title}
              variants={fadeInUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50"
            >
              <motion.div
                className={cn('shrink-0 rounded-full p-2.5 text-white', badge.color)}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <badge.icon className="h-5 w-5" />
              </motion.div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold sm:text-base">{badge.title}</p>
                <p className="truncate text-xs text-muted-foreground sm:text-sm">{badge.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// Animated Categories Section
function CategoriesSection({ categories }: { categories: Category[] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <AnimatedSection className="py-12 sm:py-16">
      <div className="container">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold sm:text-3xl">Shop by Category</h2>
            <p className="mt-1 text-muted-foreground">Find exactly what you need</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            <Button variant="ghost" asChild className="group self-start sm:self-auto">
              <Link href="/categories">
                View All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          ref={ref}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {categories.slice(0, 6).map((category, index) => (
            <motion.div
              key={category.id}
              variants={scaleIn}
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Link href={`/categories/${category.slug}`}>
                <Card className="group overflow-hidden border-2 border-transparent transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/10">
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <motion.div
                        className="flex h-full items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                      >
                        <span className="text-5xl font-bold text-primary/30">
                          {category.name.charAt(0)}
                        </span>
                      </motion.div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <motion.div
                      className="absolute bottom-2 left-2 right-2 text-center opacity-0 group-hover:opacity-100"
                      initial={{ y: 10 }}
                      whileHover={{ y: 0 }}
                    >
                      <span className="text-sm font-medium text-white">View Products</span>
                    </motion.div>
                  </div>
                  <CardContent className="p-3 text-center">
                    <h3 className="truncate font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category._count.products} items
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AnimatedSection>
  )
}

// Animated How It Works Section
function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const steps = [
    { num: 1, title: 'Choose Your Grade', desc: "Select your child's grade and choose a complete pack or individual items", icon: GraduationCap },
    { num: 2, title: 'Secure Checkout', desc: 'Pay online with Yoco or choose Cash on Delivery for local areas', icon: Shield },
    { num: 3, title: 'Fast Delivery', desc: 'Receive your order at your door - same day for local delivery', icon: Truck },
  ]

  return (
    <section ref={ref} className="py-16 sm:py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
            className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-accent"
          >
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">Quick & Easy</span>
          </motion.div>
          <h2 className="text-3xl font-bold sm:text-4xl">How It Works</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Get your school supplies in three simple steps
          </p>
        </motion.div>

        <div className="relative mx-auto max-w-4xl">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-8 hidden h-0.5 w-2/3 -translate-x-1/2 bg-gradient-to-r from-primary/20 via-primary to-primary/20 md:block" />

          <motion.div
            className="grid gap-8 md:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.num}
                variants={fadeInUp}
                className="relative text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-2xl font-bold text-white shadow-lg shadow-primary/30"
                >
                  {step.num}
                  <motion.div
                    className="absolute -inset-1 rounded-2xl bg-primary/20"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  />
                </motion.div>
                <step.icon className="mx-auto mb-2 h-6 w-6 text-primary/60" />
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Animated Delivery Areas
function DeliveryAreas() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="bg-muted/50 py-16 sm:py-20">
      <div className="container">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={isInView ? { scale: [0, 1.2, 1] } : {}}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <MapPin className="mx-auto h-12 w-12 text-primary" />
          </motion.div>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Delivery Areas</h2>
          <p className="mt-2 text-muted-foreground">
            We deliver throughout the Northern Cape and Free State
          </p>

          <motion.div
            className="mt-8 grid gap-4 sm:grid-cols-2"
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <motion.div variants={fadeInLeft}>
              <Card className="group overflow-hidden border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 transition-all hover:shadow-lg hover:shadow-green-200/50">
                <CardContent className="p-6">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white"
                  >
                    <Truck className="h-6 w-6" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-green-700">Free Local Delivery</h3>
                  <p className="mt-2 font-medium text-green-600">Warrenton & Jan Kempdorp</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-green-200 px-3 py-1 text-xs font-medium text-green-700">
                      Same-day available
                    </span>
                    <span className="inline-flex items-center rounded-full bg-green-200 px-3 py-1 text-xs font-medium text-green-700">
                      COD accepted
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInRight}>
              <Card className="group overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 transition-all hover:shadow-lg hover:shadow-blue-200/50">
                <CardContent className="p-6">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white"
                  >
                    <Package className="h-6 w-6" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-blue-700">Courier Delivery</h3>
                  <p className="mt-2 font-medium text-blue-600">Hartswater, Christiana, Kimberley & more</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-200 px-3 py-1 text-xs font-medium text-blue-700">
                      1-3 business days
                    </span>
                    <span className="inline-flex items-center rounded-full bg-blue-200 px-3 py-1 text-xs font-medium text-blue-700">
                      Free over R500
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// Animated CTA Section
function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/95 to-primary py-16 text-white sm:py-20">
      {/* Animated background - simplified for performance */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute left-1/4 top-1/4 h-40 w-40 rounded-full bg-white/5"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute right-1/4 bottom-1/4 h-32 w-32 rounded-full bg-white/5"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.1, 0.15],
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
            className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm"
          >
            <Heart className="h-4 w-4 text-red-400" />
            <span className="text-sm font-medium">Join 500+ Happy Families</span>
          </motion.div>

          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            Ready for the new school year?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80 sm:text-lg">
            Get everything your child needs for school. Quality stationery
            at affordable prices, delivered to your door.
          </p>

          <motion.div
            className="mt-8"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button size="lg" variant="accent" className="group text-lg shadow-xl shadow-accent/30" asChild>
              <Link href="#shop-by-grade">
                <GraduationCap className="mr-2 h-5 w-5" />
                Start Shopping
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.span>
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// Main Animated Homepage Component
export function AnimatedHomepage({
  grades,
  categories,
  featuredProducts,
  stationeryPacks
}: AnimatedHomepageProps) {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <TrustBadges />

      {/* Shop by Grade Section */}
      <section id="shop-by-grade" className="scroll-mt-20 py-12 sm:py-16">
        <div className="container">
          <AnimatedSection className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary"
            >
              <GraduationCap className="h-5 w-5" />
              <span className="font-medium">Find Your Grade</span>
            </motion.div>
            <h2 className="text-3xl font-bold sm:text-4xl">Shop by Grade</h2>
            <p className="mt-2 text-muted-foreground">
              Select your child&apos;s grade to see recommended stationery packs
            </p>
          </AnimatedSection>
          <GradeSelector grades={grades} />
        </div>
      </section>

      {/* Featured Stationery Packs */}
      {stationeryPacks.length > 0 && (
        <section className="bg-gradient-to-b from-muted/30 to-muted/60 py-12 sm:py-16">
          <div className="container">
            <AnimatedSection>
              <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-sm text-accent">
                    <Sparkles className="h-3.5 w-3.5" />
                    Best Sellers
                  </div>
                  <h2 className="text-2xl font-bold sm:text-3xl">Popular Bundles</h2>
                  <p className="mt-1 text-muted-foreground">
                    Complete bundles with everything you need
                  </p>
                </div>
                <Button variant="ghost" asChild className="group self-start sm:self-auto">
                  <Link href="/bundles">
                    View All Bundles
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </AnimatedSection>
            <motion.div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={staggerContainer}
            >
              {stationeryPacks.map((pack, index) => (
                <motion.div
                  key={pack.id}
                  variants={scaleIn}
                  transition={{ delay: index * 0.1 }}
                >
                  <StationeryPackCard
                    pack={{
                      id: pack.id,
                      name: pack.name,
                      slug: pack.slug,
                      description: pack.description || undefined,
                      image: pack.image || undefined,
                      price: Number(pack.price),
                      comparePrice: pack.comparePrice ? Number(pack.comparePrice) : undefined,
                      gradeName: pack.grade?.name,
                      schoolName: pack.school?.name,
                      itemCount: pack.items.length,
                      items: pack.items.map(item => ({
                        id: item.id,
                        productName: item.product.name,
                        quantity: item.quantity,
                      })),
                      isFeatured: pack.isFeatured,
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      <CategoriesSection categories={categories} />

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="bg-muted/30 py-12 sm:py-16">
          <div className="container">
            <AnimatedSection>
              <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                    <Star className="h-3.5 w-3.5 fill-primary" />
                    Featured
                  </div>
                  <h2 className="text-2xl font-bold sm:text-3xl">Featured Products</h2>
                  <p className="mt-1 text-muted-foreground">
                    Top-quality stationery from trusted brands
                  </p>
                </div>
                <Button variant="ghost" asChild className="group self-start sm:self-auto">
                  <Link href="/products?featured=true">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </AnimatedSection>
            <ProductGrid initialProducts={featuredProducts} />
          </div>
        </section>
      )}

      <HowItWorks />
      <DeliveryAreas />
      <CTASection />
    </div>
  )
}
