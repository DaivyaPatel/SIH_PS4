import { Plus, Minus, Maximize, RotateCcw } from 'lucide-react';

interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onReset: () => void;
  zoomLevel: number;
}

export function GraphControls({
  onZoomIn,
  onZoomOut,
  onFitView,
  onReset,
  zoomLevel,
}: GraphControlsProps) {
  const btnStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: '1px solid var(--border)',
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-sm)',
    transition: 'background 0.15s ease',
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        zIndex: 10,
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 4,
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <button
        type="button"
        onClick={onZoomIn}
        style={btnStyle}
        title="Zoom In"
        aria-label="Zoom in"
      >
        <Plus size={15} />
      </button>

      <button
        type="button"
        onClick={onZoomOut}
        style={btnStyle}
        title="Zoom Out"
        aria-label="Zoom out"
      >
        <Minus size={15} />
      </button>

      <button
        type="button"
        onClick={onFitView}
        style={btnStyle}
        title="Fit to View"
        aria-label="Fit to view"
      >
        <Maximize size={14} />
      </button>

      <button
        type="button"
        onClick={onReset}
        style={btnStyle}
        title="Reset Layout"
        aria-label="Reset layout"
      >
        <RotateCcw size={14} />
      </button>

      <div
        style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          textAlign: 'center',
          fontWeight: 700,
          paddingTop: 2,
        }}
      >
        {Math.round(zoomLevel * 100)}%
      </div>
    </div>
  );
}
