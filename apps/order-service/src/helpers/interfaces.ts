import { UserRoleTypes } from "./types"

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
  seller: IUser
  createdAt: Date
  updatedAt: Date
}

export interface IUser {
  id: string
  email: string
  firstname: string
  lastname: string
  country?: string
  userRole: UserRoleTypes
}

export interface IStockUpdatePayload {
  type: 'increase' | 'decrease'
  items: {
    productId: string
    quantity: number
  }[]
}