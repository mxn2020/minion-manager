// hooks/useTypeManagement.ts
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTypes } from '@/hooks/useTypes'
import { useToast } from '@/hooks/use-toast'

interface UseTypeManagementProps {
  value: string
  onChange: (value: string) => void
  onOpenChange?: (open: boolean) => void
}

export function useTypeManagement({
  value,
  onChange,
  onOpenChange
}: UseTypeManagementProps) {
  const { types, createType } = useTypes()
  const [inputValue, setInputValue] = useState(value || 'new minion')
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    setInputValue(value || 'new minion')
  }, [value])

  const handleSelectType = useCallback(async (typeName: string) => {
    try {
      const existingType = types.find(
        t => t.name.toLowerCase() === typeName.toLowerCase()
      )
      
      if (existingType) {
        onChange(existingType.name)
      } else {
        const newType = await createType({
          name: typeName,
          description: `Custom type: ${typeName}`
        })
        onChange(newType.name)
        toast({
          title: "New type created",
          description: `Created new type: ${typeName}`
        })
      }
      
      onOpenChange?.(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new type",
        variant: "destructive"
      })
    }
  }, [types, createType, onChange, onOpenChange, toast])

  const filteredTypes = useMemo(() => {
    return types
      .filter(type => type.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        // Sort by usage count first
        if (a.usageCount !== b.usageCount) {
          return b.usageCount - a.usageCount
        }
        // Then alphabetically
        return a.name.localeCompare(b.name)
      })
  }, [types, search])

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value)
    setSearch(value)
  }, [])

  return {
    inputValue,
    search,
    filteredTypes,
    handleSelectType,
    handleInputChange
  }
}

