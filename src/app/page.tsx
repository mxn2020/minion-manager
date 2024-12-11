// app/page.tsx
import { Dashboard } from '@/components/Dashboard'

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background p-8">
      <Dashboard />
    </main>
  )
}

