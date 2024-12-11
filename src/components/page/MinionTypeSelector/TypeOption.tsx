// components/MinionTypeSelector/TypeOption.tsx
import { memo } from 'react'
import { Check } from 'lucide-react'
import { CommandItem } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TypeOptionProps {
  name: string
  usageCount: number
  isSelected: boolean
  onSelect: () => void
}

export const TypeOption = memo(function TypeOption({
  name,
  usageCount,
  isSelected,
  onSelect
}: TypeOptionProps) {
  return (
    <CommandItem
      value={name}
      onSelect={onSelect}
      className="flex items-center justify-between"
    >
      <div className="flex items-center">
        <Check
          className={cn(
            "mr-2 h-4 w-4",
            isSelected ? "opacity-100" : "opacity-0"
          )}
        />
        <span>{name}</span>
      </div>
      <Badge variant="secondary" className="ml-2">
        {usageCount}
      </Badge>
    </CommandItem>
  )
})

