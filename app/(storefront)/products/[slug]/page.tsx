import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, ShoppingBag } from "lucide-react"
import { db } from "@/lib/db"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductGrid } from "@/components/storefront/product-grid"
import { AddToCartButton } from "@/components/storefront/add-to-cart-button"

interface ProductPageProps {
  params: { slug: string }
}

async function getProduct(slug: string) {
  const product = await db.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true },
  })

  if (!product) return null

  // Get related products
  const relatedProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      isActive: true,
      id: { not: product.id },
    },
    take: 4,
  })

  return { product, relatedProducts }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const data = await getProduct(params.slug)

  if (!data) {
    notFound()
  }

  const { product: rawProduct, relatedProducts } = data

  // Transform product data
  const product = {
    ...rawProduct,
    price: Number(rawProduct.price),
    comparePrice: rawProduct.comparePrice ? Number(rawProduct.comparePrice) : null,
    images: typeof rawProduct.images === 'string'
      ? JSON.parse(rawProduct.images) as string[]
      : (rawProduct.images || []) as string[],
    tags: typeof rawProduct.tags === 'string'
      ? JSON.parse(rawProduct.tags) as string[]
      : (rawProduct.tags || []) as string[],
  }

  const isOnSale = product.comparePrice && product.comparePrice > product.price
  const isOutOfStock = product.stock <= 0

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/products" className="hover:text-primary">
          Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/categories/${product.category.slug}`}
          className="hover:text-primary"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ShoppingBag className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
            {isOnSale && (
              <Badge variant="destructive" className="absolute left-4 top-4">
                Sale
              </Badge>
            )}
          </div>
          {/* Thumbnail gallery */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted"
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">
              {product.category.name}
            </p>
            <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">
              {formatPrice(Number(product.price))}
            </span>
            {isOnSale && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(Number(product.comparePrice))}
              </span>
            )}
          </div>

          {/* Stock status */}
          <div>
            {isOutOfStock ? (
              <Badge variant="secondary">Out of Stock</Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="warning">Only {product.stock} left</Badge>
            ) : (
              <Badge variant="success">In Stock</Badge>
            )}
          </div>

          {/* Add to cart */}
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              price: Number(product.price),
              image: product.images[0] || "",
              stock: product.stock,
            }}
          />

          {/* Tabs */}
          <Tabs defaultValue="description" className="mt-8">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="delivery">Delivery Info</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <p className="text-muted-foreground">
                {product.description || "No description available."}
              </p>
              {product.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="delivery" className="mt-4">
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong>Same-Day Delivery:</strong> Order before 2pm for
                  same-day delivery in Pretoria.
                </p>
                <p>
                  <strong>Delivery Areas:</strong> We deliver to Pretoria
                  Central, East, North, and Centurion.
                </p>
                <p>
                  <strong>Delivery Fee:</strong> Starting from R50. Free
                  delivery on orders over R500.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
          <ProductGrid
            products={relatedProducts.map((p) => ({
              ...p,
              price: Number(p.price),
              comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
              images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
            }))}
            columns={4}
          />
        </section>
      )}
    </div>
  )
}
