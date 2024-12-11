// hooks/useMinionDependencies.ts
import { useCallback, useState } from 'react'
import { useData } from '@/contexts/DataContext'
import { MinionDependency, Minion } from '@/types'

interface UseMinionDependenciesProps {
  currentMinionId: string
  initialDependencies?: MinionDependency[]
  maxDependencies?: number
  onError?: (message: string) => void
}

export function useMinionDependencies({
  currentMinionId,
  initialDependencies = [],
  maxDependencies = 10,
  onError
}: UseMinionDependenciesProps) {
  const { data: { minions }, create, update } = useData()
  const [dependencies, setDependencies] = useState<MinionDependency[]>(initialDependencies)
  const [isProcessing, setIsProcessing] = useState(false)

  const getVersionInfo = useCallback((minionId: string) => {
    const minion = minions.find(t => t.id === minionId)
    if (!minion) return { version: '0.0.0', versionObject: { user: 0, major: 0, minor: 0 } }
    
    return {
      version: `${minion.version.user}.${minion.version.major}.${minion.version.minor}`,
      versionObject: { ...minion.version }
    }
  }, [minions])

  const validateDependency = useCallback((
    minionId: string, 
    chain = new Set<string>([currentMinionId])
  ): { isValid: boolean; error?: string } => {
    const minion = minions.find(t => t.id === minionId)
    
    if (!minion) {
      return { isValid: false, error: 'Minion not found' }
    }

    if (minion.archived || minion.deletedAt) {
      return { isValid: false, error: 'Cannot depend on archived or deleted minions' }
    }

    // Check for circular dependencies
    if (chain.has(minionId)) {
      return { isValid: false, error: 'Circular dependency detected' }
    }

    // Check nested dependencies
    for (const dep of minion.dependencies) {
      chain.add(dep.id)
      const validation = validateDependency(dep.id, chain)
      if (!validation.isValid) {
        return validation
      }
      chain.delete(dep.id)
    }

    return { isValid: true }
  }, [minions, currentMinionId])

  const addDependency = useCallback(async (
    minionId: string,
    options: {
      skipValidation?: boolean
      skipVersionCheck?: boolean
    } = {}
  ) => {
    try {
      setIsProcessing(true)

      // Check maximum dependencies limit
      if (dependencies.length >= maxDependencies) {
        throw new Error(`Maximum ${maxDependencies} dependencies allowed`)
      }

      // Skip if already added
      if (dependencies.some(d => d.id === minionId)) {
        return
      }

      // Validate dependency unless skipped
      if (!options.skipValidation) {
        const validation = validateDependency(minionId)
        if (!validation.isValid) {
          throw new Error(validation.error)
        }
      }

      // Get version information
      const { version, versionObject } = getVersionInfo(minionId)

      // Create new dependency
      const newDependency: MinionDependency = {
        id: minionId,
        minionId: currentMinionId,
        version,
        currentVersion: version
      }

      // Update minion with new dependency
      const currentMinion = minions.find(t => t.id === currentMinionId)
      if (!currentMinion) {
        throw new Error('Current minion not found')
      }

      // Update the dependencies
      const updatedDependencies = [...dependencies, newDependency]
      setDependencies(updatedDependencies)

      // Update the minion in storage
      await update('minions', currentMinionId, {
        dependencies: updatedDependencies,
        updatedAt: new Date(),
      })

      // Update the dependent minion's references
      const dependentMinion = minions.find(t => t.id === minionId)
      if (dependentMinion) {
        await update('minions', minionId, {
          dependentOn: [
            ...(dependentMinion.dependentOn || []),
            {
              id: currentMinionId,
              minionId: minionId,
              version: versionObject
            }
          ],
          updatedAt: new Date()
        })
      }

      return newDependency
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add dependency'
      onError?.(message)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [
    dependencies,
    maxDependencies,
    validateDependency,
    getVersionInfo,
    currentMinionId,
    minions,
    update,
    onError
  ])

  const removeDependency = useCallback(async (minionId: string) => {
    try {
      setIsProcessing(true)

      // Remove from current dependencies
      const updatedDependencies = dependencies.filter(d => d.id !== minionId)
      setDependencies(updatedDependencies)

      // Update minion in storage
      await update('minions', currentMinionId, {
        dependencies: updatedDependencies,
        updatedAt: new Date()
      })

      // Update dependent minion's references
      const dependentMinion = minions.find(t => t.id === minionId)
      if (dependentMinion) {
        await update('minions', minionId, {
          dependentOn: (dependentMinion.dependentOn || []).filter(
            (d: MinionDependency) => d.id !== currentMinionId
          ),
          updatedAt: new Date()
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove dependency'
      onError?.(message)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [dependencies, currentMinionId, minions, update, onError])

  const updateDependencies = useCallback(async (newDependencies: MinionDependency[]) => {
    try {
      setIsProcessing(true)

      // Validate all new dependencies
      for (const dep of newDependencies) {
        if (!dependencies.some(d => d.id === dep.id)) {
          const validation = validateDependency(dep.id)
          if (!validation.isValid) {
            throw new Error(validation.error)
          }
        }
      }

      // Find removed dependencies
      const removedDeps = dependencies.filter(
        dep => !newDependencies.some(d => d.id === dep.id)
      )

      // Update dependencies
      setDependencies(newDependencies)

      // Update current minion
      await update('minions', currentMinionId, {
        dependencies: newDependencies,
        updatedAt: new Date()
      })

      // Update removed dependencies' references
      for (const dep of removedDeps) {
        const dependentMinion = minions.find(t => t.id === dep.id)
        if (dependentMinion) {
          await update('minions', dep.id, {
            dependentOn: (dependentMinion.dependentOn || []).filter(
              (d: MinionDependency) => d.id !== currentMinionId
            ),
            updatedAt: new Date()
          })
        }
      }

      // Add new references
      for (const dep of newDependencies) {
        if (!dependencies.some(d => d.id === dep.id)) {
          const dependentMinion = minions.find(t => t.id === dep.id)
          if (dependentMinion) {
            await update('minions', dep.id, {
              dependentOn: [
                ...(dependentMinion.dependentOn || []),
                {
                  id: currentMinionId,
                  minionId: dep.id,
                  version: getVersionInfo(dep.id).versionObject
                }
              ],
              updatedAt: new Date()
            })
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update dependencies'
      onError?.(message)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [dependencies, currentMinionId, minions, update, validateDependency, getVersionInfo, onError])

  return {
    dependencies,
    isProcessing,
    addDependency,
    removeDependency,
    updateDependencies
  }
}

