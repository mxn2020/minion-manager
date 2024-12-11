// contexts/DataContext.tsx

'use client';

import { Table, db } from '@/lib/db';
import { createContext, useContext, useEffect, useState } from 'react';
import { useSettings } from './SettingsContext';

type LoadingStatus = 'idle' | 'checking-blob' | 'loading-settings' | 'loading-data' | 'error' | 'success';

interface DataContextType {
  data: Record<Table, any[]>;
  isLoading: boolean;
  loadingStatus: LoadingStatus;
  statusMessage: string;
  error: Error | null;
  refetch: () => Promise<void>;
  create: (table: Table, item: any) => Promise<void>;
  update: (table: Table, id: string, updates: Partial<any>) => Promise<void>;
  delete: (table: Table, id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [data, setData] = useState<Record<Table, any[]>>({
    minions: [],
    types: [],
    timeLogs: [],
    templates: [],
    tags: [],
    labels: [],
    groups: [],
    folders: [],
    columns: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setLoadingStatus('checking-blob');
      setStatusMessage('Checking storage configuration...');

      // Check if we're using blob storage and verify access
      if (settings.storageType === 'blob') {
        setStatusMessage('Initializing blob storage connection...');
        // Add any blob storage initialization checks here if needed
      }

      setLoadingStatus('loading-data');
      setStatusMessage('Loading your data...');

      const newData: Record<Table, any[]> = {
        minions: [],
        types: [],
        timeLogs: [],
        templates: [],
        tags: [],
        labels: [],
        groups: [],
        folders: [],
        columns: [],
      };

      // Load data for each table
      for (const table of Object.keys(newData) as Table[]) {
        setStatusMessage(`Loading ${table}...`);
        const result = await db.getAll(
          table,
          settings.storageType,
          settings.selectedDbKey
        );
        newData[table] = result.items;
      }

      setData(newData);
      setLoadingStatus('success');
      setStatusMessage('Data loaded successfully');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
      setLoadingStatus('error');
      setStatusMessage(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Listen for data updates
    const handleDataUpdate = () => {
      loadData();
    };
    window.addEventListener('dataUpdated', handleDataUpdate);
    return () => window.removeEventListener('dataUpdated', handleDataUpdate);
  }, [settings.storageType, settings.selectedDbKey]);

  const create = async (table: Table, item: any) => {
    try {
      setStatusMessage(`Creating new ${table.slice(0, -1)}...`);
      await db.create(table, item, settings.storageType, settings.selectedDbKey);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create item'));
      setStatusMessage(err instanceof Error ? err.message : 'Failed to create item');
      throw err;
    }
  };

  const update = async (table: Table, id: string, updates: Partial<any>) => {
    try {
      setStatusMessage(`Updating ${table.slice(0, -1)}...`);
      await db.update(table, id, updates, settings.storageType, settings.selectedDbKey);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update item'));
      setStatusMessage(err instanceof Error ? err.message : 'Failed to update item');
      throw err;
    }
  };

  const delete_ = async (table: Table, id: string) => {
    try {
      setStatusMessage(`Deleting ${table.slice(0, -1)}...`);
      await db.delete(table, id, settings.storageType, settings.selectedDbKey);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete item'));
      setStatusMessage(err instanceof Error ? err.message : 'Failed to delete item');
      throw err;
    }
  };

  return (
    <DataContext.Provider
      value={{
        data,
        isLoading,
        loadingStatus,
        statusMessage,
        error,
        refetch: loadData,
        create,
        update,
        delete: delete_,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

