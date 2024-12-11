// hooks/useTags.ts
import { useCallback } from 'react'
import { useData } from '@/contexts/DataContext'
import { Tag } from '@/types'

export function useTags() {
  const { data, create: createItem, update, delete: deleteItem } = useData()

  const createTag = useCallback(async (tag: Omit<Tag, 'id'>) => {
    await createItem('tags', tag)
  }, [createItem])

  const updateTag = useCallback(async (id: string, updates: Partial<Tag>) => {
    await update('tags', id, updates)
  }, [update])

  const deleteTag = useCallback(async (id: string) => {
    await deleteItem('tags', id)
  }, [deleteItem])

  return {
    tags: data.tags,
    createTag,
    updateTag,
    deleteTag
  }
}
