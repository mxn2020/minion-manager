export type MinionDependency = {
  id: string              // ID of the dependency minion
  minionId: string        // ID of the minion that depends on the dependency
  version: string         // Version of the dependency that this minion depends on
  currentVersion: string  // Current version of the dependency (for tracking updates)
}

export type Comment = {
  text: string
  createdAt: string
}

export type Minion = {
  id: string
  type: string
  title: string
  description: string
  status: 'not_started' | 'in_progress' | 'blocked' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  estimatedTime?: number
  timeSpent: number
  tags: string[]
  labels: string[]
  parentId?: string
  children: string[]
  dependencies: MinionDependency[]
  dependentOn: MinionDependency[]
  comments?: Comment[]
  version: {
    user: string;
    major: string;
    minor: string;
  };
  createdAt: string
  updatedAt: string
  deletedAt?: string
  archived: boolean
  favorite: boolean
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    endDate?: string
    occurrences?: number
  }
}

export type Tag = {
  id: string
  name: string
  color: string
  createdAt: string
  updatedAt: string
}

export type Label = {
  id: string
  name: string
  color: string
  createdAt: string
  updatedAt: string
}

export type Group = {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export type Folder = {
  id: string
  name: string
  parentId?: string
  groupId?: string
  createdAt: string
  updatedAt: string
}

export type Column = {
  id: string
  name: string
  groupId: string
  order: number
  createdAt: string
  updatedAt: string
}

export type TimeLog = {
  id: string
  minionId: string
  startTime: string
  endTime?: string
  duration?: number
  description?: string
  createdAt: string
  updatedAt: string
}

export type Template = {
  id: string
  name: string
  description: string
  template: Minion
  createdAt: string
  updatedAt: string
}

export type VersionChange = {
  field: keyof Minion
  type: 'major' | 'minor' | 'patch'
}

export const versionChangeRules: VersionChange[] = [
  { field: 'title', type: 'minor' },
  { field: 'description', type: 'minor' },
  { field: 'status', type: 'major' },
  { field: 'priority', type: 'major' },
  { field: 'dueDate', type: 'minor' },
  { field: 'estimatedTime', type: 'minor' },
  { field: 'tags', type: 'minor' },
  { field: 'labels', type: 'minor' },
  { field: 'parentId', type: 'major' },
  { field: 'dependencies', type: 'major' },
  { field: 'recurring', type: 'major' },
]

export type Type = {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  createdAt: string
  updatedAt: string
  usageCount: number
}

// dashboard and filters

export type ViewMode = 'list' | 'cards' | 'icons'

export type FilterableKeys = keyof Pick<Minion, 
  'status' | 
  'priority' | 
  'type' | 
  'archived' | 
  'favorite' | 
  'tags' | 
  'labels' | 
  'dueDate' | 
  'timeSpent'
>

export interface FilterCriteria {
  status?: Minion['status']
  priority?: Minion['priority']
  type?: string
  archived?: boolean
  favorite?: boolean
  tags?: string[]
  labels?: string[]
  search?: string
  dueDate?: {
    start?: string
    end?: string
  }
  timeSpent?: {
    min?: number
    max?: number
  }
}

export const DEFAULT_FILTERS: FilterCriteria = {
  archived: false,
  search: '',
}

// edit minion form

export type FormErrors = Partial<Record<keyof Minion, string>>;

export type RequiredMinionVersion = {
  user: string;
  major: string;
  minor: string;
}

export type RecurringConfig = NonNullable<Minion['recurring']>

export interface EditedMinion extends Omit<Minion, 'id' | 'version' | 'recurring'> {
  id: string; // Keep id required
  version?: RequiredMinionVersion;
  recurring?: RecurringConfig;
}

// dependency selector

export interface DependencyOption {
  value: string
  label: string
  version: string
  status: Minion['status']
  priority: Minion['priority']
  isOutdated?: boolean
}