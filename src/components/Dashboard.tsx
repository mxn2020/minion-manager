// components/Dashboard.tsx

'use client'

import { useMemo, useCallback, useState } from 'react'
import { ViewContainer } from './page/ViewManagement/ViewContainer'
import { MinionList } from './MinionList'
import { QuickCapture } from './QuickCapture'
import { FilterPanel } from './FilterPanel'
import { TimeTrackingWidget } from './TimeTrackingWidget'
import { Stats } from './Stats'
import { ActivityFeed } from './ActivityFeed'
import { DEFAULT_FILTERS, FilterCriteria } from '@/types'
import { X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { AlertCircle } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'
import { useData } from '@/contexts/DataContext'
import { useSettings } from '@/contexts/SettingsContext'

export function Dashboard() {
  const { data: { minions }, loadingStatus, statusMessage } = useData()
  const { settings } = useSettings()
  const [filters, setFilters] = useState<FilterCriteria>(DEFAULT_FILTERS)

  // Memoize filter handling functions
  const handleFilterChange = useCallback((newFilters: Partial<FilterCriteria>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  // Memoize filtered minions
  const filteredMinions = useMemo(() => {
    return minions.filter(minion => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === '') return true

        if (typeof value === 'boolean') {
          return minion[key as keyof typeof minion] === value
        }

        if (Array.isArray(value)) {
          if (value.length === 0) return true
          if (key === 'tags' || key === 'labels') {
            return value.every(v => minion[key].includes(v))
          }
          return true
        }

        if (key === 'dueDate' && typeof value === 'object' && value !== null) {
          const { start, end } = value
          if (!start || !end || !minion.dueDate) return true
          const minionDate = new Date(minion.dueDate).getTime()
          return minionDate >= new Date(start).getTime() && 
                 minionDate <= new Date(end).getTime()
        }

        if (key === 'timeSpent' && typeof value === 'object' && value !== null) {
          const { min, max } = value as { min?: number; max?: number }
          const spent = minion.timeSpent || 0
          if (min !== undefined && spent < min) return false
          if (max !== undefined && spent > max) return false
          return true
        }

        if (key === 'search' && typeof value === 'string') {
          const searchLower = value.toLowerCase()
          return minion.title.toLowerCase().includes(searchLower) ||
                 minion.description.toLowerCase().includes(searchLower)
        }

        return true
      })
    }).sort((a, b) => {
      const priorityOrder: { [key: string]: number } = { urgent: 0, high: 1, medium: 2, low: 3 }
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority as string] - priorityOrder[b.priority as string]
      }
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      return 0
    })
  }, [minions, filters])

  // Memoize hasActiveFilters check
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(key => {
      const value = filters[key as keyof FilterCriteria]
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'object' && value !== null) {
        return Object.keys(value).length > 0
      }
      return value !== DEFAULT_FILTERS[key as keyof FilterCriteria]
    })
  }, [filters])

  // Memoize sidebar content
  const sidebarContent = useMemo(() => (
    <div className="space-y-6">
      <FilterPanel
        onFilterChange={handleFilterChange}
        currentFilters={filters}
        onClear={clearFilters}
      />
      <TimeTrackingWidget minions={minions} />
      <Stats minions={filteredMinions} />
      <ActivityFeed minions={minions} />
    </div>
  ), [minions, filteredMinions, filters, handleFilterChange, clearFilters])

  // Loading states
  if (loadingStatus !== 'success') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        {loadingStatus === 'error' ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {statusMessage || 'An error occurred while loading your data.'}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">{statusMessage || 'Loading...'}</p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Minion Management</h1>
          <QuickCapture />
        </div>
        <Separator />
      </div>

      <ViewContainer
        sidebar={sidebarContent}
        hasFilters={hasActiveFilters}
      >
        <Card className="p-4">
          <div className="flex justify-end items-center mb-4">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
            <span className="text-sm text-muted-foreground ml-2">
              {filteredMinions.length} items
            </span>
          </div>
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <MinionList
              viewMode={settings.viewMode}
              minions={filteredMinions}
            />
          </ScrollArea>
        </Card>
      </ViewContainer>
    </div>
  )
}