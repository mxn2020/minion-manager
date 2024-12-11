// components/ViewManagement/ViewContainer.tsx
import { memo } from 'react'
import { useViewManagement } from '@/hooks/useViewManagement'
import { ViewToggle } from './ViewToggle'
import { SidebarToggle } from './SidebarToggle'
import { useMediaQuery } from '@/hooks/use-media-query'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ViewContainerProps {
  sidebar: React.ReactNode
  hasFilters?: boolean
  children: React.ReactNode
}

export const ViewContainer = memo(function ViewContainer({
  sidebar,
  hasFilters,
  children
}: ViewContainerProps) {
  const { 
    viewMode, 
    isSidebarOpen, 
    handleViewModeChange, 
    handleSidebarToggle 
  } = useViewManagement()
  
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <div className="flex items-center gap-4">
          <ViewToggle
            currentView={viewMode}
            onViewChange={handleViewModeChange}
          />
          {isMobile && (
            <SidebarToggle
              isOpen={isSidebarOpen}
              onOpenChange={handleSidebarToggle}
              hasFilters={hasFilters}
            >
              <ScrollArea className="h-[calc(100vh-4rem)] pr-4">
                {sidebar}
              </ScrollArea>
            </SidebarToggle>
          )}
        </div>
        {children}
      </div>

      {!isMobile && (
        <div className="hidden md:block">
          {sidebar}
        </div>
      )}
    </div>
  )
})
