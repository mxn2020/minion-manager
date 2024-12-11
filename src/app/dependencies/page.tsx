'use client'

import { useMemo, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Edit, Archive, Search, AlertCircle } from 'lucide-react'
import EditMinionDialog from '@/components/EditMinionDialog'
import { DependencyCanvas } from '@/components/page/DependencyCanvas'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import type { Minion } from '@/types'
import { useMinions } from '@/hooks/useMinions'

// Move MinionCard to a separate component
interface MinionCardProps {
  minion: Minion
  isSelected: boolean
  onSelect: (id: Minion['id']) => void
  onEdit: (id: Minion['id'], e: React.MouseEvent) => void
  onArchive: (id: Minion['id'], e: React.MouseEvent) => void
  isLoading: boolean
}

const MinionCard: React.FC<MinionCardProps> = ({
  minion,
  isSelected,
  onSelect,
  onEdit,
  onArchive,
  isLoading
}) => (
  <Card 
    className={`cursor-pointer transition-colors hover:bg-accent ${
      isSelected ? 'border-primary' : ''
    }`}
    onClick={() => onSelect(minion.id)}
  >
    <CardHeader>
      <CardTitle className="flex justify-between items-start gap-2">
        <div>
          <span className="mr-2">{minion.title}</span>
          {(minion.dependencies?.length ?? 0) > 0 && (
            <Badge variant="secondary" className="text-xs">
              {minion.dependencies?.length} {minion.dependencies?.length === 1 ? 'dependency' : 'dependencies'}
            </Badge>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => onEdit(minion.id, e)}
            className="h-8 w-8 p-0"
            disabled={isLoading}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => onArchive(minion.id, e)}
            className="h-8 w-8 p-0"
            disabled={isLoading}
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      </CardTitle>
      {minion.description && (
        <CardDescription className="line-clamp-2">
          {minion.description}
        </CardDescription>
      )}
    </CardHeader>
  </Card>
)

export default function DependencyPage() {
  const { minions, updateMinion } = useMinions()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMinionId, setSelectedMinionId] = useState<Minion['id'] | null>(null)
  const [editingMinionId, setEditingMinionId] = useState<Minion['id'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const filteredMinions = useMemo(() => {
    const searchLower = searchTerm.toLowerCase()
    
    return minions
      .filter((minion): minion is Minion => {
        if (!minion || minion.archived || minion.deletedAt) return false
        
        return (
          (minion.title?.toLowerCase().includes(searchLower) ?? false) ||
          (minion.description?.toLowerCase().includes(searchLower) ?? false)
        )
      })
      .sort((a, b) => {
        const aDeps = a.dependencies?.length ?? 0
        const bDeps = b.dependencies?.length ?? 0
        return bDeps - aDeps
      })
  }, [minions, searchTerm])

  const selectedMinion = useMemo(() => {
    return selectedMinionId ? minions.find(t => t.id === selectedMinionId) : null
  }, [selectedMinionId, minions])

  const handleEdit = (id: Minion['id'], e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingMinionId(id)
  }

  const handleArchive = async (id: Minion['id'], e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)
    try {
      await updateMinion(id, { 
        archived: true,
      })
      toast({
        title: "Minion Archived",
        description: "The minion has been moved to the archive."
      })
      if (selectedMinionId === id) {
        setSelectedMinionId(null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to archive minion.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search minions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {filteredMinions.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No minions found. {searchTerm && 'Try adjusting your search.'}
                </AlertDescription>
              </Alert>
            ) : (
              filteredMinions.map(minion => (
                <MinionCard
                  key={minion.id}
                  minion={minion}
                  isSelected={selectedMinionId === minion.id}
                  onSelect={setSelectedMinionId}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  isLoading={isLoading}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
      
      <div className="w-2/3 p-4 bg-background">
        {selectedMinionId ? (
            <DependencyCanvas minionId={selectedMinionId} 
            />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a minion to view its dependencies
          </div>
        )}
      </div>

      {editingMinionId && (
        <EditMinionDialog
          isOpen={true}
          onClose={() => setEditingMinionId(null)}
          minion={minions.find(t => t.id === editingMinionId)!}
          onUpdate={updateMinion}
        />
      )}
    </div>
  )
}

