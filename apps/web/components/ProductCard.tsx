import Image from "next/image"
import { Card, CardAction, CardContent } from "./ui/card"
import { IProduct } from "@/Helpers/Interfaces"
import { useRouter } from "next/navigation"
import { Badge } from "./ui/badge"

function ProductCard({ product }: { product: IProduct }) {
  const router = useRouter()

  return (
    <Card className="p-0 cursor-pointer overflow-hidden rounded-xl hover:shadow-lg transition-shadow">
      <CardAction onClick={() => router.push(`/products/${product.id}`)}>
        <Image
          src='/images/product.png' alt={product.name}
          width={400} height={300} priority
          className="w-full h-60 object-cover rounded-t-xl"
        />
        <CardContent className="py-4">
          <h2 className="text-lg font-semibold truncate">{product.name}</h2>
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <p className="text-md font-medium">${product.price}</p>
              <p className="text-sm text-muted-foreground">{product.orderCount} sold</p>
            </div>
            {product.stock === 0 && (
              <Badge variant="destructive"> Out of Stock</Badge>
            )}
          </div>
        </CardContent>
      </CardAction>
    </Card>
  )
}

export default ProductCard