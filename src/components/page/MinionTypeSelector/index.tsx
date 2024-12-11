// components/MinionTypeSelector/index.tsx
import { memo, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Command, CommandGroup, CommandEmpty, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronsUpDown, Plus } from 'lucide-react'
import { useTypeManagement } from '@/hooks/useTypeManagement'
import { TypeOption } from './TypeOption'
import { Type } from '@/types'

interface MinionTypeSelectorProps {
  value: string
  onChange: (value: string) => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
}

export const MinionTypeSelector = memo(function MinionTypeSelector({
  value,
  onChange,
  isOpen = false,
  onOpenChange,
  disabled = false
}: MinionTypeSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  
  const {
    inputValue,
    search,
    filteredTypes,
    handleSelectType,
    handleInputChange
  } = useTypeManagement({
    value,
    onChange,
    onOpenChange
  })

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSelectType(inputValue)
    }
  }

  return (
    <div onClick={handleContainerClick}>
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter minion type..."
              disabled={disabled}
              className="w-full pr-10"
              onKeyDown={handleKeyDown}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => onOpenChange?.(!isOpen)}
              disabled={disabled}
            >
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandGroup>
              {filteredTypes.map((type: Type) => (
                <TypeOption
                  key={type.id}
                  name={type.name}
                  usageCount={type.usageCount}
                  isSelected={type.name.toLowerCase() === value.toLowerCase()}
                  onSelect={() => handleSelectType(type.name)}
                />
              ))}
              {search && !filteredTypes.some((type: Type) => 
                type.name.toLowerCase() === search.toLowerCase()
              ) && (
                <CommandItem
                  onSelect={() => handleSelectType(search)}
                  className="flex items-center text-muted-foreground"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create "{search}"
                </CommandItem>
              )}
            </CommandGroup>
            <CommandEmpty>No types found</CommandEmpty>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
})

export default MinionTypeSelector

