// lib/db.ts
interface DbResponse<T> {
    items: T[]
  }
  
  export const db = {
    getAll: async <T>(table: string): Promise<DbResponse<T>> => {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
      const data = localStorage.getItem(table)
      return { items: data ? JSON.parse(data) : [] }
    },
  
    saveData: async <T>(table: string, data: T[]): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 500))
      localStorage.setItem(table, JSON.stringify(data))
    }
  }
  