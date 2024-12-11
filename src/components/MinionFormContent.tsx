// components/MinionFormContent.tsx
import { memo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Minion, Tag, Label, RecurringConfig } from '@/types'
import { MinionTypeSelector } from './page/MinionTypeSelector'
import { ParentSelector } from './page/ParentSelector'
import { DependencySelector } from './page/DependencySelector'
import { MinionDependencyTable } from './page/MinionDependencyTable'
import { FormInput } from './FormInput'
import { useMinionForm } from '@/hooks/useMinionForm'

interface MinionFormContentProps {
  form: ReturnType<typeof useMinionForm>
  tags: Tag[]
  labels: Label[]
}

export const MinionFormContent = memo(function MinionFormContent({
  form,
  tags,
  labels
}: MinionFormContentProps) {
  const {
    editedMinion,
    formErrors,
    isSubmitting,
    isRecurring,
    hasUnsavedChanges,
    handleSubmit,
    handleInputChange,
    setIsRecurring
  } = form

  const [isTypePopoverOpen, setIsTypePopoverOpen] = useState(false)

  const handleRecurringChange = (checked: boolean) => {
    setIsRecurring(checked)
    if (!checked) {
      handleInputChange('recurring', undefined)
    } else {
      handleInputChange('recurring', {
        frequency: 'daily',
        interval: 1
      })
    }
  }

  const handleUserVersionChange = (increment: number) => {
    const currentVersion = parseInt(editedMinion.version?.user || '0')
    const newVersion = currentVersion + increment

    if (newVersion >= 0) {
      handleInputChange('version', {
        ...editedMinion.version,
        user: String(newVersion),
        major: editedMinion.version?.major || '0',
        minor: editedMinion.version?.minor || '0'
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Information */}
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <FormInput
            id="title"
            value={editedMinion.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            disabled={isSubmitting}
            required
            error={formErrors.title}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            value={editedMinion.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            disabled={isSubmitting}
            className="min-h-[100px]"
          />
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium">
              Status
            </label>
            <Select
              value={editedMinion.status}
              onValueChange={(value) => handleInputChange('status', value as Minion['status'])}
              disabled={isSubmitting}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium">
              Priority
            </label>
            <Select
              value={editedMinion.priority}
              onValueChange={(value) => handleInputChange('priority', value as Minion['priority'])}
              disabled={isSubmitting}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Type and Dependencies */}
        <div className="space-y-4">
          <div onClick={(e) => e.stopPropagation()}>
            <label htmlFor="type" className="block text-sm font-medium">
              Type
            </label>
            <MinionTypeSelector
              value={editedMinion.type || ''}
              onChange={(value) => handleInputChange('type', value)}
              isOpen={isTypePopoverOpen}
              onOpenChange={setIsTypePopoverOpen}
              disabled={isSubmitting}
            />
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <label htmlFor="parent" className="block text-sm font-medium">
              Parent Minion
            </label>
            <ParentSelector
              value={editedMinion.parentId}
              onChange={(value) => handleInputChange('parentId', value)}
              currentMinionId={editedMinion.id}
              disabled={isSubmitting}
            />
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <label htmlFor="dependencies" className="block text-sm font-medium">
              Dependencies
            </label>
            <DependencySelector
              currentMinionId={editedMinion.id}
              value={editedMinion.dependencies || []}
              onChange={(value) => handleInputChange('dependencies', value)}
              disabled={isSubmitting}
            />
            {formErrors.dependencies && (
              <span className="text-sm text-red-500">{formErrors.dependencies}</span>
            )}
            <div className="mt-2">
              <MinionDependencyTable
                minionId={editedMinion.id}
                dependencies={editedMinion.dependencies || []}
                onChange={(value) => handleInputChange('dependencies', value)}
              />
            </div>
          </div>
        </div>

        {/* Tags and Labels */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Tags</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center">
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={editedMinion.tags?.includes(tag.id)}
                    onCheckedChange={(checked) => {
                      const newTags = checked
                        ? [...(editedMinion.tags || []), tag.id]
                        : editedMinion.tags?.filter((id) => id !== tag.id) || []
                      handleInputChange('tags', newTags)
                    }}
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor={`tag-${tag.id}`}
                    className="ml-2 text-sm truncate"
                    style={{ color: tag.color }}
                  >
                    {tag.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Labels</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
              {labels.map((label) => (
                <div key={label.id} className="flex items-center">
                  <Checkbox
                    id={`label-${label.id}`}
                    checked={editedMinion.labels?.includes(label.id)}
                    onCheckedChange={(checked) => {
                      const newLabels = checked
                        ? [...(editedMinion.labels || []), label.id]
                        : editedMinion.labels?.filter((id) => id !== label.id) || []
                      handleInputChange('labels', newLabels)
                    }}
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor={`label-${label.id}`}
                    className="ml-2 text-sm truncate"
                    style={{ color: label.color }}
                  >
                    {label.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recurring Settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="recurring"
              checked={isRecurring}
              onCheckedChange={handleRecurringChange}
              disabled={isSubmitting}
            />
            <label htmlFor="recurring" className="text-sm font-medium">
              Recurring Task
            </label>
          </div>

          {isRecurring && (
            <div className="space-y-4 pl-6">
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium">
                  Frequency
                </label>
                <Select
                  value={editedMinion.recurring?.frequency || 'daily'}
                  onValueChange={(value) => {
                    handleInputChange('recurring', {
                      ...editedMinion.recurring,
                      frequency: value as RecurringConfig['frequency'],
                      interval: editedMinion.recurring?.interval || 1
                    })
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="interval" className="block text-sm font-medium">
                  Interval
                </label>
                <Input
                  id="interval"
                  type="number"
                  min="1"
                  value={editedMinion.recurring?.interval}
                  onChange={(e) => {
                    handleInputChange('recurring', {
                      ...editedMinion.recurring,
                      interval: parseInt(e.target.value) || 1,
                      frequency: editedMinion.recurring?.frequency || 'daily'
                    })
                  }}
                  disabled={isSubmitting}
                />
              </div>

              {formErrors.recurring && (
                <span className="text-sm text-red-500 block">{formErrors.recurring}</span>
              )}
            </div>
          )}
        </div>

        {/* Version Control */}
        <div>
          <label htmlFor="version" className="block text-sm font-medium">
            Version
          </label>
          <div className="flex items-center space-x-2">
            <Input
              id="version"
              value={`${editedMinion.version?.user || '0'}.${editedMinion.version?.major || '0'}.${editedMinion.version?.minor || '0'}`}
              readOnly
              disabled={isSubmitting}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => handleUserVersionChange(-1)}
              disabled={isSubmitting || parseInt(editedMinion.version?.user || '0') <= 0}
            >
              -
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleUserVersionChange(1)}
              disabled={isSubmitting}
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || !hasUnsavedChanges}
        >
          {isSubmitting ? 'Saving...' : 'Save changes'}
        </Button>
      </div>

      {Object.keys(formErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the form errors before submitting
          </AlertDescription>
        </Alert>
      )}
    </form>
  )
})