// hooks/useTypes.ts
import { useMemo, useCallback } from 'react'
import { useData } from '@/contexts/DataContext'
import { Type } from '@/types'
import { v4 as uuidv4 } from 'uuid'

interface CreateTypeParams {
  name: string
  description?: string
  color?: string
  icon?: string
}

interface UpdateTypeParams {
  id: string
  name?: string
  description?: string
  color?: string
  icon?: string
}

export function useTypes() {
  const { data, create, update: updateItem, delete: deleteItem } = useData()

  // Memoized types with usage counts
  const types = useMemo(() => {
    const typeCounts = data.minions.reduce((acc, minion) => {
      acc[minion.type] = (acc[minion.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return data.types.map(type => ({
      ...type,
      usageCount: typeCounts[type.name] || 0
    }))
  }, [data.minions, data.types])

  // Memoized type getters
  const getTypeById = useCallback((id: string) => {
    return types.find(type => type.id === id)
  }, [types])

  const getTypeByName = useCallback((name: string) => {
    return types.find(type => type.name.toLowerCase() === name.toLowerCase())
  }, [types])

  // Create new type
  const createType = useCallback(async ({
    name,
    description,
    color,
    icon
  }: CreateTypeParams): Promise<Type> => {
    // Check if type already exists
    const existingType = getTypeByName(name)
    if (existingType) {
      return existingType
    }

    const now = new Date().toISOString()
    const newType: Type = {
      id: uuidv4(),
      name,
      description,
      color,
      icon,
      createdAt: now,
      updatedAt: now,
      usageCount: 0
    }

    await create('types', newType)
    return newType
  }, [create, getTypeByName])

  // Update existing type
  const updateType = useCallback(async ({
    id,
    ...updates
  }: UpdateTypeParams): Promise<Type> => {
    const existingType = getTypeById(id)
    if (!existingType) {
      throw new Error(`Type with id ${id} not found`)
    }

    // Check if name is being updated and if it already exists
    if (updates.name) {
      const duplicateType = getTypeByName(updates.name)
      if (duplicateType && duplicateType.id !== id) {
        throw new Error(`Type with name ${updates.name} already exists`)
      }
    }

    const updatedType = {
      ...existingType,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await updateItem('types', id, updatedType)
    return updatedType
  }, [getTypeById, getTypeByName, updateItem])

  // Delete type
  const deleteType = useCallback(async (id: string): Promise<void> => {
    const type = getTypeById(id)
    if (!type) {
      throw new Error(`Type with id ${id} not found`)
    }

    // Check if type is in use
    const isInUse = data.minions.some(minion => minion.type === type.name)
    if (isInUse) {
      throw new Error(`Cannot delete type ${type.name} as it is currently in use`)
    }

    await deleteItem('types', id)
  }, [data.minions, getTypeById, deleteItem])

  // Get popular types
  const popularTypes = useMemo(() => {
    return [...types]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5)
  }, [types])

  // Get recently used types
  const recentTypes = useMemo(() => {
    return [...types]
      .sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 5)
  }, [types])

  // Check if type exists
  const typeExists = useCallback((name: string): boolean => {
    return types.some(type => 
      type.name.toLowerCase() === name.toLowerCase()
    )
  }, [types])

  // Get type suggestions based on input
  const getTypeSuggestions = useCallback((input: string) => {
    const searchLower = input.toLowerCase()
    return types
      .filter(type => type.name.toLowerCase().includes(searchLower))
      .sort((a, b) => {
        // Exact matches first
        if (a.name.toLowerCase() === searchLower) return -1
        if (b.name.toLowerCase() === searchLower) return 1
        
        // Then by usage count
        if (a.usageCount !== b.usageCount) {
          return b.usageCount - a.usageCount
        }
        
        // Finally alphabetically
        return a.name.localeCompare(b.name)
      })
  }, [types])

  return {
    types,
    popularTypes,
    recentTypes,
    createType,
    updateType,
    deleteType,
    getTypeById,
    getTypeByName,
    typeExists,
    getTypeSuggestions
  }
}

