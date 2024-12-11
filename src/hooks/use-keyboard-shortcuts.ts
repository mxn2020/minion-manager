import { useEffect } from 'react'

type ShortcutHandler = (event: KeyboardEvent) => void

export function useKeyboardShortcuts(shortcuts: Record<string, ShortcutHandler>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = `${event.ctrlKey || event.metaKey ? 'Ctrl+' : ''}${event.key.toLowerCase()}`
      const handler = shortcuts[key]
      if (handler) {
        event.preventDefault()
        handler(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcuts])
}

