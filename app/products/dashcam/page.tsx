'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ProductGallery from '@/components/products/ProductGallery';
import VideoShowcase from '@/components/products/VideoShowcase';
import ShippingCalculator from '@/components/shipping/ShippingCalculator';
import ProductReviews from '@/components/reviews/ProductReviews';
import {
  FadeInOnScroll,
  SlideInFromLeft,
  SlideInFromRight,
  StaggerContainer,
  StaggerItem,
} from '@/components/products/ProductAnimations';
import { useCartStore } from '@/lib/store/cart-store';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Shield,
  Truck,
  RotateCcw,
  Award,
  Loader2,
  Video,
  Eye,
  Zap,
  RefreshCw,
  Gauge,
  Camera,
  Check,
  ChevronRight,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  images: string[];
  videoUrl: string | null;
  stock: number;
  isActive: boolean;
  category: string;
  sku: string | null;
  specs: Record<string, any> | null;
  store: {
    id: string;
    name: string;
  };
}

export default function DashcamPage() {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  // Fetch flagship dashcam product (first SECURITY_DASHCAM product by price)
  useEffect(() => {
    async function fetchProducts() {
      try {
        // Fetch dashcams
        const res = await fetch('/api/products?category=SECURITY_DASHCAM&sortBy=price-asc&limit=1');
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProduct(data.products[0]);
        }

        // Fetch accessories for "Related Products"
        const accessoriesRes = await fetch('/api/products?category=SECURITY_ACCESSORY');
        const accessoriesData = await accessoriesRes.json();
        setRelatedProducts(accessoriesData.products || []);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
      storeId: product.store.id,
      storeName: product.store.name,
    });

    if (quantity > 1) {
      updateQuantity(product.id, quantity);
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950">
        <Header />
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-slate-950">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Product Not Available</h1>
          <a href="/" className="text-blue-400 hover:underline">Return to homepage</a>
        </div>
      </main>
    );
  }

  // Extract YouTube video ID from URL
  const videoId = product.videoUrl
    ? product.videoUrl.split('/').pop()?.split('?')[0] || ''
    : '';

  const specs = product.specs || {};

  return (
    <main className="min-h-screen bg-slate-950">
      <Header />

      {/* Video Hero */}
      {videoId && (
        <section className="max-w-5xl mx-auto px-4 pt-8">
          <VideoShowcase
            videoId={videoId}
            title="See It In Action"
          />
        </section>
      )}

      {/* Product Gallery + Purchase Panel */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <FadeInOnScroll>
            <ProductGallery
              images={product.images || []}
              productName={product.name}
            />
          </FadeInOnScroll>

          {/* Purchase Panel */}
          <FadeInOnScroll delay={0.2}>
            <div className="space-y-6">
              {/* Category badge */}
              <span className="inline-flex items-center gap-1.5 bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">
                <Camera className="w-3 h-3" />
                Dashcam
              </span>

              <h1 className="text-3xl md:text-4xl font-bold text-white">{product.name}</h1>

              {product.sku && (
                <p className="text-sm text-slate-500">SKU: {product.sku}</p>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-blue-400">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-lg text-slate-500 line-through">
                  {formatCurrency(product.price * 1.25)}
                </span>
                <span className="bg-green-600/20 text-green-400 px-2 py-0.5 rounded text-xs font-semibold">
                  Save 20%
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-slate-400 leading-relaxed">{product.description}</p>
              )}

              {/* Quick specs grid */}
              <div className="grid grid-cols-2 gap-3">
                {specs.resolution && (
                  <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <Video className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{specs.resolution}</span>
                  </div>
                )}
                {specs.angle && (
                  <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <Eye className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{specs.angle}</span>
                  </div>
                )}
                {specs.nightVision && (
                  <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <Eye className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-sm text-slate-300">Night Vision</span>
                  </div>
                )}
                {specs.gSensor && (
                  <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-sm text-slate-300">G-Sensor</span>
                  </div>
                )}
              </div>

              {/* Shipping Calculator */}
              <ShippingCalculator subtotal={product.price * quantity} />

              {/* Quantity + Add to Cart */}
              {product.stock > 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 border border-slate-600 rounded-lg hover:bg-slate-800 text-white transition-colors"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-semibold text-white">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-10 h-10 border border-slate-600 rounded-lg hover:bg-slate-800 text-white transition-colors"
                      >
                        +
                      </button>
                    </div>
                    {product.stock <= 10 && (
                      <p className="text-sm text-amber-500 mt-2">Only {product.stock} left in stock</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleAddToCart}
                      whileTap={{ scale: 0.97 }}
                      className={`flex-1 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                        addedToCart
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-800 text-white border border-slate-600 hover:bg-slate-700'
                      }`}
                    >
                      {addedToCart ? (
                        <>
                          <Check className="w-5 h-5" />
                          Added!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          Add to Cart
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      onClick={handleBuyNow}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-all hover:shadow-lg hover:shadow-blue-600/25 flex items-center justify-center gap-2"
                    >
                      Buy Now
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-center">
                  <p className="text-red-400 font-semibold">Out of Stock</p>
                </div>
              )}

              {/* Trust signals */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="text-center p-2">
                  <Shield className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">Secure Payment</p>
                </div>
                <div className="text-center p-2">
                  <RotateCcw className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">7-Day Returns</p>
                </div>
                <div className="text-center p-2">
                  <Award className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">1-Year Warranty</p>
                </div>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Scroll-Animated Feature Showcase */}
      <section className="py-20 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 space-y-24">
          <FadeInOnScroll>
            <div className="text-center mb-8">
              <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Features</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">Built for the Road</h2>
            </div>
          </FadeInOnScroll>

          {/* Feature 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <SlideInFromLeft>
              <div className="bg-slate-800/50 rounded-3xl border border-slate-700/50 p-12 flex items-center justify-center aspect-video">
                <Video className="w-24 h-24 text-blue-500/60" />
              </div>
            </SlideInFromLeft>
            <SlideInFromRight>
              <div>
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">1080P Full HD Recording</h3>
                <p className="text-slate-400 leading-relaxed">
                  Capture every detail with crystal-clear 1080P resolution. Read license plates, road signs, and identify other vehicles with ease. Perfect evidence in case of an incident.
                </p>
              </div>
            </SlideInFromRight>
          </div>

          {/* Feature 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <SlideInFromLeft className="lg:order-2">
              <div className="bg-slate-800/50 rounded-3xl border border-slate-700/50 p-12 flex items-center justify-center aspect-video">
                <Gauge className="w-24 h-24 text-blue-500/60" />
              </div>
            </SlideInFromLeft>
            <SlideInFromRight className="lg:order-1">
              <div>
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4">
                  <Gauge className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">170-Degree Wide Angle</h3>
                <p className="text-slate-400 leading-relaxed">
                  Ultra-wide 170-degree lens covers the full width of the road ahead. No blind spots, no missed details. See everything happening around your vehicle.
                </p>
              </div>
            </SlideInFromRight>
          </div>

          {/* Feature 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <SlideInFromLeft>
              <div className="bg-slate-800/50 rounded-3xl border border-slate-700/50 p-12 flex items-center justify-center aspect-video">
                <Eye className="w-24 h-24 text-blue-500/60" />
              </div>
            </SlideInFromLeft>
            <SlideInFromRight>
              <div>
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Night Vision Technology</h3>
                <p className="text-slate-400 leading-relaxed">
                  Advanced infrared night vision ensures clear recording even in complete darkness. Whether you're driving late at night or parked in a dark lot, you're covered.
                </p>
              </div>
            </SlideInFromRight>
          </div>

          {/* Feature 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <SlideInFromLeft className="lg:order-2">
              <div className="bg-slate-800/50 rounded-3xl border border-slate-700/50 p-12 flex items-center justify-center aspect-video">
                <Zap className="w-24 h-24 text-blue-500/60" />
              </div>
            </SlideInFromLeft>
            <SlideInFromRight className="lg:order-1">
              <div>
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">G-Sensor Crash Detection</h3>
                <p className="text-slate-400 leading-relaxed">
                  Built-in G-sensor automatically detects sudden impacts and locks the current recording to prevent overwriting. Your critical evidence is always protected.
                </p>
              </div>
            </SlideInFromRight>
          </div>

          {/* Feature 5 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <SlideInFromLeft>
              <div className="bg-slate-800/50 rounded-3xl border border-slate-700/50 p-12 flex items-center justify-center aspect-video">
                <RefreshCw className="w-24 h-24 text-blue-500/60" />
              </div>
            </SlideInFromLeft>
            <SlideInFromRight>
              <div>
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4">
                  <RefreshCw className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Loop Recording</h3>
                <p className="text-slate-400 leading-relaxed">
                  Continuous loop recording automatically overwrites the oldest footage when your SD card is full. Set it and forget it - your dashcam runs 24/7 without manual intervention.
                </p>
              </div>
            </SlideInFromRight>
          </div>
        </div>
      </section>

      {/* Specifications Table */}
      {specs && Object.keys(specs).length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-20">
          <FadeInOnScroll>
            <div className="text-center mb-8">
              <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Details</span>
              <h2 className="text-3xl font-bold text-white mt-2">Technical Specifications</h2>
            </div>

            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
              {Object.entries(specs).map(([key, value], index) => (
                <div
                  key={key}
                  className={`flex justify-between items-center px-6 py-4 ${
                    index % 2 === 0 ? 'bg-slate-800/30' : ''
                  } ${index < Object.entries(specs).length - 1 ? 'border-b border-slate-700/30' : ''}`}
                >
                  <span className="text-slate-400 text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-white text-sm font-medium">
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </FadeInOnScroll>
        </section>
      )}

      {/* Reviews */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <FadeInOnScroll>
          <ProductReviews productId={product.id} />
        </FadeInOnScroll>
      </section>

      {/* Related Products - Accessories */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-20">
          <FadeInOnScroll>
            <div className="text-center mb-10">
              <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Accessories</span>
              <h2 className="text-3xl font-bold text-white mt-2">Complete Your Setup</h2>
            </div>
          </FadeInOnScroll>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((item) => (
              <StaggerItem key={item.id}>
                <a
                  href={`/products/${item.id}`}
                  className="block bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500/30 p-5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Camera className="w-8 h-8 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                        {item.name}
                      </h3>
                      <p className="text-blue-400 font-bold">{formatCurrency(item.price)}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                  </div>
                </a>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}
    </main>
  );
}
