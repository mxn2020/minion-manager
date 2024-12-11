// hooks/useFolders.ts
import { useCallback, useMemo } from 'react'
import { useData } from '@/contexts/DataContext'
import { Folder } from '@/types'

export function useFolders() {
  const { data, create, update, delete: deleteItem } = useData()

  const createFolder = useCallback(async (folder: Omit<Folder, 'id'>) => {
    if (folder.parentId && !data.folders.find(f => f.id === folder.parentId)) {
      throw new Error('Parent folder not found')
    }
    if (folder.groupId && !data.groups.find(g => g.id === folder.groupId)) {
      throw new Error('Group not found')
    }
    await create('folders', folder)
  }, [create, data.folders, data.groups])

  const updateFolder = useCallback(async (id: string, updates: Partial<Folder>) => {
    if (updates.parentId && !data.folders.find(f => f.id === updates.parentId)) {
      throw new Error('Parent folder not found')
    }
    await update('folders', id, updates)
  }, [update, data.folders])

  const deleteFolder = useCallback(async (id: string) => {
    // Check if folder has children
    const hasChildren = data.folders.some(folder => folder.parentId === id)
    if (hasChildren) {
      throw new Error('Cannot delete folder that contains subfolders')
    }
    await deleteItem('folders', id)
  }, [data.folders, deleteItem])

  const getFolderHierarchy = useMemo(() => {
    const buildHierarchy = (parentId?: string): Folder[] => {
      return data.folders
        .filter(folder => folder.parentId === parentId)
        .map(folder => ({
          ...folder,
          children: buildHierarchy(folder.id)
        }))
    }
    return buildHierarchy()
  }, [data.folders])

  return {
    folders: data.folders,
    createFolder,
    updateFolder,
    deleteFolder,
    getFolderHierarchy
  }
}

