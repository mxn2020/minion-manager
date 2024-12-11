// hooks/useGroups.ts
import { useCallback } from 'react'
import { useData } from '@/contexts/DataContext'
import { Group } from '@/types'

export function useGroups() {
  const { data, create, update, delete: deleteItem } = useData()

  const createGroup = useCallback(async (group: Omit<Group, 'id'>) => {
    await create('groups', group)
  }, [create])

  const updateGroup = useCallback(async (id: string, updates: Partial<Group>) => {
    await update('groups', id, updates)
  }, [update])

  const deleteGroup = useCallback(async (id: string) => {
    // Check if group has any folders
    const hasFolder = data.folders.some(folder => folder.groupId === id)
    if (hasFolder) {
      throw new Error('Cannot delete group that contains folders')
    }
    await deleteItem('groups', id)
  }, [data.folders, deleteItem])

  const getGroup = useCallback((id: string) => {
    return data.groups.find(group => group.id === id)
  }, [data.groups])

  return {
    groups: data.groups,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroup
  }
}

