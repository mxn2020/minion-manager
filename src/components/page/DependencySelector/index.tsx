// components/DependencySelector/index.tsx
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, AlertCircle } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { MinionDependency } from '@/types'
import { Badge } from '@/components/ui/badge'
import { useDependencyManagement } from '@/hooks/useDependencyManagement'
import { DependencyOption } from './DependencyOption'

interface DependencySelectorProps {
  currentMinionId: string
  value: MinionDependency[]
  onChange: (value: MinionDependency[]) => void
  disabled?: boolean
  maxDependencies?: number
}

export const DependencySelector = React.memo(function DependencySelector({
  currentMinionId,
  value,
  onChange,
  disabled = false,
  maxDependencies = 10
}: DependencySelectorProps) {
  const [open, setOpen] = React.useState(false)
  
  const {
    error,
    search,
    setSearch,
    filteredOptions,
    handleSelect
  } = useDependencyManagement({
    currentMinionId,
    maxDependencies,
    value,
    onChange
  })

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              error && "border-red-500 dark:border-red-500"
            )}
            disabled={disabled}
          >
            <span className="flex items-center gap-2 truncate">
              {value.length > 0 ? (
                <>
                  <span>{value.length} dependenc{value.length === 1 ? 'y' : 'ies'} selected</span>
                  <Badge variant="secondary">
                    {value.length}
                  </Badge>
                </>
              ) : (
                "Select dependencies..."
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search dependencies..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No dependencies found.</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <DependencyOption
                    key={option.value}
                    option={option}
                    isSelected={value.some(v => v.id === option.value)}
                    onSelect={() => {
                      handleSelect(option.value)
                      setOpen(true)
                    }}
                  />
                ))}
              </CommandGroup>
              {value.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        onChange([])
                        setOpen(false)
                      }}
                      className="text-red-500 dark:text-red-400"
                    >
                      Clear all dependencies
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
})

