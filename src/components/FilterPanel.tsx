import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import { FilterCriteria } from '@/types'

interface FilterPanelProps {
  onFilterChange: (filters: FilterCriteria) => void
  currentFilters: FilterCriteria
  onClear: () => void
}

export function FilterPanel({ onFilterChange, currentFilters, onClear }: FilterPanelProps) {
  const [search, setSearch] = useState(currentFilters.search || '')

  useEffect(() => {
    setSearch(currentFilters.search || '')
  }, [currentFilters.search])

  const handleFilterChange = (key: keyof FilterCriteria, value: any) => {
    onFilterChange({ ...currentFilters, [key]: value })
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    // Debounce search updates
    const timeoutId = setTimeout(() => {
      handleFilterChange('search', value)
    }, 300)
    return () => clearTimeout(timeoutId)
  }

  const getActiveFilterCount = () => {
    return Object.keys(currentFilters).filter(key => {
      const value = currentFilters[key as keyof FilterCriteria]
      if (value === undefined || value === '') return false
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== undefined)
      }
      return true
    }).length
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Filters</h2>
        {getActiveFilterCount() > 0 && (
          <Button 
            onClick={onClear} 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Search</Label>
          <Input
            placeholder="Search minions..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={currentFilters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={currentFilters.priority}
            onValueChange={(value) => handleFilterChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Due Date Range</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {currentFilters.dueDate?.start ? 
                    format(new Date(currentFilters.dueDate.start), 'PP') : 
                    'Start date'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={currentFilters.dueDate?.start ? new Date(currentFilters.dueDate.start) : undefined}
                  onSelect={(date) => handleFilterChange('dueDate', {
                    ...currentFilters.dueDate,
                    start: date?.toISOString()
                  })}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {currentFilters.dueDate?.end ? 
                    format(new Date(currentFilters.dueDate.end), 'PP') : 
                    'End date'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={currentFilters.dueDate?.end ? new Date(currentFilters.dueDate.end) : undefined}
                  onSelect={(date) => handleFilterChange('dueDate', {
                    ...currentFilters.dueDate,
                    end: date?.toISOString()
                  })}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Other Filters</Label>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={currentFilters.archived ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleFilterChange('archived', !currentFilters.archived)}
            >
              Archived
            </Badge>
            <Badge 
              variant={currentFilters.favorite ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleFilterChange('favorite', !currentFilters.favorite)}
            >
              Favorites
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}