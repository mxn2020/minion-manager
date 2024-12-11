// components/ParentSelector/index.tsx
import { memo, useState } from 'react'
import { ChevronsUpDown, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ParentOption } from './ParentOption'
import { useParentManagement } from '@/hooks/useParentManagement'
import { getStatusColor } from '@/utils/styleUtils'

interface ParentSelectorProps {
  currentMinionId: string
  value?: string
  onChange: (value: string | undefined) => void
  disabled?: boolean
}

export const ParentSelector = memo(function ParentSelector({
  currentMinionId,
  value,
  onChange,
  disabled = false,
}: ParentSelectorProps) {
  const [open, setOpen] = useState(false)
  
  const {
    search,
    setSearch,
    error,
    filteredOptions,
    selectedParent,
    handleSelect
  } = useParentManagement({
    currentMinionId,
    value,
    onChange
  })

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div className="space-y-2" onClick={handleContainerClick}>
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
            {selectedParent ? (
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate">{selectedParent.title}</span>
                <Badge 
                  variant="secondary"
                  className={cn("text-xs", getStatusColor(selectedParent.status))}
                >
                  {selectedParent.status.replace("_", " ")}
                </Badge>
              </div>
            ) : (
              "Select parent..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search potential parents..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No matching minions found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value=""
                  onSelect={() => {
                    handleSelect(undefined)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 mr-2",
                      !value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>No parent</span>
                </CommandItem>
                {filteredOptions.map((option) => (
                  <ParentOption
                    key={option.value}
                    option={option}
                    isSelected={value === option.value}
                    onSelect={() => {
                      handleSelect(option.value)
                      setOpen(false)
                    }}
                  />
                ))}
              </CommandGroup>
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

export default ParentSelector

