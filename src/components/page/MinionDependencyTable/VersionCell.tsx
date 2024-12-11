// components/MinionDependencyTable/VersionCell.tsx
import { memo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { VersionHistory } from '@/utils/versionUtils'

interface VersionCellProps {
  version: string
  versionHistory: VersionHistory[]
  onVersionChange: (version: string) => void
}

export const VersionCell = memo(function VersionCell({
  version,
  versionHistory,
  onVersionChange
}: VersionCellProps) {
  return (
    <Select value={version} onValueChange={onVersionChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select version" />
      </SelectTrigger>
      <SelectContent>
        {versionHistory.map(v => (
          <SelectItem key={v.version} value={v.version}>
            <span className="flex items-center gap-2">
              v{v.version}
              {v.isCurrent && (
                <Badge variant="outline" className="ml-2">Current</Badge>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
})
