'use client'

import { useState, useMemo, memo, useCallback } from 'react'
import { Minion } from '@/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  Star,
  Edit,
  Trash,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  Calendar,
  Link as LinkIcon
} from 'lucide-react'
import EditMinionDialog from '@/components/EditMinionDialog'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AnimatePresence, motion } from "framer-motion"
import { useMinions } from '@/hooks/useMinions'

interface MinionItemProps {
  minion: Minion
  viewMode: 'list' | 'cards' | 'icons'
}

export const MinionItem = memo(function MinionItem({ minion, viewMode }: MinionItemProps) {
  const { updateMinion, deleteMinion } = useMinions()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Memoized handlers
  const handleStatusChange = useCallback(async (newStatus: Minion['status']) => {
    setIsUpdating(true)
    try {
      await updateMinion(minion.id, { status: newStatus })
    } finally {
      setIsUpdating(false)
    }
  }, [updateMinion, minion.id])

  const handleFavoriteToggle = useCallback(async () => {
    setIsUpdating(true)
    try {
      await updateMinion(minion.id, { favorite: !minion.favorite })
    } finally {
      setIsUpdating(false)
    }
  }, [updateMinion, minion.id, minion.favorite])

  const handleDelete = useCallback(async () => {
    setIsDeleting(true)
    try {
      await deleteMinion(minion.id)
    } finally {
      setIsDeleting(false)
    }
  }, [deleteMinion, minion.id])

  const handleUpdate = useCallback(async (id: string, updates: Partial<Omit<Minion, "id" | "createdAt">>) => {
    setIsUpdating(true)
    try {
      await updateMinion(minion.id, updates)
    } finally {
      setIsUpdating(false)
    }
  }, [updateMinion, minion.id])

  const statusColor = useMemo(() => {
    switch (minion.status) {
      case 'completed': return 'bg-green-500'
      case 'in_progress': return 'bg-blue-500'
      case 'blocked': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }, [minion.status])

  const priorityColor = useMemo(() => {
    switch (minion.priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return ''
    }
  }, [minion.priority])

  const isOverdue = useMemo(() => {
    if (!minion.dueDate || minion.status === 'completed') return false
    return new Date(minion.dueDate) < new Date()
  }, [minion.dueDate, minion.status])

  const formattedTimeSpent = useMemo(() => {
    const hours = Math.floor(minion.timeSpent / 60)
    const minutes = minion.timeSpent % 60
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }, [minion.timeSpent])

  if (viewMode === 'icons') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className="flex flex-col items-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center text-2xl relative",
                  statusColor,
                  "text-white"
                )}
              >
                {minion.title[0].toUpperCase()}
                {minion.favorite && (
                  <Star className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400" />
                )}
              </div>
              <span className="mt-2 text-sm truncate max-w-[120px]">{minion.title}</span>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{minion.title}</p>
              <p className="text-sm text-muted-foreground">{minion.status}</p>
              {isOverdue && (
                <p className="text-sm text-red-500">Overdue</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Card
      className={cn(
        "w-full transition-shadow hover:shadow-md",
        isUpdating && "opacity-70",
        minion.favorite && "ring-2 ring-yellow-200"
      )}
    >
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Avatar className={cn("h-10 w-10", statusColor)}>
              <AvatarFallback className="text-white">
                {minion.title[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="truncate">{minion.title}</CardTitle>
              {minion.type && (
                <CardDescription className="truncate">{minion.type}</CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteToggle}
              className={cn(
                minion.favorite ? 'text-yellow-400' : 'text-muted-foreground',
                'hover:text-yellow-500'
              )}
              disabled={isUpdating}
            >
              <Star className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isUpdating}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(minion.status === 'completed' ? 'not_started' : 'completed')}
                  disabled={isUpdating}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {minion.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/minion/${minion.id}`} className="flex items-center">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="outline" className={priorityColor}>
            {minion.priority}
          </Badge>
          <Badge variant="outline" className={cn(
            statusColor,
            "text-white"
          )}>
            {minion.status.replace('_', ' ')}
          </Badge>
          {minion.dependencies?.length > 0 && (
            <Badge variant="secondary">
              {minion.dependencies.length} {minion.dependencies.length === 1 ? 'dependency' : 'dependencies'}
            </Badge>
          )}
          {isOverdue && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Overdue
            </Badge>
          )}
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 text-sm text-muted-foreground pt-2">
                {minion.description && <p>{minion.description}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {minion.timeSpent > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formattedTimeSpent}
                    </div>
                  )}
                  {minion.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(minion.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <p className="text-xs">
                  Version: {minion.version.user}.{minion.version.major}.{minion.version.minor}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => handleStatusChange(minion.status === 'completed' ? 'not_started' : 'completed')}
          disabled={isUpdating}
          className="flex-1 sm:flex-none"
        >
          {minion.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardFooter>

      <EditMinionDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        minion={minion}
        onUpdate={handleUpdate}
      />
    </Card>
  )
})