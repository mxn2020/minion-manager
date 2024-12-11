import { memo } from "react"
import { ReactFlowProvider } from "reactflow"
import { Flow } from "./Flow"

// components/DependencyCanvas/index.tsx
export const DependencyCanvas = memo(function DependencyCanvas({ 
  minionId 
}: { 
  minionId: string 
}) {
  return (
    <div className="h-[calc(100vh-4rem)] w-full bg-background">
      <ReactFlowProvider>
        <Flow minionId={minionId} />
      </ReactFlowProvider>
    </div>
  )
})