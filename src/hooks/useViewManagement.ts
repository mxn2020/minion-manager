// hooks/useViewManagement.ts
import { useCallback } from 'react'
import { useSettings } from '@/contexts/SettingsContext'
import { ViewMode } from '@/types'

export function useViewManagement() {
  const { settings, updateSettings } = useSettings()

  const handleViewModeChange = useCallback(async (view: ViewMode) => {
    if (view && view !== settings.viewMode) {
      await updateSettings({ viewMode: view })
    }
  }, [settings.viewMode, updateSettings])

  const handleSidebarToggle = useCallback(async (isOpen: boolean) => {
    if (isOpen !== settings.isSidebarOpen) {
      await updateSettings({ isSidebarOpen: isOpen })
    }
  }, [settings.isSidebarOpen, updateSettings])

  return {
    viewMode: settings.viewMode,
    isSidebarOpen: settings.isSidebarOpen,
    handleViewModeChange,
    handleSidebarToggle
  }
}
