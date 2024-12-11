// hooks/useLabels.ts
import { useCallback } from 'react'
import { useData } from '@/contexts/DataContext'
import { Label } from '@/types'

export function useLabels() {
  const { data, create: createItem, update, delete: deleteItem } = useData()

  const createLabel = useCallback(async (label: Omit<Label, 'id'>) => {
    await createItem('labels', label)
  }, [createItem])

  const updateLabel = useCallback(async (id: string, updates: Partial<Label>) => {
    await update('labels', id, updates)
  }, [update])

  const deleteLabel = useCallback(async (id: string) => {
    await deleteItem('labels', id)
  }, [deleteItem])

  return {
    labels: data.labels,
    createLabel,
    updateLabel,
    deleteLabel
  }
}
