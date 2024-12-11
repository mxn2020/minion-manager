'use client'

import React, { memo } from 'react'
import { Minion } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useMinionForm } from '@/hooks/useMinionForm'
import { useTags } from '@/hooks/useTags'
import { useLabels } from '@/hooks/useLabels'
import { MinionFormContent } from './MinionFormContent'
import { ScrollArea } from '@/components/ui/scroll-area'

interface EditMinionDialogProps {
  isOpen: boolean
  onClose: () => void
  minion: Minion
  onUpdate: (id: string, updates: Partial<Minion>) => Promise<void>;
}

const EditMinionDialog = memo(function EditMinionDialog({ 
  isOpen, 
  onClose, 
  minion, 
  onUpdate 
}: EditMinionDialogProps) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const { tags } = useTags()
  const { labels } = useLabels()
  const form = useMinionForm({ minion, onUpdate, onClose })

  const content = (
    <MinionFormContent
      form={form}
      tags={tags}
      labels={labels}
    />
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={form.handleClose}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>Edit Minion</SheetTitle>
          </SheetHeader>
          <ScrollArea className="mt-4 h-[calc(100%-4rem)]">
            {content}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={form.handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Minion</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(100vh-10rem)]">
          {content}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
})

export default EditMinionDialog