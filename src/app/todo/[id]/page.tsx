'use client'

import { useCallback, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { PlayCircle, StopCircle, Clock, ArrowLeft } from 'lucide-react'

import { Minion, TimeLog, Comment } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useMinions } from '@/hooks/useMinions'
import { useTimeLogs } from '@/hooks/useTimeLogs'

interface MinionVersionDisplay {
  user: number
  major: number
  minor: number
}

interface TimeLogDisplayProps {
  log: TimeLog
  onStopTracking: () => void
}

const TimeLogDisplay = ({ log, onStopTracking }: TimeLogDisplayProps) => (
  <div className="flex justify-between items-center p-4 border rounded-lg bg-card">
    <div>
      <p className="font-medium">
        {new Date(log.startTime).toLocaleDateString()} {new Date(log.startTime).toLocaleTimeString()}
      </p>
      <p className="text-sm text-muted-foreground">
        {log.endTime ? (
          `Duration: ${formatDuration(log.duration || 0)}`
        ) : (
          `Started ${formatDistanceToNow(new Date(log.startTime))} ago`
        )}
      </p>
    </div>
    {!log.endTime && (
      <Button variant="destructive" onClick={onStopTracking}>
        Stop
      </Button>
    )}
  </div>
)

const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

export default function DetailedMinionView() {
  const { id } = useParams()
  const { minions, updateMinion } = useMinions()
  const { timeLogs, addTimeLog, updateTimeLog } = useTimeLogs()
  const [comment, setComment] = useState('')

  const minion = minions.find(t => t.id === id as string)
  const minionTimeLogs = timeLogs.filter(log => log.minionId === id)
  const activeTimeLog = minionTimeLogs.find(log => !log.endTime)

  const handleUpdateMinion = useCallback((updates: Partial<Minion>) => {
    if (minion) {
      updateMinion(minion.id, updates)
    }
  }, [minion, updateMinion])

  const handleAddComment = useCallback(() => {
    if (minion && comment.trim()) {
      const newComment: Comment = {
        text: comment,
        createdAt: new Date().toISOString()
      }
      const updatedComments = [...(minion.comments || []), newComment]
      handleUpdateMinion({ comments: updatedComments })
      setComment('')
    }
  }, [minion, comment, handleUpdateMinion])

  const startTimeTracking = useCallback(async () => {
    if (minion) {
      await addTimeLog({
        minionId: minion.id,
        startTime: new Date().toISOString(),
        duration: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()

      })
    }
  }, [minion, addTimeLog])

  const stopTimeTracking = useCallback(async () => {
    if (activeTimeLog) {
      const endTime = new Date().toISOString()
      const duration = new Date(endTime).getTime() - new Date(activeTimeLog.startTime).getTime()
      
      await updateTimeLog(activeTimeLog.id, {
        endTime,
        duration,
      })
    }
  }, [activeTimeLog, updateTimeLog])

  if (!minion) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Minion not found</h1>
          <Link href="/minions">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Minions
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const renderDetailsTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Minion Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="font-medium">{minion.type || 'Not set'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">{minion.status}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Priority</p>
            <p className="font-medium">{minion.priority}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Version</p>
            <p className="font-medium">{`${minion.version.user}.${minion.version.major}.${minion.version.minor}`}</p>
          </div>
          <div className="col-span-full space-y-1">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="font-medium whitespace-pre-wrap">{minion.description || 'No description'}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => handleUpdateMinion({ archived: !minion.archived })}>
          {minion.archived ? 'Unarchive' : 'Archive'}
        </Button>
      </CardFooter>
    </Card>
  )

  const renderTimeTrackingTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Time Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>Total Time Spent:</span>
            </div>
            <span className="font-medium">{formatDuration(minion.timeSpent)}</span>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Time Log History</h3>
            {minionTimeLogs.length > 0 ? (
              <div className="space-y-3">
                {minionTimeLogs.map((log) => (
                  <TimeLogDisplay
                    key={log.id}
                    log={log}
                    onStopTracking={stopTimeTracking}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No time logs recorded yet.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderCommentsTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            {minion.comments && minion.comments.length > 0 ? (
              minion.comments.map((comment: Comment, index: number) => (
                <div key={index} className="p-4 border rounded-lg bg-card">
                  <p className="whitespace-pre-wrap">{comment.text}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(comment.createdAt))} ago
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No comments yet.</p>
            )}
          </div>

          <div className="space-y-2">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              rows={4}
            />
            <Button 
              onClick={handleAddComment}
              disabled={!comment.trim()}
            >
              Add Comment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderPlaceholderTab = (feature: string) => (
    <Card>
      <CardContent className="py-6">
        <p className="text-muted-foreground text-center">{feature} feature coming soon...</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/minions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Minions
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{minion.title}</h1>
            <div className="flex items-center gap-2">
              {activeTimeLog ? (
                <Button onClick={stopTimeTracking} variant="destructive">
                  <StopCircle className="mr-2 h-4 w-4" />
                  Stop Time
                </Button>
              ) : (
                <Button onClick={startTimeTracking}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start Time
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="details" className="space-y-4">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="time">Time Tracking</TabsTrigger>
              <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
              <TabsTrigger value="dependency-health">Dependency Health</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">{renderDetailsTab()}</TabsContent>
            <TabsContent value="time">{renderTimeTrackingTab()}</TabsContent>
            <TabsContent value="comments">{renderCommentsTab()}</TabsContent>
            <TabsContent value="subtasks">{renderPlaceholderTab('Subtasks')}</TabsContent>
            <TabsContent value="attachments">{renderPlaceholderTab('Attachments')}</TabsContent>
            <TabsContent value="dependency-health">{renderPlaceholderTab('Dependency health check')}</TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}