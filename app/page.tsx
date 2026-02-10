'use client';

import Header from '@/components/Header';
import ProductGrid from '@/components/products/ProductGrid';
import { Shield, Truck, Award, Headphones, Eye, Video, Zap, ChevronRight, Camera } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FadeInOnScroll, FloatingProduct, StaggerContainer, StaggerItem } from '@/components/products/ProductAnimations';
import { formatCurrency } from '@/lib/utils';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 px-4 py-1.5 rounded-full mb-6">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-blue-300 text-sm font-medium">Now shipping nationwide</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Drive Protected.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                  Record Everything.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-lg">
                Premium dashcams delivered to your door, anywhere in South Africa. Protect yourself on the road.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link
                  href="#products"
                  className="px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-all hover:shadow-lg hover:shadow-blue-600/25 flex items-center justify-center gap-2"
                >
                  Shop Dashcams
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-3.5 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors border border-slate-700 flex items-center justify-center gap-2"
                >
                  Why BLAQMART
                </Link>
              </div>

              {/* Trust bar */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-400" />
                  Free Shipping Over R1,500
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-400" />
                  Secure Payment
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-400" />
                  1-Year Warranty
                </span>
              </div>
            </motion.div>

            {/* Hero image / product showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="hidden lg:flex justify-center"
            >
              <FloatingProduct>
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute -inset-8 bg-blue-500/10 blur-3xl rounded-full" />

                  <div className="relative w-80 h-80 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700 flex items-center justify-center shadow-2xl">
                    <div className="text-center">
                      <Camera className="w-24 h-24 text-blue-500 mx-auto mb-4" />
                      <p className="text-white font-bold text-xl">BM Pro Dashcam</p>
                      <p className="text-blue-400 font-bold text-2xl mt-2">From {formatCurrency(790)}</p>
                    </div>
                  </div>

                  {/* Floating badges */}
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    className="absolute -top-4 -right-4 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
                  >
                    1080P HD
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    className="absolute -bottom-2 -left-4 bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
                  >
                    Night Vision
                  </motion.div>
                </div>
              </FloatingProduct>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Flagship Product Spotlight */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeInOnScroll>
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700 p-12 flex items-center justify-center aspect-square max-w-lg mx-auto">
                <div className="absolute -inset-4 bg-blue-500/5 blur-2xl rounded-full" />
                <div className="text-center relative">
                  <Camera className="w-32 h-32 text-blue-500/80 mx-auto mb-6" />
                  <p className="text-slate-400 text-sm">BM Pro Dashcam 1080P</p>
                </div>
              </div>
            </FadeInOnScroll>

            <FadeInOnScroll delay={0.2}>
              <div>
                <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Flagship Product</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
                  BM Pro Dashcam 1080P
                </h2>
                <p className="text-slate-400 text-lg mb-6">
                  Crystal-clear 1080P recording with a 170-degree ultra-wide angle lens. Built-in night vision and G-sensor crash detection keep you protected 24/7.
                </p>

                <div className="text-3xl font-bold text-blue-400 mb-8">
                  From {formatCurrency(790)}
                </div>

                {/* Feature icons */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <Video className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-300 font-medium">1080P HD</p>
                  </div>
                  <div className="text-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <Eye className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-300 font-medium">Night Vision</p>
                  </div>
                  <div className="text-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <Zap className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-300 font-medium">G-Sensor</p>
                  </div>
                </div>

                <Link
                  href="#products"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-all hover:shadow-lg hover:shadow-blue-600/25"
                >
                  Shop Now
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-4 py-20">
        <FadeInOnScroll>
          <div className="text-center mb-12">
            <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Our Products</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-3">
              Security Products
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Premium dashcams and accessories for complete road protection
            </p>
          </div>
        </FadeInOnScroll>

        <ProductGrid />
      </section>

      {/* Why BLAQMART */}
      <section id="features" className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <FadeInOnScroll>
            <div className="text-center mb-12">
              <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
                Why BLAQMART Security
              </h2>
            </div>
          </FadeInOnScroll>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StaggerItem>
              <div className="text-center p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition-colors">
                <div className="w-14 h-14 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Nationwide Delivery</h3>
                <p className="text-sm text-slate-400">3-5 business days delivery across all 9 provinces</p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="text-center p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition-colors">
                <div className="w-14 h-14 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Secure Payment</h3>
                <p className="text-sm text-slate-400">Yoco secured checkout with multiple payment options</p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="text-center p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition-colors">
                <div className="w-14 h-14 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">1-Year Warranty</h3>
                <p className="text-sm text-slate-400">Full manufacturer warranty on all dashcam products</p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="text-center p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition-colors">
                <div className="w-14 h-14 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Expert Support</h3>
                <p className="text-sm text-slate-400">Dedicated support team for setup and troubleshooting</p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-blue-500" />
                <span className="text-xl font-bold text-white">BLAQ<span className="text-blue-500">MART</span></span>
              </div>
              <p className="text-slate-400 text-sm">
                Premium security products delivered nationwide across South Africa.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/#products" className="hover:text-white transition-colors">Dashcams</Link></li>
                <li><Link href="/#products" className="hover:text-white transition-colors">Accessories</Link></li>
                <li><Link href="/orders" className="hover:text-white transition-colors">Track Order</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Policies</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><span className="hover:text-white transition-colors cursor-pointer">Shipping Policy</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Returns & Refunds</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center">
            <p className="text-slate-500 text-sm">&copy; 2025 BLAQMART Security. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
