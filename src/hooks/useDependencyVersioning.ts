// hooks/useDependencyVersioning.ts
import { useMemo, useCallback } from 'react'
import { Minion, MinionDependency } from '@/types'
import * as versionUtils from '@/utils/versionUtils'

export function useDependencyVersioning(
  dependencies: MinionDependency[],
  minions: Minion[],
  onChange: (value: MinionDependency[]) => void
) {
  const validDependencies = useMemo(() =>
    dependencies.filter(dep => minions.some(t => t.id === dep.id)),
    [dependencies, minions]
  )

  const handleVersionChange = useCallback((depId: string, version: string) => {
    const newDependencies = dependencies.map(dep =>
      dep.id === depId ? {
        ...dep,
        version,
        currentVersion: versionUtils.getMinionVersion(
          minions.find(t => t.id === depId)
        )
      } : dep
    )
    onChange(newDependencies)
  }, [dependencies, minions, onChange])

  return {
    validDependencies,
    handleVersionChange,
    getMinionVersion: versionUtils.getMinionVersion,
    getVersionHistory: useCallback(
      (minion: Minion) => versionUtils.getVersionHistory(minion, dependencies),
      [dependencies]
    ),
    isVersionOutdated: useCallback(
      (dependency: MinionDependency) => versionUtils.isVersionOutdated(
        dependency,
        minions.find(t => t.id === dependency.id)
      ),
      [minions]
    ),
    getVersionDiff: useCallback(
      (dependency: MinionDependency) => versionUtils.getVersionDiff(
        dependency,
        minions.find(t => t.id === dependency.id)
      ),
      [minions]
    )
  }
}


