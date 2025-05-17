import { navLinks } from "./Constants"

export const getNavLinks = (userRole: string) => {
  if (userRole === 'Seller') {
    return navLinks.filter((navLink) => navLink.sellerOnly === true || navLink.buyerOnly === false)
  } else if (userRole === 'Buyer') {
    return navLinks.filter((navLink) => navLink.buyerOnly === true || navLink.sellerOnly === false)
  } else {
    return navLinks.filter((navLink) => navLink.sellerOnly === false && navLink.buyerOnly === false)
  }
}