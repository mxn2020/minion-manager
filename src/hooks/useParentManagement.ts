// hooks/useParentManagement.ts
import { useMemo, useCallback, useState } from 'react'
import { Minion } from '@/types'
import { useMinions } from '@/hooks/useMinions'

export interface ParentOption {
  value: string
  label: string
  status: Minion['status']
  priority: 'urgent' | 'high' | 'medium' | 'low'
  version: string
  children: number
  hasParent: boolean
}

interface UseParentManagementProps {
  currentMinionId: string
  value?: string
  onChange: (value: string | undefined) => void
}

export function useParentManagement({
  currentMinionId,
  value,
  onChange
}: UseParentManagementProps) {
  const { minions } = useMinions()
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isDescendant = useCallback((
    minionId: string, 
    potentialParentId: string
  ): boolean => {
    const minion = minions.find(t => t.id === potentialParentId)
    if (!minion) return false
    if (minion.parentId === minionId) return true
    return minion.parentId ? isDescendant(minionId, minion.parentId) : false
  }, [minions])

  const availableParents = useMemo(() => {
    return minions
      .filter(minion => {
        if (minion.id === currentMinionId) return false
        if (minion.archived || minion.deletedAt) return false
        if (isDescendant(currentMinionId, minion.id)) return false
        return true
      })
      .map(minion => ({
        value: minion.id,
        label: minion.title,
        status: minion.status,
        priority: minion.priority,
        version: `${minion.version.user}.${minion.version.major}.${minion.version.minor}`,
        children: minion.children.length,
        hasParent: !!minion.parentId
      }))
      .sort((a: ParentOption, b: ParentOption) => {
        if (a.status === "completed" && b.status !== "completed") return 1
        if (a.status !== "completed" && b.status === "completed") return -1
        
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
        if (priorityDiff !== 0) return priorityDiff
        
        return a.label.localeCompare(b.label)
      })
  }, [minions, currentMinionId, isDescendant])

  const filteredOptions = useMemo(() => {
    const searchLower = search.toLowerCase()
    return availableParents.filter(minion =>
      minion.label.toLowerCase().includes(searchLower)
    )
  }, [availableParents, search])

  const selectedParent = useMemo(() => {
    return value ? minions.find(t => t.id === value) : undefined
  }, [value, minions])

  const handleSelect = useCallback((minionId: string | undefined) => {
    onChange(minionId)
  }, [onChange])

  return {
    search,
    setSearch,
    error,
    setError,
    filteredOptions,
    selectedParent,
    handleSelect
  }
}

