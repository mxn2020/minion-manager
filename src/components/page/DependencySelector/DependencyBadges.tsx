// components/DependencySelector/DependencyBadges.tsx
import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Minion } from '@/types'

interface DependencyBadgesProps {
  status: Minion['status']
  priority: Minion['priority']
  version: string
  isOutdated?: boolean
}

const getStatusColor = (status: Minion['status']) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
    case 'blocked': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
  }
}

const getPriorityColor = (priority: Minion['priority']) => {
  switch (priority) {
    case 'urgent': return 'text-red-600 dark:text-red-400'
    case 'high': return 'text-orange-600 dark:text-orange-400'
    case 'medium': return 'text-yellow-600 dark:text-yellow-400'
    case 'low': return 'text-green-600 dark:text-green-400'
  }
}

export const DependencyBadges = memo(function DependencyBadges({
  status,
  priority,
  version,
  isOutdated
}: DependencyBadgesProps) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <Badge 
        variant="secondary"
        className={cn("text-xs", getStatusColor(status))}
      >
        {status.replace('_', ' ')}
      </Badge>
      <Badge 
        variant="outline" 
        className={cn("text-xs", getPriorityColor(priority))}
      >
        {priority}
      </Badge>
      <Badge 
        variant="outline" 
        className={cn(
          "text-xs",
          isOutdated && "border-yellow-500 text-yellow-500"
        )}
      >
        v{version}
      </Badge>
    </div>
  )
})

