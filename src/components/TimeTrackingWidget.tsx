// components/TimeTrackingWidget.tsx
import { useState, useEffect, useCallback, memo, useMemo } from 'react'
import { Minion } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Timer } from 'lucide-react'
import { useTimeLogs } from '@/hooks/useTimeLogs'
import { useMinions } from '@/hooks/useMinions'

interface TimeTrackingWidgetProps {
  minions: Minion[]
}

export const TimeTrackingWidget = memo(function TimeTrackingWidget({ 
  minions 
}: TimeTrackingWidgetProps) {
  // State
  const [selectedMinionId, setSelectedMinionId] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
  const [currentLogId, setCurrentLogId] = useState<string | null>(null)

  // Hooks
  const { timeLogs, addTimeLog, updateTimeLog } = useTimeLogs()
  const { updateMinion } = useMinions()

  // Memoized active minions
  const activeMinions = useMemo(() => 
    minions.filter(minion => minion.status !== 'completed' && !minion.archived),
    [minions]
  )

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [intervalId])

  // Check for existing running timer
  useEffect(() => {
    const runningLog = timeLogs.find(log => !log.endTime)
    if (runningLog) {
      setSelectedMinionId(runningLog.minionId)
      setCurrentLogId(runningLog.id)
      setIsTracking(true)
      const startTime = new Date(runningLog.startTime).getTime()
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setElapsedTime(elapsed)
      
      const id = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
      setIntervalId(id)
    }
  }, [timeLogs])

  // Memoized format time function
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  // Memoized handle start/stop function
  const handleStartStop = useCallback(async () => {
    if (isTracking && currentLogId) {
      // Stop tracking
      if (intervalId) {
        clearInterval(intervalId)
        setIntervalId(null)
      }
      
      const endTime = new Date()
      const timeLog = timeLogs.find(log => log.id === currentLogId)
      if (timeLog) {
        const startTime = new Date(timeLog.startTime)
        const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
        
        await Promise.all([
          updateTimeLog(currentLogId, {
            endTime: endTime.toISOString(),
            duration
          }),
          updateMinion(timeLog.minionId, {
            timeSpent: (activeMinions.find(t => t.id === timeLog.minionId)?.timeSpent || 0) + duration
          })
        ])
      }
      
      setIsTracking(false)
      setElapsedTime(0)
      setCurrentLogId(null)
    } else if (selectedMinionId) {
      // Start tracking
      const newLog = await addTimeLog({
        minionId: selectedMinionId,
        startTime: new Date().toISOString(),
        duration: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      setCurrentLogId(newLog.id)
      setIsTracking(true)
      
      const id = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
      setIntervalId(id)
    }
  }, [
    isTracking, 
    currentLogId, 
    intervalId, 
    selectedMinionId, 
    timeLogs, 
    activeMinions,
    updateTimeLog,
    updateMinion,
    addTimeLog
  ])

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Timer className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Time Tracking</h2>
      </div>
      
      <div className="space-y-4">
        <Select 
          value={selectedMinionId || ''} 
          onValueChange={setSelectedMinionId}
          disabled={isTracking}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a minion" />
          </SelectTrigger>
          <SelectContent>
            {activeMinions.map((minion) => (
              <SelectItem key={minion.id} value={minion.id}>
                {minion.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-center py-2">
          <span className="text-2xl font-mono">
            {formatTime(elapsedTime)}
          </span>
        </div>

        <Button 
          onClick={handleStartStop} 
          disabled={!selectedMinionId && !isTracking}
          className="w-full"
          variant={isTracking ? "destructive" : "default"}
        >
          {isTracking ? 'Stop' : 'Start'} Tracking
        </Button>
      </div>
    </Card>
  )
})