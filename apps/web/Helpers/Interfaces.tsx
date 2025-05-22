import { OrderStatusTypes, ShippingMethodTypes, UserRoleTypes } from "./Types"

export interface IProduct {
  id: string
  code: string
  name: string
  price: string
  description: string
  stock: number
  orderCount: number
  seller: IUser
  isDeleted: boolean
}

export interface ICartItem {
  productId: IProduct['id']
  quantity: number
}

export interface IOrder {
  id: string
  referenceNo: string
  address: string
  city: string
  country: string
  buyer: IUser
  items: {
    product: IProduct,
    quantity: number
    unitPrice: string
  }[]
  shipping: ShippingMethodTypes
  shippingCost: string
  createdAt: Date
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