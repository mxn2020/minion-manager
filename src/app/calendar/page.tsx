'use client'

import { useMemo, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Minion } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'
import { useMinions } from '@/hooks/useMinions'

type PriorityColors = {
  [K in Minion['priority']]: string
}

export default function CalendarPage() {
  const { minions } = useMinions()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Filter minions with due dates and organize them by date
  const minionDates = useMemo(() => {
    return minions.reduce<Record<string, Minion[]>>((acc, minion) => {
      if (!minion.dueDate || minion.archived || minion.deletedAt) return acc
      
      try {
        const date = new Date(minion.dueDate)
        if (isNaN(date.getTime())) return acc // Skip invalid dates
        
        const dateKey = date.toISOString().split('T')[0]
        if (!acc[dateKey]) {
          acc[dateKey] = []
        }
        acc[dateKey].push(minion)
      } catch (error) {
        console.error(`Invalid date for minion ${minion.id}:`, error)
      }
      return acc
    }, {})
  }, [minions])

  // Get minions for the selected date
  const selectedMinions = useMemo(() => {
    if (!selectedDate) return []
    const date = selectedDate.toISOString().split('T')[0]
    return minionDates[date] || []
  }, [selectedDate, minionDates])

  // Priority colors with proper typing
  const priorityColors: PriorityColors = {
    urgent: 'bg-red-600',
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  }

  const getPriorityColor = (priority: Minion['priority']) => {
    return priorityColors[priority] || 'bg-gray-500'
  }

  // Format the date for display
  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      if (isNaN(dateObj.getTime())) throw new Error('Invalid date')
      
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(dateObj)
    } catch (error) {
      console.error('Date formatting error:', error)
      return 'Invalid date'
    }
  }

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date)
    if (date && minionDates[date.toISOString().split('T')[0]]) {
      setIsLoading(true)
      try {
        setIsDialogOpen(true)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const MinionItem = ({ minion }: { minion: Minion }) => (
    <Link 
      href={`/minion/${minion.id}`}
      className="block p-2 rounded-md hover:bg-accent transition-colors"
    >
      <div className="flex items-start gap-2">
        <Badge 
          variant="secondary"
          className={`${getPriorityColor(minion.priority)} text-white`}
          aria-label={`Priority: ${minion.priority}`}
        >
          {minion.priority || 'No Priority'}
        </Badge>
        <span className="text-sm line-clamp-2">{minion.title}</span>
      </div>
    </Link>
  )

  const EmptyState = () => (
    <div className="text-center p-4 text-muted-foreground">
      <p>No minions scheduled</p>
    </div>
  )

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background pt-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Calendar</h1>
        <div className="grid gap-8 lg:grid-cols-[1fr,300px]">
          <Card>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                modifiers={{
                  booked: (date) => {
                    const dateString = date.toISOString().split('T')[0]
                    return !!minionDates[dateString]
                  },
                }}
                modifiersStyles={{
                  booked: { 
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    fontWeight: 'bold'
                  },
                }}
                className="rounded-md"
                disabled={isLoading}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-4">Upcoming Minions</h2>
              <ScrollArea className="h-[500px] pr-4">
                {Object.entries(minionDates).length === 0 ? (
                  <EmptyState />
                ) : (
                  Object.entries(minionDates)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .slice(0, 10)
                    .map(([date, minionsForDate]) => (
                      <div key={date} className="mb-4">
                        <h3 className="font-medium text-sm text-muted-foreground mb-2">
                          {formatDate(date)}
                        </h3>
                        <div className="space-y-2">
                          {minionsForDate.map(minion => (
                            <MinionItem key={minion.id} minion={minion} />
                          ))}
                        </div>
                      </div>
                    ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedDate ? formatDate(selectedDate) : 'Minions'}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 p-4">
                {selectedMinions.length === 0 ? (
                  <EmptyState />
                ) : (
                  selectedMinions.map(minion => (
                    <Link 
                      key={minion.id}
                      href={`/minion/${minion.id}`}
                      className="block"
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-2 mb-2">
                            <Badge 
                              variant="secondary"
                              className={`${getPriorityColor(minion.priority)} text-white`}
                              aria-label={`Priority: ${minion.priority}`}
                            >
                              {minion.priority || 'No Priority'}
                            </Badge>
                            <h3 className="font-medium">{minion.title}</h3>
                          </div>
                          {minion.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {minion.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}