export interface EdgeCoord {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isActive: boolean;
  isDimmed: boolean;
}

interface GraphEdgeRendererProps {
  edges: EdgeCoord[];
}

export function GraphEdgeRenderer({ edges }: GraphEdgeRendererProps) {
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <defs>
        <marker
          id="arrow-default"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill="var(--border-strong)" />
        </marker>
        <marker
          id="arrow-active"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill="var(--accent)" />
        </marker>
      </defs>

      {edges.map(edge => {
        const { id, x1, y1, x2, y2, isActive, isDimmed } = edge;
        const dx = Math.abs(x2 - x1) * 0.5;
        const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

        return (
          <path
            key={id}
            d={pathData}
            fill="none"
            stroke={isActive ? 'var(--accent)' : 'var(--border-strong)'}
            strokeWidth={isActive ? 2.5 : 1.25}
            opacity={isDimmed ? 0.12 : isActive ? 1 : 0.45}
            markerEnd={isActive ? 'url(#arrow-active)' : 'url(#arrow-default)'}
            style={{ transition: 'stroke 0.2s ease, opacity 0.2s ease, stroke-width 0.2s ease' }}
          />
        );
      })}
    </svg>
  );
}
