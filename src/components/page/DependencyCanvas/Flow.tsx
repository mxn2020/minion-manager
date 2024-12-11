'use client'

import { useCallback, useMemo, useState, useEffect, memo } from 'react'
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    ReactFlowProvider,
    Panel,
    useReactFlow,
    Node,
    Edge,
    ConnectionMode,
    PanOnScrollMode,
    SelectionMode,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Search, ZoomIn, ZoomOut, Maximize2, Map, Focus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Minion } from '@/types'
import { useMinionRelationships } from '@/hooks/useMinionRelationships'
import { SearchMinions } from './SearchMinions'

// Constants
const NODE_WIDTH = 300
const NODE_HEIGHT = 150
const DEFAULT_ZOOM = 0.5
const FOCUS_SCALE = 1.1
const BLUR_SCALE = 0.95

// ReactFlow options
const FLOW_OPTIONS = {
  connectionMode: ConnectionMode.Loose,
  panOnScrollMode: PanOnScrollMode.Free,
  selectionMode: SelectionMode.Partial,
  defaultViewport: { x: 0, y: 0, zoom: DEFAULT_ZOOM },
  minZoom: 0.1,
  maxZoom: 2,
  snapToGrid: true,
  snapGrid: [20, 20] as [number, number],
  nodesDraggable: false,
  nodesConnectable: false,
  nodesFocusable: true,
  edgesFocusable: true,
  elementsSelectable: true,
  selectNodesOnDrag: false,
  panOnDrag: true,
  zoomOnScroll: true,
  zoomOnPinch: true,
  panOnScroll: false,
  preventScrolling: true,
  connectOnClick: false,
  elevateNodesOnSelect: true,
  elevateEdgesOnSelect: true,
  fitViewOptions: { 
    padding: 0.5,
    includeHiddenNodes: false,
    minZoom: DEFAULT_ZOOM,
    maxZoom: DEFAULT_ZOOM,
  },
} as const

// Custom Node Component
const MinionNode = ({ data }: { data: Minion }) => (
    <div className="w-[300px] bg-background border rounded-lg p-4 hover:border-primary cursor-pointer shadow-sm">
      <div className="flex justify-between items-start gap-2 mb-2">
        <div>
          <div className="font-medium mb-1">{data.title}</div>
          <Badge variant="outline" className="mr-2">
            {data.type}
          </Badge>
          <Badge variant={
            data.status === 'completed' ? 'default' :
            data.status === 'in_progress' ? 'secondary' :
            data.status === 'blocked' ? 'destructive' : 'outline'
          }>
            {data.status}
          </Badge>
        </div>
      </div>
      {data.description && (
        <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {data.description}
        </div>
      )}
      <div className="flex gap-1 flex-wrap">
        {data.tags?.map(tag => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  )

// components/DependencyCanvas/Flow.tsx
interface FlowProps {
    minionId: string
}

export const Flow = memo(function Flow({ minionId }: FlowProps) {
    const [showMinimap, setShowMinimap] = useState(true)
    const [focusMode, setFocusMode] = useState(false)
    const { processNodeAndEdges } = useMinionRelationships()

    const {
        fitView,
        zoomIn,
        zoomOut,
        setCenter,
        getNodes,
        setNodes: setReactFlowNodes,
        getViewport,
    } = useReactFlow()

    const nodeTypes = useMemo(() => ({ minion: MinionNode }), [])

    // Generate nodes and edges for the graph
    const { nodes, edges } = useMemo(() =>
        processNodeAndEdges(minionId),
        [processNodeAndEdges, minionId]
    )

    const [reactNodes, setNodes, onNodesChange] = useNodesState(nodes)
    const [reactEdges, setEdges, onEdgesChange] = useEdgesState(edges)

// Handle focus mode
useEffect(() => {
    setNodes(nodes.map(node => ({
      ...node,
      style: {
        ...node.style,
        transform: `scale(${node.id === minionId ? 
          (focusMode ? FOCUS_SCALE : 1) : 
          (focusMode ? BLUR_SCALE : 1)})`,
        filter: node.id === minionId ? 
          'none' : 
          (focusMode ? 'blur(1px)' : 'none'),
        transition: 'all 0.3s ease'
      }
    })))
  }, [focusMode, minionId, setNodes, nodes])

  // Set initial zoom level
  useEffect(() => {
    setTimeout(() => {
      setCenter(0, 0, { zoom: DEFAULT_ZOOM, duration: 0 })
    }, 100)
  }, [setCenter])

  const handleNodeSelect = useCallback((nodeId: string) => {
    const node = getNodes().find(n => n.id === nodeId)
    if (node) {
      setCenter(node.position.x, node.position.y, { duration: 800, zoom: DEFAULT_ZOOM })
    }
  }, [getNodes, setCenter])

  const handleZoomReset = useCallback(() => {
    const currentViewport = getViewport()
    fitView({ duration: 500, padding: 0.5 })
    setTimeout(() => {
      setCenter(0, 0, { 
        zoom: DEFAULT_ZOOM,
        duration: 300 
      })
    }, 500)
  }, [fitView, setCenter, getViewport])

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    handleNodeSelect(node.id)
  }, [handleNodeSelect])

  return (
    <div className="relative w-full h-full">
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-4 p-4">
          <SearchMinions onNodeSelect={handleNodeSelect} />
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => zoomIn()}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => zoomOut()}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomReset}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowMinimap(!showMinimap)}
            >
              <Map className="h-4 w-4" />
            </Button>
            <Button
              variant={focusMode ? "secondary" : "outline"}
              size="icon"
              onClick={() => setFocusMode(!focusMode)}
            >
              <Focus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Flow Container */}
      <div className="w-full h-[calc(100%-4rem)] pt-16">
        <ReactFlow
          nodes={reactNodes}
          edges={reactEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          {...FLOW_OPTIONS}
        >
          <Background />
          <Controls 
            className="m-4"
            showFitView={false}
            onFitView={handleZoomReset}
          />
          {showMinimap && (
            <MiniMap
              className="!right-4 !top-20"
              nodeColor="#e2e8f0"
              maskColor="rgb(241, 245, 249, 0.6)"
              pannable
              zoomable
            />
          )}

          <Panel position="bottom-right" className="bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-lg m-4">
            <div className="text-xs space-y-1">
              <div>⌘/Ctrl + Scroll: Zoom</div>
              <div>Alt + Scroll: Horizontal scroll</div>
              <div>Click + Drag: Pan</div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-[#22c55e]" /> Parent-Child
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-[#94a3b8]" /> Dependencies
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-[#9333ea] border-dashed border-t" /> Parent & Dependency
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  )
})
