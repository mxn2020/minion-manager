// hooks/useDependencyManagement.ts
import { useMemo, useCallback, useState } from 'react'
import { Minion, MinionDependency, DependencyOption } from '@/types'
import { useMinions } from '@/hooks/useMinions'

interface UseDependencyManagementProps {
  currentMinionId: string
  maxDependencies: number
  value: MinionDependency[]
  onChange: (value: MinionDependency[]) => void
}

export function useDependencyManagement({
  currentMinionId,
  maxDependencies,
  value,
  onChange
}: UseDependencyManagementProps) {
  const { minions } = useMinions()
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const getMinionVersion = useCallback((minionId: string) => {
    const minion = minions.find(t => t.id === minionId)
    if (!minion) return '0.0.0'
    const { user, major, minor } = minion.version
    return `${user}.${major}.${minor}`
  }, [minions])

  const checkCircularDependency = useCallback((
    minionId: string, 
    chain = new Set<string>([currentMinionId])
  ): boolean => {
    const minion = minions.find(t => t.id === minionId)
    if (!minion) return false
    
    for (const dep of minion.dependencies) {
      if (chain.has(dep.id)) return true
      chain.add(dep.id)
      if (checkCircularDependency(dep.id, chain)) return true
      chain.delete(dep.id)
    }
    return false
  }, [minions, currentMinionId])

  const availableMinions = useMemo(() => {
    const selectedIds = new Set(value.map(v => v.id))
    
    return minions
      .filter(minion => {
        if (minion.id === currentMinionId) return false
        if (minion.archived || minion.deletedAt) return false
        if (selectedIds.has(minion.id)) return false
        return !checkCircularDependency(minion.id)
      })
      .map(minion => ({
        value: minion.id,
        label: minion.title,
        version: getMinionVersion(minion.id),
        status: minion.status,
        priority: minion.priority,
        isOutdated: value.some(v => 
          v.id === minion.id && v.currentVersion !== getMinionVersion(minion.id)
        )
      }))
      .sort((a: DependencyOption, b: DependencyOption) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
        if (priorityDiff !== 0) return priorityDiff
        if (a.status === 'completed' && b.status !== 'completed') return 1
        if (a.status !== 'completed' && b.status === 'completed') return -1
        return a.label.localeCompare(b.label)
      })
  }, [minions, currentMinionId, value, getMinionVersion, checkCircularDependency])

  const filteredOptions = useMemo(() => {
    const searchLower = search.toLowerCase()
    return availableMinions.filter(minion =>
      minion.label.toLowerCase().includes(searchLower)
    )
  }, [availableMinions, search])

  const handleSelect = useCallback((minionId: string) => {
    try {
      if (value.length >= maxDependencies && !value.some(v => v.id === minionId)) {
        setError(`Maximum ${maxDependencies} dependencies allowed`)
        return
      }

      const currentVersion = getMinionVersion(minionId)
      const newValue = value.filter(v => v.id !== minionId)
      
      if (!value.some(v => v.id === minionId)) {
        newValue.push({ 
          id: minionId, 
          minionId: currentMinionId,
          version: currentVersion,
          currentVersion: currentVersion
        })
      }
      
      onChange(newValue)
      setError(null)
    } catch (err) {
      setError('Failed to update dependencies')
      console.error('Error in handleSelect:', err)
    }
  }, [value, maxDependencies, getMinionVersion, currentMinionId, onChange])

  return {
    error,
    setError,
    search,
    setSearch,
    filteredOptions,
    handleSelect,
    availableMinions
  }
}

