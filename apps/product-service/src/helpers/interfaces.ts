import {  UserRoleTypes } from "./types"

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
}

export interface IUser {
  id: string
  email: string
  firstname: string
  lastname: string
  country?: string
  userRole: UserRoleTypes
}