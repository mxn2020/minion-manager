// utils/versionUtils.ts
import { Minion, MinionDependency } from '@/types'

export interface VersionHistory {
  version: string
  isSelected: boolean
  isCurrent: boolean
}

export const getMinionVersion = (minion?: Minion): string => {
  if (!minion) return '0.0.0'
  const { user, major, minor } = minion.version
  return `${user}.${major}.${minor}`
}

export const compareVersions = (a: string, b: string): number => {
  const [aUser, aMajor, aMinor] = a.split('.').map(Number)
  const [bUser, bMajor, bMinor] = b.split('.').map(Number)

  if (aUser !== bUser) return aUser - bUser
  if (aMajor !== bMajor) return aMajor - bMajor
  return aMinor - bMinor
}

export const getVersionHistory = (
  minion: Minion,
  dependencies: MinionDependency[]
): VersionHistory[] => {
  const currentVersion = getMinionVersion(minion)
  const selectedDep = dependencies.find(dep => dep.id === minion.id)

  const versions: VersionHistory[] = [{
    version: currentVersion,
    isSelected: selectedDep?.version === currentVersion,
    isCurrent: true
  }]

  if (selectedDep && selectedDep.version !== currentVersion) {
    versions.push({
      version: selectedDep.version,
      isSelected: true,
      isCurrent: false
    })
  }

  return versions.sort((a, b) => compareVersions(b.version, a.version))
}

export const isVersionOutdated = (
  dependency: MinionDependency,
  minion?: Minion
): boolean => {
  if (!minion) return false
  return compareVersions(getMinionVersion(minion), dependency.version) > 0
}

export const getVersionDiff = (
  dependency: MinionDependency,
  minion?: Minion
): string | null => {
  if (!minion) return null

  const current = getMinionVersion(minion)
  const [curUser, curMajor, curMinor] = current.split('.').map(Number)
  const [selUser, selMajor, selMinor] = dependency.version.split('.').map(Number)

  const changes: string[] = []
  if (curUser !== selUser) changes.push('User version change')
  if (curMajor !== selMajor) changes.push('Major version change')
  if (curMinor !== selMinor) changes.push('Minor version change')

  return changes.join(', ')
}
