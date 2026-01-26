"use client"

import * as d3 from "d3"
import { useEffect, useRef, useState } from "react"
import { blockchainAddressLookup } from "@/hooks/web3/address-service"
import { toast } from "sonner"

/* =====================
   Types
===================== */

type GraphNode = {
  id: string
  level: number
  txCount: number
  expanded?: boolean
  loading?: boolean
  x?: number
  y?: number
}

type GraphLink = {
  source: string
  target: string
  txCount: number
  direction: number
}

interface AddressNeighboursGraphProps {
  chainId: number
  rootAddress: string
  startDate: Date
  endDate: Date
  direction: number
  rootTxCount: number  
  initialNeighbours: {
    address: string
    tx_count: number
  }[]
  maxDepth?: number
}

/* =====================
   Component
===================== */

export function AddressNeighboursGraph({
  chainId,
  rootAddress,
  startDate,
  endDate,
  rootTxCount,
  direction,
  initialNeighbours,
  maxDepth = 5,
}: AddressNeighboursGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null)

  const root = rootAddress.toLowerCase()

  /* =====================
     Initial Graph State
  ===================== */

  const initialNodes: GraphNode[] = [
  {
    id: root,
    level: 0,
    txCount: rootTxCount,   // ✅ FIXED
  },
  ...initialNeighbours.map(n => ({
    id: n.address.toLowerCase(),
    level: 1,
    txCount: n.tx_count,    // neighbour txs WITH ROOT
  })),
]


  const initialLinks: GraphLink[] = initialNeighbours.map(n => ({
    source: root,
    target: n.address.toLowerCase(),
    txCount: n.tx_count,
    direction,
  }))

  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes)
  const [links, setLinks] = useState<GraphLink[]>(initialLinks)

  /* =====================
     Helpers
  ===================== */

  const getParent = (id: string) =>
    links.find(l => l.target === id)?.source

  const getSubtree = (id: string, acc = new Set<string>()) => {
    acc.add(id)
    links.filter(l => l.source === id)
      .forEach(l => getSubtree(l.target, acc))
    return acc
  }

  const edgeWidth = (tx: number) =>
    Math.max(1, Math.log2(tx + 1))

  const edgeColor = (dir: number) =>
    dir === 0 ? "#22c55e" :
    dir === 1 ? "#ef4444" :
    "#64748b"

  /* =====================
     D3 Render
  ===================== */

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = svgRef.current.clientWidth
    const height = 600

    /* Tooltip */
    const tooltip = d3.select("body")
      .append("div")
      .attr("class",
        "fixed z-50 rounded-md border bg-background px-2 py-1 text-xs shadow-lg pointer-events-none")
      .style("opacity", 0)

    /* Zoom Layer */
    const zoomLayer = svg
      .attr("viewBox", [0, 0, width, height])
      .call(
        d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.3, 3])
          .on("zoom", e => zoomLayer.attr("transform", e.transform))
      )
      .append("g")

    /* Arrow */
    svg.append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 22)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#64748b")

    /* Simulation (REUSED) */
    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(130))
      .force("charge", d3.forceManyBody().strength(-420))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .alphaDecay(0.05)

    simulationRef.current = simulation

    /* Links */
    const link = zoomLayer.append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", d => edgeColor(d.direction))
      .attr("stroke-width", d => edgeWidth(d.txCount))
      .attr("marker-end", "url(#arrow)")
      .on("mousemove", (e, d) => {
        tooltip
          .style("opacity", 1)
          .style("left", `${e.clientX + 12}px`)
          .style("top", `${e.clientY + 12}px`)
          .html(`
      <div>${d.source} → ${d.target}</div>
      <div>Txns between: ${d.txCount}</div>
    `)
      })
      .on("mouseleave", () => tooltip.style("opacity", 0))

    /* Nodes */
    const node = zoomLayer.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", d => 8 + Math.min(d.txCount, 6))
      .attr("fill", d =>
        d.loading ? "#94a3b8" :
        d.expanded ? "#334155" :
        d.level === 0 ? "#6366f1" :
        d.level === 1 ? "#22c55e" :
        "#f59e0b"
      )
      .attr("stroke-dasharray", d => d.loading ? "4 2" : null)
.attr("stroke-width", d => d.loading ? 3 : 1.5)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer")
      .on("mousemove", (e, d) => {
        tooltip
          .style("opacity", 1)
          .style("left", `${e.clientX + 12}px`)
          .style("top", `${e.clientY + 12}px`)
          .html(`
            <div class="font-mono">${d.id}</div>
            <div>Txns: ${d.txCount}</div>
          `)
      })
      .on("mouseleave", () => tooltip.style("opacity", 0))
      .on("click", (_, d) => expandNode(d))
      .on("dblclick", (_, d) => collapseNode(d))
      .call(
        d3.drag<SVGCircleElement, GraphNode>()
          .on("drag", (e, d) => {
            d.x = e.x
            d.y = e.y
          })
      )

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      node
        .attr("cx", d => d.x!)
        .attr("cy", d => d.y!)
    })

    return () => {
      simulation.stop()
      tooltip.remove()
    }
  }, [nodes, links])

  /* =====================
     Expand
  ===================== */

  const expandNode = async (node: GraphNode) => {
    if (node.expanded || node.level >= maxDepth) return

    node.loading = true
    setNodes(prev =>
  prev.map(n =>
    n.id === node.id
      ? { ...n, loading: true }
      : n
  )
)


    const startTime = Math.trunc(startDate.getTime() / 1000)
    const endTime = Math.trunc(endDate.getTime() / 1000) + 86399

    await blockchainAddressLookup({
      chainId,
      address: node.id,
      startTime,
      endTime,
      direction,
      excludeAddress: getParent(node.id),
      successTask: res => {
        setNodes(prev => {
          const seen = new Set(prev.map(n => n.id))
          return [
            ...prev.map(n => n.id === node.id ? { ...n, expanded: true, loading: false } : n),
            ...res.neighbours
              .filter(n => !seen.has(n.address.toLowerCase()))
              .map(n => ({
                id: n.address.toLowerCase(),
                level: node.level + 1,
                txCount: n.tx_count,
              }))
          ]
        })

        setLinks(prev => [
          ...prev,
          ...res.neighbours.map(n => ({
            source: node.id,
            target: n.address.toLowerCase(),
            txCount: n.tx_count,
            direction,
          }))
        ])
      },
      failureTask: () => toast.error("Failed to load neighbours"),
      errorTask: () => toast.error("Error loading neighbours"),
    })
  }

  /* =====================
     Collapse
  ===================== */

  const collapseNode = (node: GraphNode) => {
    if (node.id === root) {
      setNodes(initialNodes)
      setLinks(initialLinks)
      return
    }

    const subtree = getSubtree(node.id)
    setNodes(prev => prev.filter(n => !subtree.has(n.id) || n.id === node.id))
    setLinks(prev => prev.filter(l => !subtree.has(l.target)))
  }

  /* =====================
     Render
  ===================== */

  return (
    <div className="relative rounded-lg border bg-background p-3">
      <Legend />
      <svg ref={svgRef} className="w-full h-[600px]" />
    </div>
  )
}

/* =====================
   Legend
===================== */

function Legend() {
  return (
    <div className="mb-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
      <span><b className="text-foreground">Nodes:</b></span>
      <span><span className="inline-block h-3 w-3 bg-indigo-500 rounded-full mr-1" /> Root</span>
      <span><span className="inline-block h-3 w-3 bg-green-500 rounded-full mr-1" /> Level 1</span>
      <span><span className="inline-block h-3 w-3 bg-amber-500 rounded-full mr-1" /> Deeper</span>
      <span className="ml-4"><b className="text-foreground">Edges:</b></span>
      <span className="text-green-500">Inbound</span>
      <span className="text-red-500">Outbound</span>
      <span className="text-slate-500">Both</span>
      <span className="ml-4">Thickness = Tx Count</span>
    </div>
  )
}
