'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import type { Tag, Label as LabelType, Group, Folder } from '@/types'
import { useTags } from '@/hooks/useTags'
import { useLabels } from '@/hooks/useLabels'
import { useGroups } from '@/hooks/useGroups'
import { useFolders } from '@/hooks/useFolders'

type EntityType = 'tags' | 'labels' | 'groups' | 'folders'
type EntityMap = {
  tags: Tag;
  labels: LabelType;
  groups: Group;
  folders: Folder;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<EntityType>('tags')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingItem, setEditingItem] = useState<Partial<EntityMap[EntityType]> | null>(null)
  const [newItem, setNewItem] = useState<Partial<EntityMap[EntityType]>>({})

  const { toast } = useToast()
  const { tags, createTag, updateTag, deleteTag } = useTags()
  const { labels, createLabel, updateLabel, deleteLabel } = useLabels()
  const { groups, createGroup, updateGroup, deleteGroup } = useGroups()
  const { folders, createFolder, updateFolder, deleteFolder } = useFolders()

  const handleCreate = async () => {
    if (!newItem.name) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const item = { 
        ...newItem, 
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      switch (activeTab) {
        case 'tags':
          await createTag(item as Tag)
          break
        case 'labels':
          await createLabel(item as LabelType)
          break
        case 'groups':
          await createGroup(item as Group)
          break
        case 'folders':
          await createFolder(item as Folder)
          break
      }
      setIsCreateDialogOpen(false)
      setNewItem({})
      toast({
        title: "Success",
        description: `${activeTab.slice(0, -1)} created successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error creating item',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!editingItem?.name || !editingItem.id) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    try {
      const updates = {
        ...editingItem,
        updatedAt: new Date().toISOString()
      }

      switch (activeTab) {
        case 'tags':
          await updateTag(editingItem.id, updates as Partial<Tag>)
          break
        case 'labels':
          await updateLabel(editingItem.id, updates as Partial<LabelType>)
          break
        case 'groups':
          await updateGroup(editingItem.id, updates as Partial<Group>)
          break
        case 'folders':
          await updateFolder(editingItem.id, updates as Partial<Folder>)
          break
      }
      setIsEditDialogOpen(false)
      setEditingItem(null)
      toast({
        title: "Success",
        description: `${activeTab.slice(0, -1)} updated successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error updating item',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
      return
    }

    setIsLoading(true)
    try {
      switch (activeTab) {
        case 'tags':
          await deleteTag(id)
          break
        case 'labels':
          await deleteLabel(id)
          break
        case 'groups':
          await deleteGroup(id)
          break
        case 'folders':
          await deleteFolder(id)
          break
      }
      toast({
        title: "Success",
        description: `${activeTab.slice(0, -1)} deleted successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error deleting item',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleColorChange = async (id: string, color: string) => {
    setIsLoading(true)
    try {
      if (activeTab === 'tags') {
        await updateTag(id, { color })
      } else if (activeTab === 'labels') {
        await updateLabel(id, { color })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error updating color',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderTable = (items: EntityMap[EntityType][]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          {(activeTab === 'tags' || activeTab === 'labels') && <TableHead>Color</TableHead>}
          {activeTab === 'groups' && <TableHead>Description</TableHead>}
          {activeTab === 'folders' && (
            <>
              <TableHead>Parent ID</TableHead>
              <TableHead>Group ID</TableHead>
            </>
          )}
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.name || 'N/A'}</TableCell>
            {(activeTab === 'tags' || activeTab === 'labels') && (
              <TableCell>
                <Input
                  type="color"
                  value={(item as Tag | LabelType).color || '#000000'}
                  onChange={(e) => handleColorChange(item.id, e.target.value)}
                  disabled={isLoading}
                />
              </TableCell>
            )}
            {activeTab === 'groups' && (
              <TableCell>{(item as Group).description || 'N/A'}</TableCell>
            )}
            {activeTab === 'folders' && (
              <>
                <TableCell>{(item as Folder).parentId || 'None'}</TableCell>
                <TableCell>{(item as Folder).groupId || 'None'}</TableCell>
              </>
            )}
            <TableCell>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingItem(item)
                  setIsEditDialogOpen(true)
                }} 
                className="mr-2"
                disabled={isLoading}
              >
                Edit
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDelete(item.id)}
                disabled={isLoading}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  const renderDialog = (
    isOpen: boolean, 
    onClose: () => void, 
    onSubmit: () => void, 
    item: Partial<EntityMap[EntityType]>, 
    setItem: (item: Partial<EntityMap[EntityType]>) => void, 
    isEdit: boolean
  ) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${activeTab.slice(0, -1)}` : `Create ${activeTab.slice(0, -1)}`}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={item.name || ''}
              onChange={(e) => setItem({ ...item, name: e.target.value })}
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
          {(activeTab === 'tags' || activeTab === 'labels') && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Color
              </Label>
              <Input
                id="color"
                type="color"
                value={(item as Partial<Tag | LabelType>).color || '#000000'}
                onChange={(e) => setItem({ ...item, color: e.target.value })}
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
          )}
          {activeTab === 'groups' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={(item as Partial<Group>).description || ''}
                onChange={(e) => setItem({ ...item, description: e.target.value })}
                className="col-span-3"
                disabled={isLoading}
              />
            </div>
          )}
          {activeTab === 'folders' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="parentId" className="text-right">
                  Parent ID
                </Label>
                <Input
                  id="parentId"
                  value={(item as Partial<Folder>).parentId || ''}
                  onChange={(e) => setItem({ ...item, parentId: e.target.value })}
                  className="col-span-3"
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="groupId" className="text-right">
                  Group ID
                </Label>
                <Input
                  id="groupId"
                  value={(item as Partial<Folder>).groupId || ''}
                  onChange={(e) => setItem({ ...item, groupId: e.target.value })}
                  className="col-span-3"
                  disabled={isLoading}
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onSubmit} disabled={isLoading}>
            {isEdit ? 'Save changes' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as EntityType)}>
        <TabsList>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="labels">Labels</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="folders">Folders</TabsTrigger>
        </TabsList>
        {(['tags', 'labels', 'groups', 'folders'] as const).map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)} 
              className="mb-4"
              disabled={isLoading}
            >
              Create {tab.slice(0, -1)}
            </Button>
            {renderTable(
              tab === 'tags' ? tags :
              tab === 'labels' ? labels :
              tab === 'groups' ? groups :
              folders
            )}
          </TabsContent>
        ))}
      </Tabs>
      {renderDialog(isCreateDialogOpen, () => setIsCreateDialogOpen(false), handleCreate, newItem, setNewItem, false)}
      {editingItem && renderDialog(isEditDialogOpen, () => setIsEditDialogOpen(false), handleEdit, editingItem, setEditingItem, true)}
    </div>
  )
}