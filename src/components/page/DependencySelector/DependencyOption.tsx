// components/DependencySelector/DependencyOption.tsx
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, AlertCircle } from 'lucide-react'
import { cn } from "@/lib/utils"
import {
  CommandItem,
} from "@/components/ui/command"
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getStatusColor, getPriorityColor } from '@/utils/styleUtils'
import { DependencyOption as TDependencyOption } from "@/types"


export const DependencyOption = React.memo(function DependencyOption({ 
    option, 
    isSelected, 
    onSelect 
  }: { 
    option: TDependencyOption
    isSelected: boolean
    onSelect: () => void
  }) {
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
                  {option.status.replace('_', ' ')}
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
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    option.isOutdated && "border-yellow-500 text-yellow-500"
                  )}
                >
                  v{option.version}
                </Badge>
              </div>
            </CommandItem>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[300px]">
            <p className="font-medium">{option.label}</p>
            {option.isOutdated && (
              <p className="text-yellow-500 text-sm mt-1">
                New version available
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  })

