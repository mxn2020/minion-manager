'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { db, type DbKey, type Settings, type UserPreferences, type StorageType } from '@/lib/db'
import { useToast } from '@/hooks/use-toast'

interface SettingsContextType {
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => Promise<void>
  dbKeys: DbKey[]
  addDbKey: (newKey: DbKey) => Promise<void>
  updateDbKey: (name: string, updates: Partial<DbKey>) => Promise<void>
  deleteDbKey: (name: string) => Promise<void>
  isLoading: boolean
  error: Error | null
}

interface SettingsState {
  settings: Settings
  isLoading: boolean
  error: Error | null
}

const defaultSettings: Settings = {
  darkMode: false,
  storageType: 'localStorage' as StorageType,
  selectedDbKey: 'default',
  viewMode: 'list',
  isSidebarOpen: false,
  dbKeys: [
    {
      name: 'default',
      description: 'Default workspace'
    }
  ]
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SettingsState>({
    settings: defaultSettings,
    isLoading: true,
    error: null
  })
  const { toast } = useToast()
  const loadingRef = useRef(false)
  const initialLoadComplete = useRef(false)

  const loadSettings = useCallback(async () => {
    // Prevent concurrent loading
    if (loadingRef.current) {
      return
    }

    try {
      loadingRef.current = true
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      // Load preferences from localStorage first
      const preferences = await db.getUserPreferences()
      
      // Then load dbKeys based on storage type
      const keys = await db.getDbKeys(preferences.storageType)
      const dbKeys = keys.length > 0 ? keys : defaultSettings.dbKeys

      // Merge everything into full settings object
      const fullSettings: Settings = {
        darkMode: preferences.darkMode ?? defaultSettings.darkMode,
        storageType: preferences.storageType ?? defaultSettings.storageType,
        selectedDbKey: preferences.selectedDbKey ?? defaultSettings.selectedDbKey,
        viewMode: preferences.viewMode ?? defaultSettings.viewMode,
        isSidebarOpen: preferences.isSidebarOpen ?? defaultSettings.isSidebarOpen,
        dbKeys
      }

      // Ensure valid selectedDbKey
      if (!dbKeys.some(key => key.name === fullSettings.selectedDbKey)) {
        fullSettings.selectedDbKey = dbKeys[0].name
      }

      // Save default settings if needed
      if (keys.length === 0) {
        await Promise.all([
          db.saveDbKeys(dbKeys, preferences.storageType),
          db.saveUserPreferences({
            ...preferences,
            selectedDbKey: fullSettings.selectedDbKey
          })
        ])
      }

      setState(prev => ({
        ...prev,
        settings: fullSettings,
        isLoading: false,
        error: null
      }))

      initialLoadComplete.current = true
    } catch (error) {
      console.error('Error loading settings:', error)
      const err = error instanceof Error ? error : new Error('Failed to load settings')
      setState(prev => ({
        ...prev,
        error: err,
        isLoading: false,
        // Keep existing settings on error
        settings: prev.settings
      }))
      
      if (!initialLoadComplete.current) {
        toast({
          title: "Error loading settings",
          description: "Using default settings. Please try again later.",
          variant: "destructive",
        })
      }
    } finally {
      loadingRef.current = false
    }
  }, [toast])

  // Load settings only once on mount
  useEffect(() => {
    if (!initialLoadComplete.current) {
      loadSettings()
    }
  }, [loadSettings])

  // Handle dark mode
  useEffect(() => {
    if (state.settings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [state.settings.darkMode])

  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    try {
      const newSettings = { ...state.settings, ...updates }
      const preferences: UserPreferences = {
        darkMode: newSettings.darkMode,
        storageType: newSettings.storageType,
        selectedDbKey: newSettings.selectedDbKey,
        viewMode: newSettings.viewMode,
        isSidebarOpen: newSettings.isSidebarOpen
      }

      // Handle storage type change
      if (updates.storageType && updates.storageType !== state.settings.storageType) {
        await db.saveDbKeys(newSettings.dbKeys, updates.storageType)
      }

      // Update state first for optimistic UI
      setState(prev => ({ ...prev, settings: newSettings }))

      // Then persist changes
      await db.saveUserPreferences(preferences)
    } catch (error) {
      console.error('Error updating settings:', error)
      const err = error instanceof Error ? error : new Error('Failed to update settings')
      
      // Revert state on error
      setState(prev => ({ ...prev, error: err }))
      
      toast({
        title: "Error updating settings",
        description: err.message,
        variant: "destructive",
      })
      throw err
    }
  }, [state.settings, toast])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  useEffect(() => {
    if (state.settings.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [state.settings.darkMode])

  const savePreferences = async (preferences: UserPreferences): Promise<void> => {
    await db.saveUserPreferences(preferences)
  }

  const addDbKey = useCallback(async (newKey: DbKey) => {
    try {
      if (state.settings.dbKeys.some(key => key.name === newKey.name)) {
        throw new Error('Database key already exists')
      }

      const updatedKeys = [...state.settings.dbKeys, newKey]
      await db.saveDbKeys(updatedKeys, state.settings.storageType)
      
      setState(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          dbKeys: updatedKeys
        }
      }))
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to add database key')
      setState(prev => ({ ...prev, error: err }))
      toast({
        title: "Error adding database key",
        description: err.message,
        variant: "destructive",
      })
      throw err
    }
  }, [state.settings, toast])

  const updateDbKey = useCallback(async (name: string, updates: Partial<DbKey>) => {
    try {
      const updatedKeys = state.settings.dbKeys.map(key => 
        key.name === name ? { ...key, ...updates } : key
      )

      await db.saveDbKeys(updatedKeys, state.settings.storageType)

      const newSettings = {
        ...state.settings,
        dbKeys: updatedKeys
      }

      if (name === state.settings.selectedDbKey && updates.name) {
        newSettings.selectedDbKey = updates.name
        await savePreferences({
          darkMode: state.settings.darkMode,
          storageType: state.settings.storageType,
          selectedDbKey: updates.name,
          viewMode: state.settings.viewMode,
          isSidebarOpen: state.settings.isSidebarOpen
        })
      }

      setState(prev => ({ ...prev, settings: newSettings }))
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to update database key')
      setState(prev => ({ ...prev, error: err }))
      toast({
        title: "Error updating database key",
        description: err.message,
        variant: "destructive",
      })
      throw err
    }
  }, [state.settings, toast])

  const deleteDbKey = useCallback(async (name: string) => {
    try {
      if (name === 'default') {
        throw new Error('Cannot delete default database key')
      }
      if (state.settings.dbKeys.length === 1) {
        throw new Error('Cannot delete the last database key')
      }

      const updatedKeys = state.settings.dbKeys.filter(key => key.name !== name)
      await db.saveDbKeys(updatedKeys, state.settings.storageType)

      const newSettings = {
        ...state.settings,
        dbKeys: updatedKeys
      }

      if (name === state.settings.selectedDbKey) {
        newSettings.selectedDbKey = updatedKeys[0].name
        await savePreferences({
          darkMode: state.settings.darkMode,
          storageType: state.settings.storageType,
          selectedDbKey: updatedKeys[0].name,
          viewMode: state.settings.viewMode,
          isSidebarOpen: state.settings.isSidebarOpen
        })
      }

      setState(prev => ({ ...prev, settings: newSettings }))
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to delete database key')
      setState(prev => ({ ...prev, error: err }))
      toast({
        title: "Error deleting database key",
        description: err.message,
        variant: "destructive",
      })
      throw err
    }
  }, [state.settings, toast])

  return (
    <SettingsContext.Provider
      value={{
        settings: state.settings,
        updateSettings,
        dbKeys: state.settings.dbKeys,
        addDbKey,
        updateDbKey,
        deleteDbKey,
        isLoading: state.isLoading,
        error: state.error
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export type { SettingsContextType }