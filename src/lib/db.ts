import { ViewMode } from '@/types'
import { put, head, del, list, type PutBlobResult } from '@vercel/blob'

export const APP_KEY = 'minionmanagementapp'

export type StorageType = 'localStorage' | 'blob'

export type Table = 
  | 'minions'
  | 'types'
  | 'timeLogs'
  | 'templates'
  | 'tags'
  | 'labels'
  | 'groups'
  | 'folders'
  | 'columns'

export type DbKey = {
  name: string
  description: string
}

export interface Settings {
  darkMode: boolean
  storageType: StorageType
  selectedDbKey: string
  dbKeys: DbKey[]
  viewMode: ViewMode
  isSidebarOpen: boolean
}

export type UserPreferences = {
  darkMode: boolean
  storageType: StorageType
  selectedDbKey: string
  viewMode: ViewMode
  isSidebarOpen: boolean
}

export type PaginationOptions = {
  limit?: number
  cursor?: string
}

export type StorageController = {
  getAll: (table: Table, dbKey: string, options?: PaginationOptions) => Promise<{ items: any[], cursor?: string }>
  getById: (table: Table, id: string, dbKey: string) => Promise<any | null>
  create: (table: Table, item: any, dbKey: string) => Promise<void>
  update: (table: Table, id: string, updates: Partial<any>, dbKey: string) => Promise<void>
  delete: (table: Table, id: string, dbKey: string) => Promise<void>
  listByPrefix?: (table: Table, prefix: string, dbKey: string) => Promise<any[]>
  getDbKeys: () => Promise<DbKey[]>
  saveDbKeys: (dbKeys: DbKey[]) => Promise<void>
}

// utils
export const serializeDate = (obj: any): any => {
  if (obj instanceof Date) {
    return obj.toISOString();
  } else if (Array.isArray(obj)) {
    return obj.map(serializeDate);
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, serializeDate(value)])
    );
  }
  return obj;
}

export const deserializeDate = (obj: any): any => {
  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(obj)) {
    return new Date(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(deserializeDate);
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, deserializeDate(value)])
    );
  }
  return obj;
}

// localStorageController
const getLocalStorageData = async (dbKey: string): Promise<Record<Table, any[]>> => {
  const data = localStorage.getItem(`${APP_KEY}_${dbKey}`)
  return data ? deserializeDate(JSON.parse(data)) : {
    minions: [],
    timeLogs: [],
    templates: [],
    tags: [],
    labels: [],
    groups: [],
    folders: [],
    columns: []
  }
}

const setLocalStorageData = async (dbKey: string, data: Record<Table, any[]>) => {
  localStorage.setItem(`${APP_KEY}_${dbKey}`, JSON.stringify(serializeDate(data)))
}

export const localStorageController: StorageController = {
  getAll: async (table: Table, dbKey: string) => {
    console.log('Getting all items from localStorage:', table, dbKey);
    const data = await getLocalStorageData(dbKey);
    return { items: data[table] };
  },

  getById: async (table: Table, id: string, dbKey: string) => {
    const data = await getLocalStorageData(dbKey);
    return data[table].find(item => item.id === id) || null;
  },

  create: async (table: Table, item: any, dbKey: string) => {
    const data = await getLocalStorageData(dbKey);
    data[table].push(item);
    await setLocalStorageData(dbKey, data);
    window.dispatchEvent(new Event('dataUpdated'));
  },

  update: async (table: Table, id: string, updates: Partial<any>, dbKey: string) => {
    const data = await getLocalStorageData(dbKey);
    const index = data[table].findIndex(item => item.id === id);
    if (index !== -1) {
      data[table][index] = { ...data[table][index], ...updates };
      await setLocalStorageData(dbKey, data);
      window.dispatchEvent(new Event('dataUpdated'));
    }
  },

  delete: async (table: Table, id: string, dbKey: string) => {
    const data = await getLocalStorageData(dbKey);
    data[table] = data[table].filter(item => item.id !== id);
    await setLocalStorageData(dbKey, data);
    window.dispatchEvent(new Event('dataUpdated'));
  },

  getDbKeys: async () => {
    const dbKeysJson = localStorage.getItem(`${APP_KEY}_db_keys`);
    return dbKeysJson ? JSON.parse(dbKeysJson) : [];
  },

  saveDbKeys: async (dbKeys: DbKey[]) => {
    localStorage.setItem(`${APP_KEY}_db_keys`, JSON.stringify(dbKeys));
  }
};

// blobController
export const getBlobPath = (dbKey: string, table: Table, itemId?: string) => {
  const path = `${APP_KEY}/${dbKey}/${table}`;
  return itemId ? `${path}/${itemId}.json` : path;
};

export const blobController: StorageController = {
  getAll: async (table: Table, dbKey: string, options: PaginationOptions = {}) => {
    console.log('[blobController] Getting all items from blob storage:', table, dbKey, options);
    try {
      const params = new URLSearchParams({
        operation: 'getAll',
        table,
        dbKey,
        ...(options.limit && { limit: options.limit.toString() }),
        ...(options.cursor && { cursor: options.cursor })
      });

      const response = await fetch(`/api/blob?${params}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      return await response.json();
    } catch (error) {
      console.error('Error listing blobs:', error);
      return { items: [] };
    }
  },

  getById: async (table: Table, id: string, dbKey: string) => {
    try {
      const params = new URLSearchParams({
        operation: 'getById',
        table,
        dbKey,
        id
      });

      const response = await fetch(`/api/blob?${params}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      return response.json();
    } catch (error) {
      console.error('Error getting blob by id:', error);
      return null;
    }
  },

  create: async (table: Table, item: any, dbKey: string) => {
    try {
      const response = await fetch('/api/blob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'create',
          table,
          dbKey,
          item: serializeDate(item)
        })
      });
      
      if (!response.ok) throw new Error('Failed to create item');
      window.dispatchEvent(new Event('dataUpdated'));
    } catch (error) {
      console.error('Error creating blob:', error);
      throw error;
    }
  },

  update: async (table: Table, id: string, updates: Partial<any>, dbKey: string) => {
    try {
      const existingItem = await blobController.getById(table, id, dbKey);
      if (!existingItem) throw new Error('Item not found');

      const updatedItem = { ...existingItem, ...updates };
      const response = await fetch('/api/blob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'update',
          table,
          dbKey,
          item: serializeDate(updatedItem)
        })
      });

      if (!response.ok) throw new Error('Failed to update item');
      window.dispatchEvent(new Event('dataUpdated'));
    } catch (error) {
      console.error('Error updating blob:', error);
      throw error;
    }
  },

  delete: async (table: Table, id: string, dbKey: string) => {
    try {
      const params = new URLSearchParams({ table, dbKey, id });
      const response = await fetch(`/api/blob?${params}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete item');
      window.dispatchEvent(new Event('dataUpdated'));
    } catch (error) {
      console.error('Error deleting blob:', error);
      throw error;
    }
  },

  listByPrefix: async (table: Table, prefix: string, dbKey: string) => {
    try {
      const params = new URLSearchParams({
        operation: 'listByPrefix',
        table,
        dbKey,
        prefix
      });

      const response = await fetch(`/api/blob?${params}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      return response.json();
    } catch (error) {
      console.error('Error listing blobs by prefix:', error);
      return [];
    }
  },

  getDbKeys: async () => {
    try {
      const params = new URLSearchParams({
        operation: 'getDbKeys'
      });

      const response = await fetch(`/api/blob?${params}`);
      if (!response.ok) throw new Error('Failed to fetch db keys');
      return response.json();
    } catch (error) {
      console.error('Error reading db_keys from blob storage:', error);
      return [];
    }
  },

  saveDbKeys: async (dbKeys: DbKey[]) => {
    try {
      const response = await fetch('/api/blob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'saveDbKeys',
          item: dbKeys
        })
      });

      if (!response.ok) throw new Error('Failed to save db keys');
    } catch (error) {
      console.error('Error saving db_keys to blob storage:', error);
      throw error;
    }
  }
};


// storage db controller
export const db = {
  getAll: async (
    table: Table, 
    storageType: 'localStorage' | 'blob', 
    dbKey: string,
    options?: PaginationOptions
  ) => {
    const controller = storageType === 'blob' ? blobController : localStorageController;
    return controller.getAll(table, dbKey, options);
  },

  getById: async (table: Table, id: string, storageType: 'localStorage' | 'blob', dbKey: string) => {
    const controller = storageType === 'blob' ? blobController : localStorageController;
    return controller.getById(table, id, dbKey);
  },

  create: async (table: Table, item: any, storageType: 'localStorage' | 'blob', dbKey: string) => {
    const controller = storageType === 'blob' ? blobController : localStorageController;
    return controller.create(table, item, dbKey);
  },

  update: async (table: Table, id: string, updates: Partial<any>, storageType: 'localStorage' | 'blob', dbKey: string) => {
    const controller = storageType === 'blob' ? blobController : localStorageController;
    return controller.update(table, id, updates, dbKey);
  },

  delete: async (table: Table, id: string, storageType: 'localStorage' | 'blob', dbKey: string) => {
    const controller = storageType === 'blob' ? blobController : localStorageController;
    return controller.delete(table, id, dbKey);
  },

  listByPrefix: async (table: Table, prefix: string, storageType: 'localStorage' | 'blob', dbKey: string) => {
    if (storageType === 'blob' && blobController.listByPrefix) {
      return blobController.listByPrefix(table, prefix, dbKey);
    }
    return [];
  },

  getDbKeys: async (storageType: 'localStorage' | 'blob') => {
    const controller = storageType === 'blob' ? blobController : localStorageController;
    return controller.getDbKeys();
  },

  saveDbKeys: async (dbKeys: DbKey[], storageType: 'localStorage' | 'blob') => {
    const controller = storageType === 'blob' ? blobController : localStorageController;
    return controller.saveDbKeys(dbKeys);
  },

  getUserPreferences: async (): Promise<UserPreferences> => {
    const preferencesJson = localStorage.getItem(`${APP_KEY}_user_preferences`);
    return preferencesJson ? JSON.parse(preferencesJson) : {
      darkMode: false,
      storageType: 'localStorage',
      selectedDbKey: 'default'
    };
  },

  saveUserPreferences: async (preferences: UserPreferences): Promise<void> => {
    localStorage.setItem(`${APP_KEY}_user_preferences`, JSON.stringify(preferences));
  }
};

