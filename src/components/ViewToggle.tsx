import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { List, Grid, LayoutGrid } from 'lucide-react'

interface ViewToggleProps {
  currentView: 'list' | 'cards' | 'icons'
  onViewChange: (view: 'list' | 'cards' | 'icons') => void
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <ToggleGroup type="single" value={currentView} onValueChange={onViewChange as any}>
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
}

