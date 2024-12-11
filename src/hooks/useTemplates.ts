// hooks/useTemplates.ts
import { useCallback } from 'react'
import { useData } from '@/contexts/DataContext'
import { Template, Minion } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export function useTemplates() {
  const { data, create, update, delete: deleteItem } = useData()

  const createTemplate = useCallback(async (template: Omit<Template, 'id'>) => {
    await create('templates', template)
  }, [create])

  const updateTemplate = useCallback(async (id: string, updates: Partial<Template>) => {
    await update('templates', id, updates)
  }, [update])

  const deleteTemplate = useCallback(async (id: string) => {
    await deleteItem('templates', id)
  }, [deleteItem])

  const createMinionFromTemplate = useCallback(async (templateId: string, overrides: Partial<Minion> = {}) => {
    const template = data.templates.find(t => t.id === templateId)
    if (!template) throw new Error('Template not found')

    const now = new Date().toISOString()
    const minion: Minion = {
      ...template.template,
      ...overrides,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      version: {
        user: 'system',
        major: '1',
        minor: '0'
      }
    }

    await create('minions', minion)
    return minion
  }, [data.templates, create])

  return {
    templates: data.templates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createMinionFromTemplate
  }
}