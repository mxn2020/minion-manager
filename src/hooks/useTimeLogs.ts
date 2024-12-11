// hooks/useTimeLogs.ts
import { useCallback } from 'react'
import { useData } from '@/contexts/DataContext'
import { v4 as uuidv4 } from 'uuid'
import { TimeLog } from '@/types'

export function useTimeLogs() {
  const { data, create, update } = useData()
  
  const addTimeLog = useCallback(async (timeLog: Omit<TimeLog, 'id'>) => {
    const newTimeLog = {
      id: uuidv4(),
      ...timeLog
    }
    await create('timeLogs', newTimeLog)
    return newTimeLog
  }, [create])

  const updateTimeLog = useCallback(async (id: string, updates: Partial<TimeLog>) => {
    await update('timeLogs', id, updates)
  }, [update])

  return {
    timeLogs: data.timeLogs as TimeLog[],
    addTimeLog,
    updateTimeLog
  }
}

