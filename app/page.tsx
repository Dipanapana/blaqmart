'use client';

import Header from '@/components/Header';
import ProductGrid from '@/components/products/ProductGrid';
import { Package, Truck, Shield, Clock } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Shop Local in Warrenton
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-50">
              Fast delivery from your favorite local vendors. Fresh groceries, household essentials, and more!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#products"
                className="px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Browse Products
              </a>
              <Link
                href="/vendor/signup"
                className="px-8 py-3 bg-green-800 text-white font-semibold rounded-lg hover:bg-green-900 transition-colors border-2 border-green-400"
              >
                Become a Vendor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Fast Delivery</h3>
              <p className="text-sm text-gray-600">Get your order in 45 minutes or less</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Local Products</h3>
              <p className="text-sm text-gray-600">Support Warrenton businesses</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-sm text-gray-600">Fresh products, every time</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Open Daily</h3>
              <p className="text-sm text-gray-600">Order anytime, 7 days a week</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Browse Products</h2>
          <p className="text-gray-600 text-lg">
            Discover fresh groceries and essentials from local vendors
          </p>
        </div>
        <ProductGrid />
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg font-semibold mb-2">BLAQMART</p>
          <p className="text-gray-400">Building the future of local commerce in Warrenton</p>
          <p className="text-gray-500 text-sm mt-4">© 2025 BLAQMART. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
