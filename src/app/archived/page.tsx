'use client'

import { useMemo } from 'react'
import { Minion } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { useMinions } from '@/hooks/useMinions'

export default function ArchivedPage() {
  const { minions, updateMinion } = useMinions()
  const { toast } = useToast()

  // Filter archived minions using useMemo to avoid unnecessary recalculations
  const archivedMinions = useMemo(() => {
    return minions.filter(minion => minion.archived && !minion.deletedAt)
  }, [minions])

  const handleRestore = async (minion: Minion) => {
    try {
      await updateMinion(minion.id, { archived: false })
      toast({
        title: "Minion Restored",
        description: `"${minion.title}" has been restored to active minions.`
      })
    } catch (error) {
      toast({
        title: "Error Restoring Minion",
        description: error instanceof Error ? error.message : "Failed to restore minion.",
        variant: "destructive"
      })
    }
  }

  const handleSoftDelete = async (minion: Minion) => {
    try {
      await updateMinion(minion.id, { deletedAt: new Date().toISOString() })
      toast({
        title: "Minion Deleted",
        description: `"${minion.title}" has been moved to trash.`
      })
    } catch (error) {
      toast({
        title: "Error Deleting Minion",
        description: error instanceof Error ? error.message : "Failed to delete minion.",
        variant: "destructive"
      })
    }
  }

  // Display message if no archived minions
  if (archivedMinions.length === 0) {
    return (
      <main className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8">Archived Minions</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No archived minions found.</p>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Archived Minions</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {archivedMinions.map(minion => (
          <Card key={minion.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="line-clamp-2">{minion.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Type:</span> {minion.type}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Status:</span> {minion.status}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Version:</span> {`${minion.version.user}.${minion.version.major}.${minion.version.minor}`}
                </p>
                {minion.description && (
                  <p className="text-sm line-clamp-3">
                    <span className="font-medium">Description:</span> {minion.description}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
              <Button 
                onClick={() => handleRestore(minion)}
                className="flex-1"
              >
                Restore
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleSoftDelete(minion)}
                className="flex-1"
              >
                Delete
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href={`/minion/${minion.id}`}>Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  )
}