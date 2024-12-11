// components/ViewManagement/ViewToggle.tsx
import { memo } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { List, Grid, LayoutGrid } from 'lucide-react'
import { ViewMode } from '@/types'

interface ViewToggleProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
}

export const ViewToggle = memo(function ViewToggle({ 
  currentView, 
  onViewChange 
}: ViewToggleProps) {
  return (
    <ToggleGroup type="single" value={currentView} onValueChange={onViewChange}>
      <ToggleGroupItem value="list" aria-label="List view">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="cards" aria-label="Card view">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="icons" aria-label="Icon view">
        <Grid className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
})
