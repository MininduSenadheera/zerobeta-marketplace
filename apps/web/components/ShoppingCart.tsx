"use client"
import { useContext, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from './ui/sheet'
import { Trash } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { ICartItem, IProduct } from '@/Helpers/Interfaces'
import { CartContext } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import QuantityField from './QuantityField'

function ShoppingCart(props: { isCartOpen: boolean, setIsCartOpen: CallableFunction }) {
  const router = useRouter()
  const { clearCart, removeFromCart, updateQuantity } = useContext(CartContext)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [products, setProducts] = useState<IProduct[]>([])
  const [productQuantities, setProductQuantities] = useState<ICartItem[]>([])

  useEffect(() => {
    if (!props.isCartOpen) return
    fetchCartProducts()
  }, [props.isCartOpen])

  const fetchCartProducts = async () => {
    try {
      setIsLoading(true)
      const ids = JSON.parse(localStorage.getItem('cart') || '[]').map((item: ICartItem) => item.productId)
      if (ids.length === 0) {
        setProducts([])
        setProductQuantities([])
        return
      }
      // TODO: Fetch products by IDs from server
      setProducts([])
      setProductQuantities(JSON.parse(localStorage.getItem('cart') || '[]'))
    } catch (error) {
      console.log('Error getting products: ', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSubTotal = () => {
    return productQuantities.reduce((acc, item) => {
      const product = products.find(product => product.id === item.productId)
      return acc + (product?.price || 0) * item.quantity
    }, 0)
  }

  return (
    <Sheet open={props.isCartOpen} onOpenChange={() => props.setIsCartOpen(!props.isCartOpen)}>
      <SheetContent className="flex flex-col gap-4 w-full sm:max-w-md">
        <SheetHeader className='border-b'>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>
        {isLoading ? (
          <div className="flex justify-center items-center flex-grow">Loading...</div>
        ) : (
          <div className="grow-1 overflow-y-auto px-4">
            {productQuantities.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {productQuantities.map((item, index) => {
                  const product = products.find(p => p.id === item.productId) as IProduct
                  return (
                    <Card key={index} className="border rounded-md">
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <Image
                            src={product.images[0] as string} alt={product.name} width={64} height={64}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1 space-y-1">
                            <h2
                              className="text-md font-semibold hover:underline cursor-pointer"
                              onClick={() => { router.push(`/product/${product.id}`); props.setIsCartOpen(false) }}
                            >
                              {product.name}
                            </h2>
                            <p className="text-sm text-muted-foreground">Price: {product.price.toFixed(2)} LKR</p>
                          </div>
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => { removeFromCart(product.id); fetchCartProducts() }}
                          >
                            <Trash />
                          </Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <QuantityField
                            quantity={item.quantity}
                            setQuantity={(q: number) => { updateQuantity(product.id, q); fetchCartProducts() }}
                          />
                          <p className="font-semibold">
                            {(product.price * item.quantity).toFixed(2)} LKR
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <h3 className="text-lg mb-2">No items in cart</h3>
                <Button onClick={() => { props.setIsCartOpen(false); router.push('/products') }}>
                  Return to Shop
                </Button>
              </div>
            )}
          </div>
        )}
        <SheetFooter className='p-5 border-t'>
          {productQuantities.length > 0 ? (
            <div className="w-full space-y-3">
              <div className="flex justify-between">
                <p className="font-medium">Subtotal</p>
                <p className="font-bold">{getSubTotal().toFixed(2)} LKR</p>
              </div>
              <p className="text-xs text-muted-foreground"> Shipping costs calculated during checkout. </p>
              <div className="flex justify-between gap-2">
                <div className='w-full'>
                  <Button
                    variant="outline" className='w-full'
                    onClick={() => { props.setIsCartOpen(false); router.push('/shop') }}
                  >
                    Continue Shopping
                  </Button>
                </div>
                <div className='w-full'>
                  <Button className='w-full' onClick={() => { props.setIsCartOpen(false); router.push('/checkout') }}>
                    Checkout
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost" className="w-full text-muted-foreground"
                onClick={() => { clearCart(); fetchCartProducts() }}
              >
                Clear Cart
              </Button>
            </div>
          ) : (
            <div className="flex justify-center items-center">
              <Button variant="outline" className='w-full' onClick={() => { props.setIsCartOpen(false); router.push('/products') }}>
                Add Items
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default ShoppingCart