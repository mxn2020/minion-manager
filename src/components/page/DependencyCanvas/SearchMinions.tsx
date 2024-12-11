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

// components/DependencyCanvas/SearchMinions.tsx
interface SearchMinionsProps {
    onNodeSelect: (nodeId: string) => void
  }
  
  export const SearchMinions = memo(function SearchMinions({ 
    onNodeSelect 
  }: SearchMinionsProps) {
    const [search, setSearch] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const { getFilteredMinions } = useMinionRelationships()
  
    const filteredMinions = useMemo(() => 
      getFilteredMinions(search),
      [getFilteredMinions, search]
    )
  
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search minions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setIsOpen(true)
              }}
              className="pl-9 w-64"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <ScrollArea className="h-[300px]">
            {filteredMinions.map(minion => (
              <div
                key={minion.id}
                className="p-2 hover:bg-accent cursor-pointer"
                onClick={() => {
                  onNodeSelect(minion.id)
                  setIsOpen(false)
                  setSearch('')
                }}
              >
                <div className="font-medium">{minion.title}</div>
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {minion.description}
                </div>
              </div>
            ))}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    )
  })

