import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { shippingCost } from '@/Helpers/Constants'
import { IProduct } from '@/Helpers/Interfaces'
import { ShippingMethodTypes } from '@/Helpers/Types'
import Image from 'next/image'
import { useMemo } from 'react'

interface OrderSummaryProps {
  productsAndQuantities: (IProduct & { quantity: number })[],
  shipping: ShippingMethodTypes
}
function OrderSummary({ productsAndQuantities, shipping }: OrderSummaryProps) {

  const subTotal = useMemo(() => {
    return productsAndQuantities.reduce((acc, item) => {
      const product = item as IProduct
      return acc + (product.price * (item.quantity || 1))
    }, 0)
  }, [productsAndQuantities]);

  return (
    <Card>
      <CardContent className='space-y-4'>
        <h4 className='text-xl'>Order Summary</h4>
        <div className='grid grid-cols-1 gap-2'>
          {productsAndQuantities.map((item, index) => {
            const product = item as IProduct
            return (
              <Card key={index}>
                <CardContent className='flex justify-between items-start gap-3'>
                  <Image
                    src={product.images[0] as string} alt={product.name} width={64} height={64}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className='text-start grow-1'>
                    <h6 className='text-xl'>{product.name}</h6>
                    <p className='text-sm text-muted-foreground'>${product.price.toFixed(2)} X {item.quantity}</p>
                  </div>
                  <p className='font-bold'>${((product.price || 0) * item.quantity).toFixed(2)}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
        <Separator />
        <div className='flex justify-between items-center'>
          <div>
            <p>Subtotal</p>
            <p>Shipping</p>
          </div>
          <div className='text-end'>
            <p>${subTotal.toFixed(2)}</p>
            <p>{shipping === "Delivery" ? `$${shippingCost.toFixed(2)}` : 'Free'}</p>
          </div>
        </div>
        <Separator />
        <div className='flex justify-between items-center'>
          <h4 className='text-xl font-bold'>Total</h4>
          <h4 className='text-xl font-bold'>${(subTotal + (shipping === "Delivery" ? shippingCost : 0)).toFixed(2)}</h4>
        </div>
      </CardContent>
    </Card>
  )
}

export default OrderSummary