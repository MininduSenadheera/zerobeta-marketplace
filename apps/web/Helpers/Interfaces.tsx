import { OrderStatusTypes, ShippingMethodTypes, UserRoleTypes } from "./Types"

export interface IProduct {
  id: string
  code: string
  name: string
  images: string[]
  price: number
  description: string
  stock: number
  orderCount: number
  isDeleted: boolean
}

export interface ICartItem {
  productId: IProduct['id']
  quantity: number
}

export interface IOrder {
  id: string
  referenceNo: string
  email: string
  firstname: string
  lastname: string
  mobile: string
  address: string
  city: string
  country: string
  products: {
    product: IProduct,
    quantity: number
    unitPrice: number
  }[]
  shippingMethod: ShippingMethodTypes
  shippingCost: number
  totalPrice: number
  date: Date
  status: OrderStatusTypes
}

export interface IUser {
  id: string
  email: string
  firstname: string
  lastname: string
  country?: string
  userRole: UserRoleTypes
}