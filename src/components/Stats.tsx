'use client'

import { useMemo } from 'react'
import { Minion } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { 
  CheckCircle2, 
  Clock, 
  BarChart2, 
  AlertCircle,
  Calendar,
  GitBranch
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsProps {
  minions: Minion[]
}

export function Stats({ minions }: StatsProps) {
  const stats = useMemo(() => {
    const initialStats = {
      total: 0,
      completed: 0,
      inProgress: 0,
      blocked: 0,
      notStarted: 0,
      totalTimeSpent: 0,
      avgTimePerTask: 0,
      completedWithinWeek: 0,
      minionsWithDependencies: 0,
      highPriority: 0,
      overdue: 0,
      completedOnTime: 0,
      totalWithDueDate: 0
    }

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const result = minions.reduce((acc, minion) => {
      // Basic counts
      acc.total++

      // Status counts
      switch (minion.status) {
        case 'completed':
          acc.completed++
          break
        case 'in_progress':
          acc.inProgress++
          break
        case 'blocked':
          acc.blocked++
          break
        default:
          acc.notStarted++
      }
      
      // Time tracking
      acc.totalTimeSpent += minion.timeSpent || 0
      
      // Priority tracking
      if (minion.priority === 'high' || minion.priority === 'urgent') {
        acc.highPriority++
      }

      // Dependencies
      if (minion.dependencies?.length > 0) {
        acc.minionsWithDependencies++
      }

      // Due date tracking
      if (minion.dueDate) {
        acc.totalWithDueDate++
        const dueDate = new Date(minion.dueDate)
        
        if (minion.status === 'completed') {
          const completedDate = new Date(minion.updatedAt || '')
          if (completedDate <= dueDate) {
            acc.completedOnTime++
          }
        } else if (dueDate < now) {
          acc.overdue++
        }
      }

      // Recent completions
      if (minion.status === 'completed' && minion.updatedAt) {
        const completedDate = new Date(minion.updatedAt)
        if (completedDate > weekAgo) {
          acc.completedWithinWeek++
        }
      }

      return acc
    }, { ...initialStats })

    // Calculate averages
    result.avgTimePerTask = result.total > 0 ? 
      Math.round(result.totalTimeSpent / result.total) : 0

    return result
  }, [minions])

  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
  const onTimeRate = stats.totalWithDueDate > 0 ? 
    (stats.completedOnTime / stats.totalWithDueDate) * 100 : 0
  const timeSpentHours = Math.round(stats.totalTimeSpent / 60)

  const chartData = [
    { name: 'Completed', value: stats.completed, color: 'var(--success)' },
    { name: 'In Progress', value: stats.inProgress, color: 'var(--primary)' },
    { name: 'Blocked', value: stats.blocked, color: 'var(--destructive)' },
    { name: 'Not Started', value: stats.notStarted, color: 'var(--muted)' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          Statistics {minions.length < 1 && '(No data)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {minions.length > 0 ? (
          <>
            {/* Completion Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Completion Rate
                </span>
                <span className="font-medium">{completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>

            {/* Status Distribution Chart */}
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Total Tasks</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">High Priority</div>
                <div className="text-2xl font-bold">{stats.highPriority}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Time Spent</div>
                <div className="text-2xl font-bold">{timeSpentHours}h</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Overdue</div>
                <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Completed this week</span>
                <span className="font-medium">{stats.completedWithinWeek}</span>
              </div>
              <div className="flex justify-between">
                <span>With dependencies</span>
                <span className="font-medium">{stats.minionsWithDependencies}</span>
              </div>
              {stats.totalWithDueDate > 0 && (
                <div className="flex justify-between">
                  <span>On-time completion</span>
                  <span className="font-medium">{onTimeRate.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            No data available for the current filter criteria
          </div>
        )}
      </CardContent>
    </Card>
  )
}