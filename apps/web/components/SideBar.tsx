"use client"
import { Facebook, Instagram, Youtube } from 'lucide-react';
import { Button } from './ui/button';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar'
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import { getNavLinks } from '@/Helpers/Utils';

function SideBar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useContext(AuthContext)

  return (
    <Sidebar>
      <SidebarHeader>
        <Image src='/images/logo.png' alt='logo' className='img-fluid' width={200} height={100} />
      </SidebarHeader>
      <SidebarContent className='p-4'>
        <SidebarMenu>
          {getNavLinks(user?.userRole as string).map((navLink) => (
            <SidebarMenuItem key={navLink.label}>
              <SidebarMenuButton asChild isActive={navLink.path === pathname}>
                <Link href={navLink.path}>{navLink.label}</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className='flex items-center gap-2 mt-4'>
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
      </SidebarFooter>
    </Sidebar>
  )
}

export default SideBar