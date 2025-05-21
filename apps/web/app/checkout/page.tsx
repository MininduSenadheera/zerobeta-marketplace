"use client"
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { CartContext } from '@/context/CartContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { ICartItem, IProduct } from '@/Helpers/Interfaces'
import { shippingCost } from '@/Helpers/Constants'
import { OrderStatusTypes, ShippingMethodTypes } from '@/Helpers/Types'
import OrderSummary from './OrderSummary'
import { AuthContext } from '@/context/AuthContext'
import axios from 'axios'
import config from '@/Helpers/config'
import { toast } from 'sonner'

function Checkout() {
  const router = useRouter()
  const { user } = useContext(AuthContext)
  const { cart, clearCart } = useContext(CartContext)
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const quantity = searchParams.get('quantity') ? parseInt(searchParams.get('quantity') as string) : 1;
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isOrderPlacing, setIsOrderPlacing] = useState<boolean>(false)
  const [products, setProducts] = useState<IProduct[]>([])
  const [productQuantities, setProductQuantities] = useState<ICartItem[]>([])

  const [formData, setFormData] = useState({
    email: '',
    firstname: '',
    lastname: '',
    address: '',
    city: '',
    country: '',
    shipping: 'Deliver'
  })

  useEffect(() => {
    if (productId !== null) {
      fetchProducts([{ productId, quantity }])
    } else if (cart.length > 0) {
      fetchProducts(cart)
    } else {
      router.back()
    }

    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const fetchProducts = async (productList: ICartItem[]) => {
    try {
      setIsLoading(true)
      const ids = productList.map((item: ICartItem) => item.productId)
      if (ids.length === 0) {
        setProducts([])
        setProductQuantities([])
        return
      }
      const response = await axios.post<IProduct[]>(config.apiUrl + 'products/by-ids', {
        productIds: ids
      })
      setProducts(response.data)
      setProductQuantities(productList)
    } catch (error) {
      console.log('Error getting documents: ', error)
    } finally {
      setIsLoading(false)
    }
  }

  const productsAndQuantities = useMemo(() => {
    return productQuantities.map(item => {
      const product = products.find(p => p.id === item.productId) as IProduct;
      return { ...product, quantity: item.quantity };
    }).filter(p => p);
  }, [products, productQuantities]);


  if (isLoading || products.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { email, firstname, lastname, address, city, country, shipping } = formData

    const order = {
      buyerId: user?.id || '',
      email,
      firstname,
      lastname,
      address,
      city,
      country,
      productQuantities: [
        ...productsAndQuantities.map((item) => {
          const product = item as IProduct
          return {
            productId: product.id,
            unitPrice: product.price,
            quantity: item.quantity
          }
        })
      ],
      shipping,
      shippingCost: shipping === "Delivery" ? shippingCost : 0,
      status: 'Pending' as OrderStatusTypes,
    }

    try {
      setIsOrderPlacing(true)
      await axios.post(config.apiUrl + 'orders/create', order)
      if (!productId) {
        clearCart()
      }
      toast.success('Order placed successfully!')
      if (user) {
        router.push('/orders')
      } else {
        router.push('/products')
      }
    } catch (e) {
      console.error("Error saving order: ", e);
    } finally {
      setIsOrderPlacing(false)
    }
  }

  return (
    <div className='container mx-auto h-full px-4 sm:px-0 py-10'>
      <h2 className='text-3xl'>Checkout</h2>
      <div className='flex justify-between flex-wrap-reverse sm:flex-nowrap gap-8 mt-5'>
        <form onSubmit={handleSubmit} className='space-y-4 w-full'>
          <h4 className='text-xl'>Customer Information</h4>
          <Input
            id='email' name="email" type='email' placeholder='Email' required
            value={formData.email} onChange={handleChange}
          />
          <div className="grid gid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="firstname" name="firstname" type="text" placeholder="First Name"
              value={formData.firstname} onChange={handleChange} required
            />
            <Input
              id="lastname" name="lastname" type="text" placeholder="Last Name"
              value={formData.lastname} onChange={handleChange} required
            />
          </div>
          <Input id='address' name="address" type='text' placeholder='Address' required value={formData.address} onChange={handleChange} />
          <div className="grid gid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="city" name="city" type="text" placeholder="City"
              value={formData.city} onChange={handleChange} required
            />
            <Input
              id="country" name="country" type="text" placeholder="Country"
              value={formData.country} onChange={handleChange} required
            />
          </div>
          <h4 className='text-xl'>Shipping Method</h4>
          <RadioGroup value={formData.shipping} name="shipping" onValueChange={(value) => setFormData({ ...formData, shipping: value })} required>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Deliver" id="Deliver" />
              <Label htmlFor="Deliver">Delivery within 2 to 5 working days - ${shippingCost.toFixed(2)}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Pickup" id="Pickup" />
              <Label htmlFor="Pickup">Pickup from store - Free</Label>
            </div>
          </RadioGroup>
          <div className="flex items-center space-x-2 mt-8">
            <Checkbox id="terms" required />
            <Label htmlFor="terms">Accept terms and conditions</Label>
          </div>
          <Button type='submit' className='w-full' disabled={isOrderPlacing}>
            {isOrderPlacing && <Loader2 className="animate-spin" />} Place Order
          </Button>
        </form>
        <div className='w-full sm:w-3/5'>
          <OrderSummary productsAndQuantities={productsAndQuantities} shipping={formData.shipping as ShippingMethodTypes} />
        </div>
      </div>
    </div>
  )
}

export default Checkout