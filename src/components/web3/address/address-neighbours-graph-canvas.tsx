"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import { blockchainAddressLookup } from "@/hooks/web3/address-service"
import { toast } from "sonner"

/* =====================
   TYPES
===================== */

type GraphNode = {
  id: string
  txCount: number
  level: number
  expanded?: boolean
  loading?: boolean
  collapsing?: boolean
  x?: number
  y?: number
  vx?: number
  vy?: number
}

type GraphLink = {
  source: GraphNode | string
  target: GraphNode | string
  txCount: number
  loading?: boolean
}

interface Props {
  chainId: number
  rootAddress: string
  rootTxCount: number
  startDate: Date
  endDate: Date
  direction: number
  initialNeighbours: {
    address: string
    tx_count: number
  }[]
}

/* =====================
   COMPONENT
===================== */

export function AddressNeighboursGraphCanvas({
  chainId,
  rootAddress,
  rootTxCount,
  startDate,
  endDate,
  direction,
  initialNeighbours,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const initialNodesRef = useRef<GraphNode[]>([])
  const initialLinksRef = useRef<GraphLink[]>([])

  const zoomRef = useRef<d3.ZoomTransform>(d3.zoomIdentity)
  const zoomBehaviorRef =
    useRef<d3.ZoomBehavior<HTMLCanvasElement, unknown> | null>(null)

  useEffect(() => {
    const container = containerRef.current!
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!

    /* ---------- NORMALIZATION ---------- */

    const rootId = rootAddress.toLowerCase()
    const startTime = Math.trunc(startDate.getTime() / 1000)
    const endTime = Math.trunc(endDate.getTime() / 1000) + 86399

    /* ---------- DATA ---------- */

    let nodes: GraphNode[] = [
      { id: rootId, txCount: rootTxCount, level: 0 },
      ...initialNeighbours.map(n => ({
        id: n.address.toLowerCase(),
        txCount: n.tx_count,
        level: 1,
      })),
    ]

    let links: GraphLink[] = initialNeighbours.map(n => ({
      source: rootId,
      target: n.address.toLowerCase(),
      txCount: n.tx_count,
    }))

    initialNodesRef.current = nodes.map(n => ({ ...n }))
    initialLinksRef.current = links.map(l => ({ ...l }))

    let zoom = d3.zoomIdentity
    let raf = 0

    /* ---------- SIMULATION ---------- */

    const sim = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3.forceLink<GraphNode, GraphLink>(links)
          .id(d => d.id)
          .distance(110)
      )
      .force("charge", d3.forceManyBody().strength(-320))
      .force("center", d3.forceCenter(0, 0))
      .alphaDecay(0.08)

    /* ---------- RESPONSIVE ---------- */

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      canvas.width = width
      canvas.height = height
      sim.force("center", d3.forceCenter(width / 2, height / 2))
      sim.alpha(0.6).restart()
    })
    resizeObserver.observe(container)

    /* ---------- ZOOM ---------- */

    const zoomBehavior = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.25, 4])
      .on("zoom", e => {
        zoom = e.transform
        zoomRef.current = e.transform
        draw()
      })

    zoomBehaviorRef.current = zoomBehavior
    d3.select(canvas).call(zoomBehavior as any)

    /* ---------- HELPERS ---------- */

    const radius = (n: GraphNode) =>
      n.collapsing ? 0 : 6 + Math.min(n.txCount, 10)

    const findNode = (x: number, y: number) =>
      nodes.find(
        n =>
          n.x &&
          n.y &&
          Math.hypot(
            zoom.invertX(x) - n.x,
            zoom.invertY(y) - n.y
          ) < radius(n)
      )

    const findEdge = (x: number, y: number) =>
      links.find(l => {
        if (
          typeof l.source === "string" ||
          typeof l.target === "string" ||
          !l.source.x ||
          !l.source.y ||
          !l.target.x ||
          !l.target.y
        )
          return false

        const mx = (l.source.x + l.target.x) / 2
        const my = (l.source.y + l.target.y) / 2
        return Math.hypot(
          zoom.invertX(x) - mx,
          zoom.invertY(y) - my
        ) < 8
      })

    /* ---------- DRAW ---------- */

    const draw = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.setTransform(zoom.k, 0, 0, zoom.k, zoom.x, zoom.y)

      const now = Date.now()

      // LINKS
      ctx.strokeStyle = "#64748b"
      links.forEach(l => {
        const s = typeof l.source === "string" ? null : l.source
        const t = typeof l.target === "string" ? null : l.target
        if (!s || !t || !s.x || !s.y || !t.x || !t.y) return

        ctx.lineWidth = Math.max(1, Math.log2(l.txCount + 1))
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(t.x, t.y)
        ctx.stroke()

        if (l.loading) {
          const mx = (s.x + t.x) / 2
          const my = (s.y + t.y) / 2
          const a = now / 300
          ctx.beginPath()
          ctx.arc(
            mx + Math.cos(a) * 6,
            my + Math.sin(a) * 6,
            3,
            0,
            Math.PI * 2
          )
          ctx.fillStyle = "#94a3b8"
          ctx.fill()
        }
      })

      // NODES
      nodes.forEach(n => {
        if (!n.x || !n.y) return
        ctx.beginPath()
        ctx.arc(n.x, n.y, radius(n), 0, Math.PI * 2)
        ctx.fillStyle =
          n.loading
            ? "#94a3b8"
            : n.level === 0
            ? "#6366f1"
            : n.level === 1
            ? "#22c55e"
            : "#f59e0b"
        ctx.fill()

        if (n.loading) {
          ctx.beginPath()
          ctx.arc(
            n.x,
            n.y,
            radius(n) + 4 + Math.sin(now / 150) * 2,
            0,
            Math.PI * 2
          )
          ctx.strokeStyle = "#94a3b8"
          ctx.stroke()
        }
      })
    }

    sim.on("tick", () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(draw)
    })

    /* ---------- TOOLTIP ---------- */

    canvas.onmousemove = e => {
      if (!tooltipRef.current) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const node = findNode(x, y)

      if (!node) {
        tooltipRef.current.style.opacity = "0"
        return
      }

      tooltipRef.current.style.opacity = "1"
      tooltipRef.current.style.left = `${e.clientX + 12}px`
      tooltipRef.current.style.top = `${e.clientY + 12}px`
      tooltipRef.current.innerHTML = `
        <div class="font-mono text-xs">${node.id}</div>
        <div class="text-xs text-muted-foreground">
          Transactions: ${node.txCount}
        </div>
      `
    }

    canvas.onmouseleave = () => {
      if (tooltipRef.current) {
        tooltipRef.current.style.opacity = "0"
      }
    }

    /* ---------- COLLAPSE ---------- */

    const collapseRoot = () => {
      nodes = initialNodesRef.current.map(n => ({ ...n }))
      links = initialLinksRef.current.map(l => ({ ...l }))
      sim.nodes(nodes)
      ;(sim.force("link") as any).links(links)
      sim.alpha(1).restart()
    }

    const collapseSubtree = (node: GraphNode) => {
      const descendants = new Set<string>()

      const walk = (parentId: string) => {
        links.forEach(l => {
          if (
            typeof l.source !== "string" &&
            l.source.id === parentId &&
            typeof l.target !== "string"
          ) {
            descendants.add(l.target.id)
            walk(l.target.id)
          }
        })
      }

      walk(node.id)
      if (!descendants.size) return

      nodes.forEach(n => {
        if (descendants.has(n.id)) n.collapsing = true
      })
      draw()

      setTimeout(() => {
        nodes = nodes.filter(n => !descendants.has(n.id))
        links = links.filter(
          l =>
            typeof l.target === "string" ||
            !descendants.has(l.target.id)
        )

        node.expanded = false
        sim.nodes(nodes)
        ;(sim.force("link") as any).links(links)
        sim.alpha(0.6).restart()
      }, 180)
    }

    /* ---------- EXPAND ---------- */

    const expand = async (node: GraphNode) => {
      if (node.expanded || node.loading) return

      node.loading = true
      sim.alpha(0.3).restart()

      await blockchainAddressLookup({
  chainId,
  address: node.id,
  startTime,
  endTime,
  direction,
  excludeAddress: rootId,

  successTask: res => {
    res.neighbours.forEach(n => {
      const id = n.address.toLowerCase()
      if (nodes.find(x => x.id === id)) return

      const child: GraphNode = {
        id,
        txCount: n.tx_count,
        level: node.level + 1,
      }

      nodes.push(child)
      links.push({
        source: node,
        target: child,
        txCount: n.tx_count,
      })
    })

    node.loading = false
    node.expanded = true

    sim.nodes(nodes)
    ;(sim.force("link") as any).links(links)
    sim.alpha(0.9).restart()
  },

  failureTask: () => {
    node.loading = false          // ✅ IMPORTANT
    sim.alpha(0.3).restart()      // ✅ redraw to remove spinner
    toast.error("Expand failed")
  },

  errorTask: () => {
    node.loading = false          // ✅ IMPORTANT
    sim.alpha(0.3).restart()      // ✅ redraw to remove spinner
    toast.error("Expand error")
  },
})

    }

    /* ---------- CLICK ---------- */

    canvas.onclick = e => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const node = findNode(x, y)
      if (node) {
        if (node.id === rootId) collapseRoot()
        else node.expanded ? collapseSubtree(node) : expand(node)
        return
      }

      const edge = findEdge(x, y)
      if (!edge) return

      edge.loading = true
      sim.alpha(0.2).restart()

      setTimeout(() => {
        edge.loading = false
        sim.alpha(0.2).restart()
      }, 600)
    }

    return () => {
      resizeObserver.disconnect()
      sim.stop()
      cancelAnimationFrame(raf)
    }
  }, [
    chainId,
    rootAddress,
    rootTxCount,
    startDate,
    endDate,
    direction,
    initialNeighbours,
  ])

  /* ---------- ZOOM RESET ---------- */

  const resetZoom = () => {
    if (!zoomBehaviorRef.current || !canvasRef.current) return
    d3.select(canvasRef.current)
      .transition()
      .duration(450)
      .call(
        zoomBehaviorRef.current.transform,
        d3.zoomIdentity
      )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[650px] overflow-hidden rounded-lg border bg-background"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Zoom Reset */}
      <button
        onClick={resetZoom}
        className="absolute top-3 right-3 z-10 rounded-md border bg-background px-3 py-1 text-xs shadow-sm hover:bg-muted transition"
      >
        Reset view
      </button>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="pointer-events-none fixed z-20 rounded-md border bg-background px-2 py-1 text-xs shadow opacity-0 transition"
      />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 rounded-md border bg-background px-3 py-2 text-xs shadow-sm space-y-1">
        <div className="font-medium mb-1">Legend</div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          <span>Root address</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span>1-level neighbour</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span>Deeper</span>
        </div>

        <div className="border-t pt-1 mt-1 text-muted-foreground">
          <div>Click node → expand</div>
          <div>Click again → collapse</div>
          <div>Click root → reset graph</div>
          <div>Scroll / drag → zoom & pan</div>
        </div>
      </div>
    </div>
  )
}
