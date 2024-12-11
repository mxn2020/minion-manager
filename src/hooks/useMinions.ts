// hooks/useMinions.ts
import { useCallback } from 'react'
import { useData } from '@/contexts/DataContext'
import { Minion } from '@/types'

export function useMinions() {
  const { data, create, update, delete: deleteItem } = useData()

  const addMinion = useCallback(async (minion: Minion) => {
    await create('minions', minion)
  }, [create])

  const updateMinion = useCallback(async (id: string, updates: Partial<Minion>) => {
    await update('minions', id, updates)
  }, [update])

  const deleteMinion = useCallback(async (id: string) => {
    await deleteItem('minions', id)
  }, [deleteItem])

  // Additional utility function for getting a minion
  const getMinion = useCallback((id: string) => {
    return data.minions.find(minion => minion.id === id)
  }, [data.minions])

  return {
    minions: data.minions,
    addMinion,
    updateMinion,
    deleteMinion,
    getMinion
  }
}

