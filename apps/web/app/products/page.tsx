'use client'
import ProductCard from "@/components/ProductCard"
import { Skeleton } from "@/components/ui/skeleton"
import { IProduct } from "@/Helpers/Interfaces"
import { useEffect, useState } from "react"

export default function Products() {
  const [products, setProducts] = useState<IProduct[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        //TODO: Fetch products from server
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const renderSkeletons = () => (
    Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="flex flex-col space-y-3 w-full">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ))
  )

  return (
    <div className="container mx-auto h-full px-4 sm:px-0 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? renderSkeletons() : products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
} 
