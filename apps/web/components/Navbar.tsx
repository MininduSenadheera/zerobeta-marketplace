"use client"
import { useContext, useState } from 'react'
import ShoppingCart from './ShoppingCart'
import { AuthContext } from '@/context/AuthContext'
import { CartContext } from '@/context/CartContext'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Search, ShoppingCartIcon, UserCircle } from 'lucide-react'
import Image from 'next/image'
import { Avatar, AvatarFallback } from './ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { SidebarTrigger } from './ui/sidebar'
import { getNavLinks } from '@/Helpers/Utils'
import { DropdownMenuLabel } from '@radix-ui/react-dropdown-menu'
import { Separator } from './ui/separator'

function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const { cart } = useContext(CartContext)
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false)
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false)
  const router = useRouter()
  const pathname = usePathname()

  return (
    <header className='px-4 py-2 flex items-center backdrop-blur-xl shadow-sm sticky top-0 z-50 bg-white'>
      <SidebarTrigger className='flex md:hidden' />
      <Button
        size="icon" variant="ghost" onClick={() => setIsSearchOpen(!isSearchOpen)}
        className='flex md:hidden'
      >
        <Search />
      </Button>
      <div className='grow-1 flex justify-center sm:justify-start'>
        <Image
          src="/images/logo.png" width={100} height={100} className='cursor-pointer' alt='logo'
          onClick={() => router.push('/')}
        />
      </div>
      <div className='hidden md:flex justify-between gap-2'>
        {getNavLinks(user?.userRole as string).map((link, index) => (
          <Button
            key={index} variant="link" onClick={() => router.push(link.path)}
            className={`${pathname === link.path ? 'underline' : ''} `}
          >
            {link.label}
          </Button>
        ))}
      </div>
      <div className='flex gap-2 items-center'>
        <Button
          size="icon" variant="ghost" onClick={() => setIsSearchOpen(!isSearchOpen)}
          className='hidden sm:flex'
        >
          <Search />
        </Button>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className='cursor-pointer'>
                <AvatarFallback>
                  {user.firstname.charAt(0).toUpperCase()}{user.lastname.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className='p-2'>
                <DropdownMenuLabel>{user.firstname} {user.lastname}</DropdownMenuLabel>
                <DropdownMenuLabel className='text-sm'>{user.userRole}</DropdownMenuLabel>
              </div>
              <Separator className='my-3' />
              <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => router.push('/signin')}>
            <UserCircle />
          </Button>
        )}
        {pathname !== '/checkout' && (
          <Button variant="ghost" onClick={() => setIsCartOpen((prevState) => !prevState)}>
            <ShoppingCartIcon />
            {cart.length > 0 && (
              <span className='bg-red-500 text-white rounded-full px-1 text-xs'>
                {cart.length}
              </span>
            )}
          </Button>
        )}
      </div>
      <ShoppingCart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </header>
  )
}

export default Navbar