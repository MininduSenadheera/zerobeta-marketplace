import Image from "next/image"
import { Card, CardAction, CardContent } from "./ui/card"
import { IProduct } from "@/Helpers/Interfaces"
import { useRouter } from "next/navigation"

function ProductCard(props: { product: IProduct }) {
  const router = useRouter()

  return (
    <Card className="p-0 hover:shadow-lg transition-shadow">
      <CardAction onClick={() => router.push(`/products/${props.product.id}`)}>
        <Image
          src={props.product.images[0] as string} alt={props.product.name}
          width={400} height={300}
          className="w-full h-60 object-cover rounded-t-xl"
        />
        <CardContent className="py-4">
          <h2 className="text-lg font-semibold">{props.product.name}</h2>
          <p className="text-sm text-muted-foreground">{props.product.description}</p>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-md font-medium">${props.product.price}</p>
            <p className="text-sm text-muted-foreground">{props.product.orderCount} sold</p>
          </div>
        </CardContent>
      </CardAction>
    </Card>
  )
}

export default ProductCard