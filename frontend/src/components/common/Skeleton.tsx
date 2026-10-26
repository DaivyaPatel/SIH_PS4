interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 4, className }: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: 'var(--bg-subtle)',
        opacity: 0.7,
        animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    />
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`head-${i}`} height={24} width={`${100 / columns}%`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`row-${r}`} style={{ display: 'flex', gap: 12 }}>
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={`cell-${r}-${c}`} height={20} width={`${100 / columns}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}
