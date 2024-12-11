// hooks/useMinionForm.ts
import { useState, useCallback, useEffect } from 'react'
import { Minion, EditedMinion, FormErrors, versionChangeRules } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface UseMinionFormProps {
  minion: Minion
  onUpdate: (id: string, updates: Partial<Minion>) => Promise<void>;
  onClose: () => void
}

export function useMinionForm({ minion, onUpdate, onClose }: UseMinionFormProps) {
  // Initialize with required fields
  const [editedMinion, setEditedMinion] = useState<EditedMinion>({
    ...minion,
    id: minion.id,
    version: minion.version
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isRecurring, setIsRecurring] = useState(!!minion.recurring)
  const { toast } = useToast()

  // Reset form when minion changes
  useEffect(() => {
    setEditedMinion({
      ...minion,
      id: minion.id,
      version: minion.version
    })
    setIsRecurring(!!minion.recurring)
    setFormErrors({})
    setHasUnsavedChanges(false)
  }, [minion])

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {}

    if (!editedMinion.title?.trim()) {
      errors.title = 'Title is required'
    }

    if (isRecurring) {
      if (!editedMinion.recurring?.frequency) {
        errors.recurring = 'Frequency is required for recurring tasks'
      }
      if (editedMinion.recurring?.interval && editedMinion.recurring.interval < 1) {
        errors.recurring = 'Interval must be greater than 0'
      }
    }

    if (editedMinion.dependencies?.length) {
      const hasSelfDependency = editedMinion.dependencies.some(dep => dep.id === minion.id)
      if (hasSelfDependency) {
        errors.dependencies = 'A minion cannot depend on itself'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [editedMinion, isRecurring, minion.id])

  const calculateVersionChanges = useCallback((originalMinion: Minion, updates: Partial<Minion>) => {
    const versionChanges = { major: 0, minor: 0 }

    Object.entries(updates).forEach(([key, value]) => {
      if (JSON.stringify(originalMinion[key as keyof Minion]) !== JSON.stringify(value)) {
        const rule = versionChangeRules.find(rule => rule.field === key)
        if (rule && (rule.type === 'major' || rule.type === 'minor')) {
          versionChanges[rule.type]++
        } else {
          versionChanges.minor++
        }
      }
    })

    return versionChanges
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const updates: Partial<Omit<Minion, "id" | "createdAt">> = {
        ...editedMinion,
        version: {
          user: editedMinion.version?.user ?? minion.version.user,
          major: String(parseInt(minion.version.major)),
          minor: String(parseInt(minion.version.minor))
        }
      }

      const versionChanges = calculateVersionChanges(minion, updates)
      
      updates.version = {
        user: editedMinion.version?.user ?? minion.version.user,
        major: String(parseInt(minion.version.major) + versionChanges.major),
        minor: String(parseInt(minion.version.minor) + versionChanges.minor)
      }

      updates.updatedAt = new Date().toISOString()

      await onUpdate(editedMinion.id, updates)
      toast({
        title: "Success",
        description: "Minion updated successfully"
      })
      setHasUnsavedChanges(false)
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update minion",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [minion, editedMinion, validateForm, calculateVersionChanges, onUpdate, onClose, toast])

  const handleInputChange = useCallback(<K extends keyof Minion>(
    field: K,
    value: Minion[K]
  ) => {
    setEditedMinion(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }, [formErrors])

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to close?')
      if (!confirm) return
    }
    onClose()
  }, [hasUnsavedChanges, onClose])

  return {
    editedMinion,
    formErrors,
    isSubmitting,
    isRecurring,
    hasUnsavedChanges,
    handleSubmit,
    handleInputChange,
    handleClose,
    setIsRecurring
  }
}