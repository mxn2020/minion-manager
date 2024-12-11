// components/MinionDependencyTable/DependencyRow.tsx
import { memo } from 'react'
import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { History } from "lucide-react"
import { VersionCell } from './VersionCell'
import { Minion, MinionDependency } from '@/types'
import { VersionHistory } from '@/utils/versionUtils'

interface DependencyRowProps {
  dependency: MinionDependency
  minion: Minion
  currentVersion: string
  isOutdated: boolean
  versionDiff: string | null
  versionHistory: VersionHistory[]
  onVersionChange: (version: string) => void
}

export const DependencyRow = memo(function DependencyRow({
  dependency,
  minion,
  currentVersion,
  isOutdated,
  versionDiff,
  versionHistory,
  onVersionChange
}: DependencyRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span>{minion.title}</span>
          <span className="text-sm text-muted-foreground">
            {minion.description}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <VersionCell
          version={dependency.version}
          versionHistory={versionHistory}
          onVersionChange={onVersionChange}
        />
      </TableCell>
      <TableCell>v{currentVersion}</TableCell>
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant={isOutdated ? "destructive" : "default"}>
                {isOutdated ? 'Outdated' : 'Up to date'}
              </Badge>
            </TooltipTrigger>
            {isOutdated && versionDiff && (
              <TooltipContent>
                <p>{versionDiff}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="text-right">
        {isOutdated && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onVersionChange(currentVersion)}
          >
            <History className="h-4 w-4 mr-2" />
            Update to latest
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
})

