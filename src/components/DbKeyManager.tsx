'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useSettings } from '@/contexts/SettingsContext'
import { AlertCircle, Database, Edit2, Trash2, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import type { DbKey } from '@/lib/db'

interface FormError {
  name?: string
  description?: string
}

export function DbKeyManager() {
  const { toast } = useToast()
  const { 
    settings, 
    dbKeys,
    addDbKey,
    updateDbKey,
    deleteDbKey,
    updateSettings 
  } = useSettings()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newDbKey, setNewDbKey] = useState<DbKey>({ name: '', description: '' })
  const [editingDbKey, setEditingDbKey] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormError>({})

  const validateForm = () => {
    const errors: FormError = {}
    
    if (!newDbKey.name.trim()) {
      errors.name = 'Name is required'
    } else if (newDbKey.name.length < 3) {
      errors.name = 'Name must be at least 3 characters'
    } else if (!editingDbKey && dbKeys.some(key => 
      key.name.toLowerCase() === newDbKey.name.toLowerCase()
    )) {
      errors.name = 'Name must be unique'
    }

    if (!newDbKey.description.trim()) {
      errors.description = 'Description is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetForm = () => {
    setNewDbKey({ name: '', description: '' })
    setEditingDbKey(null)
    setFormErrors({})
  }

  const handleAddDbKey = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await addDbKey(newDbKey)
      
      // If this is the first key, set it as selected
      if (dbKeys.length === 0) {
        await updateSettings({ 
          ...settings,
          selectedDbKey: newDbKey.name 
        })
      }
      
      toast({
        title: 'Success',
        description: 'Database key added successfully'
      })
      
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add database key',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditDbKey = async () => {
    if (!validateForm() || !editingDbKey) return

    setIsLoading(true)
    try {
      await updateDbKey(editingDbKey, newDbKey)
      
      // If editing the selected key, update the selectedDbKey
      if (settings.selectedDbKey === editingDbKey) {
        await updateSettings({ 
          ...settings,
          selectedDbKey: newDbKey.name 
        })
      }
      
      toast({
        title: 'Success',
        description: 'Database key updated successfully'
      })
      
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update database key',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDbKey = async (name: string) => {
    if (dbKeys.length === 1) {
      toast({
        title: 'Error',
        description: 'Cannot delete the last database key',
        variant: 'destructive'
      })
      return
    }

    if (name === 'default') {
      toast({
        title: 'Error',
        description: 'Cannot delete the default database key',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      await deleteDbKey(name)
      
      // If deleting the selected key, switch to the first available key
      if (settings.selectedDbKey === name) {
        const firstAvailableKey = dbKeys.find(key => key.name !== name)
        if (firstAvailableKey) {
          await updateSettings({ 
            ...settings,
            selectedDbKey: firstAvailableKey.name 
          })
        }
      }
      
      toast({
        title: 'Success',
        description: 'Database key deleted successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete database key',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    setIsDialogOpen(open)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Keys
        </CardTitle>
        <CardDescription>
          Manage your database keys for different workspaces
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {dbKeys.length > 0 ? (
            <div className="space-y-2">
              {dbKeys.map(key => (
                <div
                  key={key.name}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    settings.selectedDbKey === key.name && "bg-muted"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{key.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {key.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setNewDbKey(key)
                        setEditingDbKey(key.name)
                        setIsDialogOpen(true)
                      }}
                      disabled={isLoading}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDbKey(key.name)}
                      disabled={isLoading || key.name === 'default' || dbKeys.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <Database className="h-8 w-8 mb-2" />
              <p>No database keys added yet</p>
            </div>
          )}
        </ScrollArea>

        <Button
          onClick={() => setIsDialogOpen(true)}
          className="w-full mt-4"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          Add New DB Key
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDbKey ? 'Edit DB Key' : 'Add New DB Key'}
              </DialogTitle>
              <DialogDescription>
                {editingDbKey 
                  ? 'Edit the database key details below.'
                  : 'Add a new database key to manage a separate workspace.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newDbKey.name}
                  onChange={(e) => {
                    setNewDbKey({ ...newDbKey, name: e.target.value })
                    if (formErrors.name) {
                      setFormErrors({ ...formErrors, name: undefined })
                    }
                  }}
                  placeholder="Enter key name"
                  disabled={isLoading}
                />
                {formErrors.name && (
                  <p className="text-sm text-destructive">{formErrors.name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newDbKey.description}
                  onChange={(e) => {
                    setNewDbKey({ ...newDbKey, description: e.target.value })
                    if (formErrors.description) {
                      setFormErrors({ ...formErrors, description: undefined })
                    }
                  }}
                  placeholder="Enter key description"
                  disabled={isLoading}
                />
                {formErrors.description && (
                  <p className="text-sm text-destructive">{formErrors.description}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => handleDialogClose(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={editingDbKey ? handleEditDbKey : handleAddDbKey}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingDbKey ? 'Save Changes' : 'Add DB Key'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}