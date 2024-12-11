import { useEffect, useState } from 'react'
import { Minion } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { Activity, Clock, RefreshCcw, Trash } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

type ActivityType = 'created' | 'updated' | 'deleted'

interface ActivityItem {
  id: string
  minionId: string
  minionTitle: string
  action: ActivityType
  timestamp: string
  version?: string // Added to show version changes
}

const getActivityIcon = (action: ActivityType) => {
  switch (action) {
    case 'created':
      return <Activity className="text-green-500 h-4 w-4" />
    case 'updated':
      return <RefreshCcw className="text-blue-500 h-4 w-4" />
    case 'deleted':
      return <Trash className="text-red-500 h-4 w-4" />
  }
}

const getActivityDescription = (activity: ActivityItem) => {
  const timeAgo = formatDistanceToNow(new Date(activity.timestamp))
  const version = activity.version ? ` (v${activity.version})` : ''
  
  switch (activity.action) {
    case 'created':
      return `Created ${timeAgo} ago`
    case 'updated':
      return `Updated ${timeAgo} ago${version}`
    case 'deleted':
      return `Deleted ${timeAgo} ago`
  }
}

interface ActivityFeedProps {
  minions: Minion[]
}

export function ActivityFeed({ minions }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])

  useEffect(() => {
    if (!Array.isArray(minions)) {
      console.error('Minions is not an array:', minions)
      setActivities([])
      return
    }

    const newActivities: ActivityItem[] = minions.flatMap(minion => {
      const baseActivity = {
        minionId: minion.id,
        minionTitle: minion.title
      }

      const activities: ActivityItem[] = [
        {
          ...baseActivity,
          id: `${minion.id}-created`,
          action: 'created' as const,
          timestamp: minion.createdAt
        }
      ]

      // Add update activity if updateAt is different from createdAt
      if (new Date(minion.updatedAt).getTime() !== new Date(minion.createdAt).getTime()) {
        activities.push({
          ...baseActivity,
          id: `${minion.id}-updated-${new Date(minion.updatedAt).getTime()}`,
          action: 'updated' as const,
          timestamp: minion.updatedAt,
          version: `${minion.version.user}.${minion.version.major}.${minion.version.minor}`
        })
      }

      // Add deleted activity if deletedAt exists
      if (minion.deletedAt) {
        activities.push({
          ...baseActivity,
          id: `${minion.id}-deleted`,
          action: 'deleted' as const,
          timestamp: minion.deletedAt
        })
      }

      return activities
    })

    // Sort by timestamp descending and take latest 10
    const sortedActivities = newActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    setActivities(sortedActivities)
  }, [minions])

  if (!Array.isArray(minions)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 text-sm border-l-2 pl-4 pb-4 relative border-muted-foreground last:pb-0 hover:bg-muted/50 rounded-r-lg transition-colors"
                >
                  <div className="absolute -left-[7px] bg-background p-1 rounded-full">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium line-clamp-1">
                      {activity.minionTitle}
                    </p>
                    <p className="text-muted-foreground">
                      {getActivityDescription(activity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No recent activity
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default ActivityFeed