// components/MinionList/MinionList.tsx
import { useState, useMemo, useCallback } from 'react'
import { Minion } from '@/types'
import { MinionItem } from './MinionItem'
import { useMinions } from '@/hooks/useMinions'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ArrowDownAZ, ArrowUpAZ } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from '@/components/ui/scroll-area'

type SortField = 'title' | 'dueDate' | 'priority' | 'status' | 'updatedAt'
type SortOrder = 'asc' | 'desc'

interface MinionListProps {
  viewMode: 'list' | 'cards' | 'icons'
  minions: Minion[]
  showCompleted?: boolean
}

const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 } as const
const statusOrder = { 
  in_progress: 0, 
  not_started: 1, 
  blocked: 2, 
  completed: 3 
} as const

export function MinionList({ 
  viewMode, 
  minions,
  showCompleted = true 
}: MinionListProps) {
  const { updateMinion, deleteMinion } = useMinions()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Memoized sort comparison function
  const compareMinions = useCallback((a: Minion, b: Minion) => {
    // Always put pinned minions first
    if (a.favorite && !b.favorite) return -1
    if (!a.favorite && b.favorite) return 1

    let comparison = 0

    switch (sortField) {
      case 'title':
        comparison = (a.title || '').localeCompare(b.title || '')
        break
      case 'dueDate':
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
        comparison = aDate - bDate
        break
      case 'priority':
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
        break
      case 'status':
        comparison = statusOrder[a.status] - statusOrder[b.status]
        break
      case 'updatedAt':
        const aUpdate = new Date(a.updatedAt || '').getTime()
        const bUpdate = new Date(b.updatedAt || '').getTime()
        comparison = aUpdate - bUpdate
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  }, [sortField, sortOrder])

  // Memoized organized minions
  const organizedMinions = useMemo(() => {
    const visibleMinions = showCompleted 
      ? minions 
      : minions.filter(minion => minion.status !== 'completed')

    return [...visibleMinions].sort(compareMinions)
  }, [minions, showCompleted, compareMinions])

  // Memoized handlers
  const handleStatusChange = useCallback(async (id: string, newStatus: Minion['status']) => {
    setIsUpdating(id)
    try {
      await updateMinion(id, { status: newStatus })
    } finally {
      setIsUpdating(null)
    }
  }, [updateMinion])

  const handleFavoriteToggle = useCallback(async (id: string) => {
    setIsUpdating(id)
    try {
      const minionToUpdate = minions.find(t => t.id === id)
      if (!minionToUpdate) return
  
      await updateMinion(id, { favorite: !minionToUpdate.favorite })
    } finally {
      setIsUpdating(null)
    }
  }, [updateMinion, minions])

  const handleDelete = useCallback(async (id: string) => {
    setIsDeleting(id)
    try {
      await deleteMinion(id)
    } finally {
      setIsDeleting(null)
    }
  }, [deleteMinion])

  const toggleSort = useCallback((field: SortField) => {
    setSortField(currentField => {
      if (currentField === field) {
        setSortOrder(current => current === 'asc' ? 'desc' : 'asc')
        return currentField
      }
      setSortOrder('asc')
      return field
    })
  }, [])

  // Memoized grid class name
  const gridClassName = useMemo(() => {
    switch (viewMode) {
      case 'cards':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
      case 'icons':
        return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
      default:
        return 'space-y-2'
    }
  }, [viewMode])

  // Memoized sort button content
  const sortButtonContent = useMemo(() => (
    <>
      {sortOrder === 'asc' ? 
        <ArrowUpAZ className="mr-2 h-4 w-4" /> : 
        <ArrowDownAZ className="mr-2 h-4 w-4" />
      }
      Sort by
    </>
  ), [sortOrder])

  // Memoized dropdown items
  const dropdownItems = useMemo(() => [
    { field: 'title', label: 'Title' },
    { field: 'priority', label: 'Priority' },
    { field: 'status', label: 'Status' },
    { field: 'dueDate', label: 'Due Date' },
    { field: 'updatedAt', label: 'Last Updated' }
  ], [])

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex justify-end space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {sortButtonContent}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {dropdownItems.map(({ field, label }) => (
              <DropdownMenuItem 
                key={field} 
                onClick={() => toggleSort(field as SortField)}
              >
                {label} {sortField === field && (sortOrder === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Minion List */}
      {organizedMinions.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No minions found matching your criteria.
          </AlertDescription>
        </Alert>
      ) : (
        <ScrollArea className={gridClassName}>
          {organizedMinions.map((minion) => (
            <MinionItem 
              key={minion.id} 
              minion={minion} 
              viewMode={viewMode} 
            />
          ))}
        </ScrollArea>
      )}
    </div>
  )
}