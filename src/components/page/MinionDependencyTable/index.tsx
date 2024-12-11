// components/MinionDependencyTable/index.tsx
import { memo } from 'react'
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { DependencyRow } from './DependencyRow'
import { MinionDependency } from '@/types'
import { useMinions } from '@/hooks/useMinions'
import { useDependencyVersioning } from '@/hooks/useDependencyVersioning'

interface MinionDependencyTableProps {
  minionId: string
  dependencies: MinionDependency[]
  onChange: (value: MinionDependency[]) => void
}

export const MinionDependencyTable = memo(function MinionDependencyTable({
  minionId,
  dependencies,
  onChange
}: MinionDependencyTableProps) {
  const { minions } = useMinions()
  const {
    validDependencies,
    handleVersionChange,
    getMinionVersion,
    getVersionHistory,
    isVersionOutdated,
    getVersionDiff
  } = useDependencyVersioning(dependencies, minions, onChange)

  if (validDependencies.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No dependencies configured
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Dependency</TableHead>
          <TableHead>Selected Version</TableHead>
          <TableHead>Current Version</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {validDependencies.map(dep => {
          const depMinion = minions.find(t => t.id === dep.id)
          if (!depMinion) return null

          const currentVersion = getMinionVersion(depMinion)
          
          return (
            <DependencyRow
              key={dep.id}
              dependency={dep}
              minion={depMinion}
              currentVersion={currentVersion}
              isOutdated={isVersionOutdated(dep)}
              versionDiff={getVersionDiff(dep)}
              versionHistory={getVersionHistory(depMinion)}
              onVersionChange={(version) => handleVersionChange(dep.id, version)}
            />
          )
        })}
      </TableBody>
    </Table>
  )
})

export default MinionDependencyTable