import { ProductCard } from "./product-card"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number | null
  images: string[]
  stock: number
  isFeatured: boolean
}

interface ProductGridProps {
  products: Product[]
  columns?: 2 | 3 | 4
}

export function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  }

  return (
    <div className={`grid gap-4 ${gridCols[columns]}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          slug={product.slug}
          price={Number(product.price)}
          comparePrice={
            product.comparePrice ? Number(product.comparePrice) : null
          }
          image={product.images[0]}
          stock={product.stock}
          isFeatured={product.isFeatured}
        />
      ))}
    </div>
  )
}
