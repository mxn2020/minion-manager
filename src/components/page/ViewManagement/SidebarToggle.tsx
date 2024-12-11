// components/ViewManagement/SidebarToggle.tsx
import { memo } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal } from 'lucide-react'

interface SidebarToggleProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  hasFilters?: boolean
  children: React.ReactNode
}

export const SidebarToggle = memo(function SidebarToggle({ 
  isOpen, 
  onOpenChange,
  hasFilters,
  children 
}: SidebarToggleProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {hasFilters && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  )
})
