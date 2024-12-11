'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useSettings } from '@/contexts/SettingsContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DbKeyManager } from '@/components/DbKeyManager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Moon,
  Database,
  HardDrive,
  Download,
  Upload,
  AlertCircle,
  ServerCog,
  Loader2
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useMinions } from '@/hooks/useMinions'
import { useTimeLogs } from '@/hooks/useTimeLogs'
import { useTags } from '@/hooks/useTags'
import { useLabels } from '@/hooks/useLabels'
import { useGroups } from '@/hooks/useGroups'
import { useFolders } from '@/hooks/useFolders'
import { useColumns } from '@/hooks/useColumns'

interface ExportData {
  minions: any[]
  timeLogs: any[]
  tags: any[]
  labels: any[]
  groups: any[]
  folders: any[]
  columns: any[]
  exportDate: string
  version: string
}

export default function SettingsPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { settings, updateSettings, dbKeys } = useSettings()
  const [isLoading, setIsLoading] = useState(false)
  
  // Get data from all contexts
  const { minions, addMinion } = useMinions()
  const { timeLogs, addTimeLog } = useTimeLogs()
  const { tags, createTag } = useTags()
  const { labels, createLabel } = useLabels()
  const { groups, createGroup } = useGroups()
  const { folders, createFolder } = useFolders()
  const { columns, createColumn } = useColumns()

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text) as ExportData
      
      // Validate data structure
      if (!data.minions || !Array.isArray(data.minions)) {
        throw new Error('Invalid data format: missing or invalid minions array')
      }

      // Import data in the correct order to maintain relationships
      const importSequence = [
        { items: data.tags || [], add: createTag },
        { items: data.labels || [], add: createLabel },
        { items: data.groups || [], add: createGroup },
        { items: data.folders || [], add: createFolder },
        { items: data.columns || [], add: createColumn },
        { items: data.minions || [], add: addMinion },
        { items: data.timeLogs || [], add: addTimeLog },
      ]

      for (const { items, add } of importSequence) {
        await Promise.all(items.map(async (item) => {
          try {
            await add(item)
          } catch (error) {
            console.warn(`Failed to import item:`, item, error)
          }
        }))
      }

      toast({
        title: 'Data imported',
        description: 'Your data has been imported successfully.',
      })
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'There was an error importing your data.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleExportData = () => {
    try {
      const data: ExportData = {
        minions,
        timeLogs,
        tags,
        labels,
        groups,
        folders,
        columns,
        exportDate: new Date().toISOString(),
        version: '1.0.0' // Add version for future compatibility
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `minion-app-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'Data exported',
        description: 'Your data has been exported successfully.',
      })
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'There was an error exporting your data.',
        variant: 'destructive',
      })
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background pt-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Settings</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how the application looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for a better viewing experience in low light
                  </p>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => updateSettings({ darkMode: checked })}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Storage Settings
              </CardTitle>
              <CardDescription>
                Configure how and where your data is stored
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Storage Type</Label>
                  <Select 
                    value={settings.storageType}
                    onValueChange={(value) => updateSettings({ storageType: value as 'localStorage' | 'blob' })}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select storage type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="localStorage">Local Storage</SelectItem>
                      <SelectItem value="blob">Blob Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Database Key</Label>
                  <Select 
                    value={settings.selectedDbKey}
                    onValueChange={(value) => updateSettings({ selectedDbKey: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select database" />
                    </SelectTrigger>
                    <SelectContent>
                      {dbKeys.map((key) => (
                        <SelectItem key={key.name} value={key.name}>
                          {key.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />
              
              <DbKeyManager />

              {settings.storageType === 'blob' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Make sure you have configured your blob storage connection string in the environment variables.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ServerCog className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Export or import your minion data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={handleExportData}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Export Data
                </Button>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Import Data
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
                disabled={isLoading}
              />

              <Alert>
                <HardDrive className="h-4 w-4" />
                <AlertDescription>
                  Exported data includes minions, time logs, tags, labels, groups, folders, columns and related metadata.
                  Import functionality will merge data with existing records.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}