'use client'

import { useRouter } from 'next/navigation'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

export function KeyboardShortcuts() {
  const router = useRouter()

  useKeyboardShortcuts({
    'Ctrl+n': () => router.push('/'),
    'Ctrl+f': () => document.querySelector<HTMLInputElement>('input[type="text"]')?.focus(),
    'Ctrl+/': () => router.push('/help'),
  })

  return null
}

