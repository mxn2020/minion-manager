// hooks/useMinionRelationships.ts
import { useCallback, useMemo } from 'react'
import { useData } from '@/contexts/DataContext'
import { Minion, MinionDependency } from '@/types'
import type { Node, Edge } from 'reactflow'

export function useMinionRelationships() {
  const { data: { minions } } = useData()

  const processNodeAndEdges = useCallback((
    minionId: string,
    processedNodes = new Set<string>(),
    x = 0,
    y = 0
  ): { nodes: Node[], edges: Edge[] } => {
    const nodes: Node[] = []
    const edges: Edge[] = []

    const processNode = (minion: Minion, nodeX: number, nodeY: number) => {
      if (processedNodes.has(minion.id)) return
      processedNodes.add(minion.id)

      // Add node
      nodes.push({
        id: minion.id,
        type: 'minion',
        position: { x: nodeX, y: nodeY },
        data: minion,
        draggable: false,
        selectable: true,
      })

      // Process dependencies
      minion.dependencies?.forEach((dep, index) => {
        const depMinion = minions.find(t => t.id === dep.id)
        if (!depMinion || depMinion.archived || depMinion.deletedAt) return

        edges.push({
          id: `${minion.id}-${dep.id}`,
          source: minion.id,
          target: dep.id,
          style: {
            stroke: minion.parentId === dep.id ? '#9333ea' : '#94a3b8',
            strokeWidth: minion.parentId === dep.id ? 3 : 2,
            strokeDasharray: minion.parentId === dep.id ? '5 5' : undefined,
          },
          type: 'smoothstep',
          animated: true,
        })

        const { nodes: childNodes, edges: childEdges } = processNodeAndEdges(
          dep.id,
          processedNodes,
          nodeX - 400 + (index * 350),
          nodeY - 200
        )
        nodes.push(...childNodes)
        edges.push(...childEdges)
      })

      // Process children
      minion.children?.forEach((childId, index) => {
        const childMinion = minions.find(t => t.id === childId)
        if (!childMinion || childMinion.archived || childMinion.deletedAt) return

        edges.push({
          id: `${minion.id}-${childId}-child`,
          source: minion.id,
          target: childId,
          style: { stroke: '#22c55e', strokeWidth: 2 },
          type: 'smoothstep',
          animated: true,
        })

        const { nodes: childNodes, edges: childEdges } = processNodeAndEdges(
          childId,
          processedNodes,
          nodeX - 200 + (index * 350),
          nodeY + 200
        )
        nodes.push(...childNodes)
        edges.push(...childEdges)
      })
    }

    const rootMinion = minions.find(t => t.id === minionId)
    if (rootMinion) {
      processNode(rootMinion, x, y)
    }

    return { nodes, edges }
  }, [minions])

  const getFilteredMinions = useCallback((searchTerm: string) => {
    const searchLower = searchTerm.toLowerCase()
    return minions.filter(minion => 
      !minion.archived && !minion.deletedAt &&
      (minion.title.toLowerCase().includes(searchLower) ||
       minion.description?.toLowerCase().includes(searchLower))
    )
  }, [minions])

  return {
    minions,
    processNodeAndEdges,
    getFilteredMinions
  }
}

