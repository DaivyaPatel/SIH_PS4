import {
  Building2,
  FileText,
  ListChecks,
  File,
  Gavel,
  AlertTriangle,
  Users,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import type { GraphNode } from '../../types/graph';

interface GraphNodeCardProps {
  node: GraphNode;
  isSelected: boolean;
  isInActivePath: boolean;
  isDimmed: boolean;
  onClick: (node: GraphNode) => void;
  onHover: (node: GraphNode | null) => void;
}

export function GraphNodeCard({
  node,
  isSelected,
  isInActivePath,
  isDimmed,
  onClick,
  onHover,
}: GraphNodeCardProps) {
  const getNodeIcon = () => {
    switch (node.type) {
      case 'INSTITUTION':
        return <Building2 size={13} style={{ color: 'var(--accent)' }} />;
      case 'CAMPUS':
        return <Building2 size={13} style={{ color: 'var(--text-muted)' }} />;
      case 'APPLICATION':
        return <FileText size={13} style={{ color: 'var(--accent)' }} />;
      case 'REQUIREMENT':
        return <ListChecks size={13} style={{ color: 'var(--text-secondary)' }} />;
      case 'DOCUMENT':
        return <File size={13} style={{ color: 'var(--text-secondary)' }} />;
      case 'SCRUTINY_REVIEW':
        return <ShieldCheck size={13} style={{ color: 'var(--text-secondary)' }} />;
      case 'DEFICIENCY_NOTICE':
        return <AlertTriangle size={13} style={{ color: 'var(--status-bad-solid)' }} />;
      case 'EVC_VISIT':
        return <Users size={13} style={{ color: 'var(--status-info-solid)' }} />;
      case 'FINAL_DECISION':
        return node.status === 'OK' ? (
          <CheckCircle2 size={13} style={{ color: 'var(--status-ok-solid)' }} />
        ) : (
          <Gavel size={13} style={{ color: 'var(--text-primary)' }} />
        );
      default:
        return <FileText size={13} />;
    }
  };

  const getStatusDotColor = () => {
    switch (node.status) {
      case 'OK':
        return 'var(--status-ok-solid)';
      case 'WARN':
        return 'var(--status-warn-solid)';
      case 'BAD':
        return 'var(--status-bad-solid)';
      case 'INFO':
        return 'var(--status-info-solid)';
      default:
        return 'var(--text-muted)';
    }
  };

  let borderStyle = '1px solid var(--border)';
  let bgStyle = 'var(--bg-surface)';

  if (isSelected) {
    borderStyle = '1.5px solid var(--accent)';
    bgStyle = 'var(--accent-subtle)';
  } else if (isInActivePath) {
    borderStyle = '1.5px solid var(--accent-border)';
  }

  return (
    <div
      onClick={e => {
        e.stopPropagation();
        onClick(node);
      }}
      onMouseEnter={e => {
        onHover(node);
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--border-strong)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={e => {
        onHover(null);
        if (!isSelected) {
          e.currentTarget.style.borderColor = isInActivePath ? 'var(--accent-border)' : 'var(--border)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
      style={{
        width: 190,
        height: 68,
        borderRadius: 8,
        background: bgStyle,
        border: borderStyle,
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        boxShadow: isSelected ? '0 0 0 1px var(--accent), var(--shadow-md)' : 'var(--shadow-card)',
        opacity: isDimmed ? 0.3 : 1,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, opacity 0.15s ease',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
    >
      {/* Top Header: Icon, Title, Status Dot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {getNodeIcon()}
        </div>

        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            minWidth: 0,
          }}
          title={node.title}
        >
          {node.title}
        </div>

        {/* Status Dot */}
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: getStatusDotColor(),
            flexShrink: 0,
          }}
          title={`Status: ${node.statusLabel || node.status}`}
        />
      </div>

      {/* Subtitle / Secondary line */}
      <div
        style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={node.subtitle}
      >
        {node.subtitle || node.type}
      </div>

      {/* Footer Meta: Status Tag */}
      {node.statusLabel && (
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              padding: '1px 6px',
              borderRadius: 4,
              background: 'var(--bg-subtle)',
              color: 'var(--text-secondary)',
              letterSpacing: '0.02em',
              lineHeight: 1.3,
            }}
          >
            {node.statusLabel}
          </span>
        </div>
      )}
    </div>
  );
}
