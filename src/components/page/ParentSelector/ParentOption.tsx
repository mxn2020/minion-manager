// components/ParentSelector/ParentOption.tsx
import { memo } from 'react'
import { Check } from 'lucide-react'
import { CommandItem } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { getStatusColor, getPriorityColor } from '@/utils/styleUtils'
import type { ParentOption as TParentOption } from '@/hooks/useParentManagement'

interface ParentOptionProps {
  option: TParentOption
  isSelected: boolean
  onSelect: () => void
}

export const ParentOption = memo(function ParentOption({
  option,
  isSelected,
  onSelect
}: ParentOptionProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <CommandItem
            value={option.value}
            onSelect={onSelect}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Check
                className={cn(
                  "h-4 w-4",
                  isSelected ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="truncate">{option.label}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge 
                variant="secondary"
                className={cn("text-xs", getStatusColor(option.status))}
              >
                {option.status.replace("_", " ")}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  getPriorityColor(option.priority)
                )}
              >
                {option.priority}
              </Badge>
              <Badge variant="outline" className="text-xs">
                v{option.version}
              </Badge>
            </div>
          </CommandItem>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[300px]">
          <p className="font-medium">{option.label}</p>
          <div className="text-sm mt-1">
            {option.children > 0 && (
              <p>{option.children} child{option.children === 1 ? "" : "ren"}</p>
            )}
            {option.hasParent && <p>Has parent</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})

