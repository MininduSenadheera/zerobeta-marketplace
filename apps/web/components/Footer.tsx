"use client"
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { Facebook, Instagram, Youtube } from 'lucide-react'
import Link from 'next/link'

function Footer() {
  const router = useRouter()

  return (
    <div className='pt-5 px-5 bg-black text-white'>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <div className='space-y-4 flex flex-col mb-4 sm:items-start items-center'>
          <Image src='/images/logo-white.png' alt='logo' className='sm:text-start text-center' width={200} height={100} />
          <p>150 King Street West, Suite #215,<br /> Toronto, ON M5H 1J9</p>
        </div>
        <div className='space-y-4 flex flex-col mb-4 items-center'>
          <Link href="/">Home</Link>
          <Link href='/products'>Products</Link>
          <Link href='/about'>About</Link>
        </div>
        <div className='space-y-4 text-center sm:text-right'>
          <a href='mailto:minindusenadheera@gmail.com'>minindusenadheera@gmail.com</a>
          <div className='flex sm:justify-end justify-center items-center gap-2 mt-4'>
            <Button variant="ghost" size="icon" onClick={() => router.push('https://www.facebook.com/minindusenadheera/')}>
              <Facebook />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push('https://www.instagram.com/minindu_senadheera/')}>
              <Instagram />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push('https://www.youtube.com/MininduSenadheera')}>
              <Youtube />
            </Button>
          </div>
        </div>
      </div>
      <Separator className='my-4' />
      <div className='flex justify-center items-center gap-4'>
        <Link href='/terms'>Terms and Conditions</Link>
        <Link href='/privacy'>Privacy Policy</Link>
        <Link href='/refund'>Refund Policy</Link>
      </div>
      <div className='flex justify-center items-center my-4'>
        <div className='flex items-center gap-2 flex-wrap'>
          <p className='text-gray-400'>Copyright © 2024 ZeroBeta | All Rights Reserved </p>
          <p className='text-cyan-600'>Developed by <a href='https://minindusenadheera.github.io' target='_blank' rel="noreferrer">Minindu Senadheera</a></p>
        </div>
      </div>
    </div>
  )
}

export default Footer