// components/QuickCapture.tsx
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Minion } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { useToast } from "@/hooks/use-toast"
import { useMinions } from '@/hooks/useMinions'

export function QuickCapture() {
  const [input, setInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { addMinion } = useMinions()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isSubmitting) {
      setIsSubmitting(true)
      const now = new Date()
      const newMinion: Minion = {
        id: uuidv4(),
        type: 'task',
        title: input.trim(),
        description: '',
        status: 'not_started',
        priority: 'medium',
        timeSpent: 0,
        tags: [],
        labels: [],
        children: [],
        dependencies: [],
        dependentOn: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        archived: false,
        favorite: false,
        version: {
          user: '0',
          major: '0',
          minor: '0'
        }
      }
      try {
        await addMinion(newMinion)
        setInput('')
        toast({
          title: "Minion added",
          description: "Your new minion has been added successfully.",
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add minion. Please try again.",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="Quick capture..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isSubmitting}
      />
      <Button type="submit" disabled={isSubmitting || !input.trim()}>
        {isSubmitting ? 'Adding...' : 'Add'}
      </Button>
    </form>
  )
}

