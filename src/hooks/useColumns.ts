// hooks/useColumns.ts
import { useCallback } from 'react'
import { useData } from '@/contexts/DataContext'
import { Column } from '@/types'

export function useColumns() {
  const { data, create, update, delete: deleteItem } = useData()

  const createColumn = useCallback(async (column: Omit<Column, 'id'>) => {
    if (!data.groups.find(g => g.id === column.groupId)) {
      throw new Error('Group not found')
    }
    await create('columns', column)
  }, [create, data.groups])

  const updateColumn = useCallback(async (id: string, updates: Partial<Column>) => {
    await update('columns', id, updates)
  }, [update])

  const deleteColumn = useCallback(async (id: string) => {
    await deleteItem('columns', id)
  }, [deleteItem])

  const reorderColumn = useCallback(async (id: string, newOrder: number) => {
    const column = data.columns.find(c => c.id === id)
    if (!column) throw new Error('Column not found')

    const groupColumns = data.columns
      .filter(c => c.groupId === column.groupId)
      .sort((a, b) => a.order - b.order)

    const updates = groupColumns.map(c => {
      if (c.id === id) return { id, order: newOrder }
      if (column.order < newOrder && c.order <= newOrder && c.order > column.order) {
        return { id: c.id, order: c.order - 1 }
      }
      if (column.order > newOrder && c.order >= newOrder && c.order < column.order) {
        return { id: c.id, order: c.order + 1 }
      }
      return null
    }).filter(Boolean) as { id: string, order: number }[]

    await Promise.all(updates.map(u => update('columns', u.id, { order: u.order })))
  }, [data.columns, update])

  return {
    columns: data.columns,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumn
  }
}

