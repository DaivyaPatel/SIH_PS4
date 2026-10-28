import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  Search,
  ListTree,
  Network,
  RotateCcw,
  Sparkles,
  Building2,
  FileText,
  ListChecks,
  File,
  Gavel,
} from 'lucide-react';
import { GraphNodeCard } from './GraphNodeCard';
import { GraphEdgeRenderer, type EdgeCoord } from './GraphEdgeRenderer';
import { GraphControls } from './GraphControls';
import { GraphDetailsDrawer } from './GraphDetailsDrawer';
import { EmptyState } from '../common/EmptyState';
import type { GraphData, GraphNode, GraphColumnId, GraphMode } from '../../types/graph';

interface RelationshipGraphCanvasProps {
  data: GraphData;
  height?: number | string;
  onRefresh?: () => void;
  title?: string;
  subtitle?: string;
}

const COLUMNS: { id: GraphColumnId; label: string; icon: React.ReactNode }[] = [
  { id: 'INSTITUTION', label: '1. Institution', icon: <Building2 size={13} /> },
  { id: 'APPLICATION', label: '2. Application', icon: <FileText size={13} /> },
  { id: 'REQUIREMENT', label: '3. Requirement', icon: <ListChecks size={13} /> },
  { id: 'DOCUMENT', label: '4. Document Evidence', icon: <File size={13} /> },
  { id: 'REVIEW', label: '5. Review & Decision', icon: <Gavel size={13} /> },
];

const NODE_WIDTH = 190;
const NODE_HEIGHT = 68;
const COL_WIDTH = 250;
const VERTICAL_GAP = 20;

export function RelationshipGraphCanvas({
  data,
  height = 540,
  onRefresh,
  title = 'AICTE Statutory Relationship Graph',
  subtitle = '5-column topological chain tracing regulatory evidence from institution to final approval order',
}: RelationshipGraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // View state
  const [mode, setMode] = useState<GraphMode>('TRACE');
  const [viewType, setViewType] = useState<'canvas' | 'tree'>('canvas');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DEFICIENT' | 'VERIFIED'>('ALL');
  const [visibleCols, setVisibleCols] = useState<Record<GraphColumnId, boolean>>({
    INSTITUTION: true,
    APPLICATION: true,
    REQUIREMENT: true,
    DOCUMENT: true,
    REVIEW: true,
  });

  // Selected & Hovered Node
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Pan & Zoom state
  const [pan, setPan] = useState({ x: 30, y: 30 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Filter nodes based on visible columns, search, and status
  const filteredNodes = useMemo(() => {
    return data.nodes.filter(node => {
      // Column visibility
      if (!visibleCols[node.column]) return false;

      // Status filter
      if (statusFilter === 'DEFICIENT' && node.status !== 'BAD' && node.status !== 'WARN') {
        return false;
      }
      if (statusFilter === 'VERIFIED' && node.status !== 'OK') {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = node.title.toLowerCase().includes(q);
        const matchesSubtitle = node.subtitle?.toLowerCase().includes(q) || false;
        if (!matchesTitle && !matchesSubtitle) return false;
      }

      return true;
    });
  }, [data.nodes, visibleCols, statusFilter, search]);

  // Compute active path (trace chain of connected nodes)
  const activePathNodeIds = useMemo(() => {
    const focusNode = hoveredNode || selectedNode;
    if (!focusNode) return new Set<string>();

    const path = new Set<string>();
    path.add(focusNode.id);

    // Backward and forward traversal
    const queue = [focusNode.id];
    const visited = new Set<string>([focusNode.id]);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      // Find connected neighbors in edges
      for (const edge of data.edges) {
        if (edge.fromNodeId === currentId && !visited.has(edge.toNodeId)) {
          visited.add(edge.toNodeId);
          path.add(edge.toNodeId);
          queue.push(edge.toNodeId);
        } else if (edge.toNodeId === currentId && !visited.has(edge.fromNodeId)) {
          visited.add(edge.fromNodeId);
          path.add(edge.fromNodeId);
          queue.push(edge.fromNodeId);
        }
      }
    }

    return path;
  }, [hoveredNode, selectedNode, data.edges]);

  // Node Positions Map
  const nodePositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>();

    COLUMNS.forEach((col, colIdx) => {
      const colNodes = filteredNodes.filter(n => n.column === col.id);
      const colX = colIdx * COL_WIDTH;

      colNodes.forEach((node, rowIdx) => {
        const nodeY = rowIdx * (NODE_HEIGHT + VERTICAL_GAP);
        positions.set(node.id, { x: colX, y: nodeY });
      });
    });

    return positions;
  }, [filteredNodes]);

  // Edge Coordinates for SVG renderer
  const edgeCoords = useMemo(() => {
    const coords: EdgeCoord[] = [];

    data.edges.forEach(edge => {
      const fromPos = nodePositions.get(edge.fromNodeId);
      const toPos = nodePositions.get(edge.toNodeId);

      if (fromPos && toPos) {
        const x1 = fromPos.x + NODE_WIDTH;
        const y1 = fromPos.y + NODE_HEIGHT / 2;
        const x2 = toPos.x;
        const y2 = toPos.y + NODE_HEIGHT / 2;

        const isActive =
          activePathNodeIds.has(edge.fromNodeId) && activePathNodeIds.has(edge.toNodeId);
        const isDimmed = activePathNodeIds.size > 0 && !isActive;

        coords.push({
          id: edge.id,
          fromNodeId: edge.fromNodeId,
          toNodeId: edge.toNodeId,
          x1,
          y1,
          x2,
          y2,
          isActive,
          isDimmed,
        });
      }
    });

    return coords;
  }, [data.edges, nodePositions, activePathNodeIds]);

  // Pan event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only main click
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom handlers
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.4), 2.0));
  };

  const handleFitView = () => {
    setPan({ x: 20, y: 20 });
    setZoom(0.85);
  };

  const handleResetLayout = () => {
    setPan({ x: 30, y: 30 });
    setZoom(1);
    setSelectedNode(null);
    setHoveredNode(null);
  };

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'none',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top Action & Mode Bar */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            {title}
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
        </div>

        {/* Mode Selector Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-subtle)',
              borderRadius: 6,
              padding: 2,
              border: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              onClick={() => setMode('TRACE')}
              style={{
                padding: '4px 10px',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                background: mode === 'TRACE' ? 'var(--bg-surface)' : 'transparent',
                color: mode === 'TRACE' ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 11,
                fontWeight: mode === 'TRACE' ? 700 : 500,
                boxShadow: mode === 'TRACE' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Trace Mode
            </button>

            <button
              type="button"
              onClick={() => setMode('EVIDENCE')}
              style={{
                padding: '4px 10px',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                background: mode === 'EVIDENCE' ? 'var(--bg-surface)' : 'transparent',
                color: mode === 'EVIDENCE' ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 11,
                fontWeight: mode === 'EVIDENCE' ? 700 : 500,
                boxShadow: mode === 'EVIDENCE' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Evidence Mode
            </button>

            <button
              type="button"
              onClick={() => setMode('IMPACT')}
              style={{
                padding: '4px 10px',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                background: mode === 'IMPACT' ? 'var(--bg-surface)' : 'transparent',
                color: mode === 'IMPACT' ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 11,
                fontWeight: mode === 'IMPACT' ? 700 : 500,
                boxShadow: mode === 'IMPACT' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Impact Simulation
            </button>
          </div>

          {/* View Toggle: Canvas vs Tree List */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-subtle)',
              borderRadius: 6,
              padding: 2,
              border: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              aria-label="Canvas graph view"
              onClick={() => setViewType('canvas')}
              style={{
                padding: '4px 8px',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                background: viewType === 'canvas' ? 'var(--bg-surface)' : 'transparent',
                color: viewType === 'canvas' ? 'var(--accent)' : 'var(--text-muted)',
                boxShadow: viewType === 'canvas' ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Network size={14} />
            </button>

            <button
              type="button"
              aria-label="Accessible tree view"
              onClick={() => setViewType('tree')}
              style={{
                padding: '4px 8px',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                background: viewType === 'tree' ? 'var(--bg-surface)' : 'transparent',
                color: viewType === 'tree' ? 'var(--accent)' : 'var(--text-muted)',
                boxShadow: viewType === 'tree' ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ListTree size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Column Toggle Strip */}
      <div
        style={{
          padding: '8px 16px',
          background: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          fontSize: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Node Search */}
          <div style={{ position: 'relative', width: 200 }}>
            <Search
              size={13}
              style={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Find node by title or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '5px 8px 5px 26px',
                borderRadius: 5,
                border: '1px solid var(--border)',
                background: 'var(--bg-page)',
                color: 'var(--text-primary)',
                fontSize: 11,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'ALL' | 'DEFICIENT' | 'VERIFIED')}
            style={{
              padding: '5px 8px',
              borderRadius: 5,
              border: '1px solid var(--border)',
              background: 'var(--bg-page)',
              color: 'var(--text-primary)',
              fontSize: 11,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="DEFICIENT">Deficient / Expired Only</option>
            <option value="VERIFIED">Verified / Compliant Only</option>
          </select>

          {/* Column Visibility Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Columns:</span>
            {COLUMNS.map(col => {
              const active = visibleCols[col.id];
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() =>
                    setVisibleCols(prev => ({ ...prev, [col.id]: !prev[col.id] }))
                  }
                  style={{
                    padding: '3px 6px',
                    borderRadius: 4,
                    border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
                    background: active ? 'var(--accent-subtle)' : 'var(--bg-page)',
                    color: active ? 'var(--accent)' : 'var(--text-muted)',
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {col.label.split('. ')[1]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Freshness & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-muted)' }}>
          <span>Graph synced &bull; live details</span>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              <RotateCcw size={11} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Viewport */}
      {viewType === 'canvas' ? (
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            height,
            position: 'relative',
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : 'grab',
            background: 'var(--bg-page)',
            userSelect: 'none',
          }}
        >
          {/* Column Headers in Coordinate Space */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              display: 'flex',
              pointerEvents: 'none',
              transform: `translate3d(${pan.x}px, ${pan.y - 32}px, 0) scale(${zoom})`,
              transformOrigin: '0 0',
              zIndex: 2,
            }}
          >
            {COLUMNS.map(col => {
              if (!visibleCols[col.id]) return null;
              return (
                <div
                  key={col.id}
                  style={{
                    width: COL_WIDTH,
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <span style={{ color: 'var(--accent)' }}>{col.icon}</span>
                  <span>{col.label}</span>
                </div>
              );
            })}
          </div>

          {/* Interactive Graph Coordinate Canvas (Zoomed & Panned) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 1400,
              height: 1000,
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
              transformOrigin: '0 0',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            {/* SVG Edge Connection Layer */}
            <GraphEdgeRenderer edges={edgeCoords} />

            {/* Node Cards Layer */}
            {filteredNodes.map(node => {
              const pos = nodePositions.get(node.id);
              if (!pos) return null;

              const isSelected = selectedNode?.id === node.id;
              const isInActivePath = activePathNodeIds.has(node.id);
              const isDimmed = activePathNodeIds.size > 0 && !isInActivePath;

              return (
                <div
                  key={node.id}
                  style={{
                    position: 'absolute',
                    left: pos.x,
                    top: pos.y,
                    zIndex: isSelected ? 5 : isInActivePath ? 4 : 3,
                  }}
                >
                  <GraphNodeCard
                    node={node}
                    isSelected={isSelected}
                    isInActivePath={isInActivePath}
                    isDimmed={isDimmed}
                    onClick={setSelectedNode}
                    onHover={setHoveredNode}
                  />
                </div>
              );
            })}
          </div>

          {/* Graph Controls (Bottom-Right) */}
          <GraphControls
            onZoomIn={() => handleZoom(0.15)}
            onZoomOut={() => handleZoom(-0.15)}
            onFitView={handleFitView}
            onReset={handleResetLayout}
            zoomLevel={zoom}
          />

          {/* Empty State if no nodes match */}
          {filteredNodes.length === 0 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-page)',
              }}
            >
              <EmptyState
                icon={<Sparkles size={28} style={{ color: 'var(--text-muted)' }} />}
                title="No relationship nodes match criteria"
                description="Reset column toggles or search filters to restore the topological view."
              />
            </div>
          )}
        </div>
      ) : (
        /* ACCESSIBLE NESTED LIST / TREE VIEW FALLBACK */
        <div style={{ padding: 20, maxHeight: height, overflowY: 'auto' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            Hierarchical Relationship Tree View
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {COLUMNS.map(col => {
              const colNodes = filteredNodes.filter(n => n.column === col.id);
              if (colNodes.length === 0) return null;

              return (
                <div
                  key={col.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: 12,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--accent)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {col.icon}
                    <span>{col.label} ({colNodes.length})</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 12 }}>
                    {colNodes.map(node => (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: 4,
                          background: selectedNode?.id === node.id ? 'var(--accent-subtle)' : 'var(--bg-page)',
                          border: `1px solid ${selectedNode?.id === node.id ? 'var(--accent)' : 'var(--border)'}`,
                          cursor: 'pointer',
                          fontSize: 12,
                        }}
                      >
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>{node.title}</strong>
                          {node.subtitle && (
                            <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                              ({node.subtitle})
                            </span>
                          )}
                        </div>

                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: node.status === 'OK' ? 'var(--status-ok-tint)' : 'var(--status-bad-tint)',
                            color: node.status === 'OK' ? 'var(--status-ok-text)' : 'var(--status-bad-text)',
                          }}
                        >
                          {node.statusLabel || node.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Details Inspection Drawer (360px) */}
      <GraphDetailsDrawer
        isOpen={Boolean(selectedNode)}
        onClose={() => setSelectedNode(null)}
        node={selectedNode}
        allNodes={data.nodes}
        onSelectNode={setSelectedNode}
      />
    </div>
  );
}
