'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const NavItems = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      <Button variant="ghost" asChild onClick={onItemClick}>
        <Link href="/">Dashboard</Link>
      </Button>
      <Button variant="ghost" asChild onClick={onItemClick}>
        <Link href="/calendar">Calendar</Link>
      </Button>
      <Button variant="ghost" asChild onClick={onItemClick}>
        <Link href="/dependencies">Dependencies</Link>
      </Button>
      <Button variant="ghost" asChild onClick={onItemClick}>
        <Link href="/archived">Archived</Link>
      </Button>
      <Button variant="ghost" asChild onClick={onItemClick}>
        <Link href="/settings">Settings</Link>
      </Button>
      <Button variant="ghost" asChild onClick={onItemClick}>
        <Link href="/help">Help</Link>
      </Button>
      <Button variant="ghost" asChild onClick={onItemClick}>
        <Link href="/admin">Admin</Link>
      </Button>
    </>
  )

  return (
    <nav className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">
            Minion Management
          </Link>
          <div className="hidden md:flex space-x-4">
            <NavItems />
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col space-y-4 mt-4">
                <NavItems onItemClick={() => setIsOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}

