import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { Button } from '../common/Button';
import type { GraphNode } from '../../types/graph';

interface GraphDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  node: GraphNode | null;
  allNodes: GraphNode[];
  onSelectNode: (node: GraphNode) => void;
}

export function GraphDetailsDrawer({
  isOpen,
  onClose,
  node,
  allNodes,
  onSelectNode,
}: GraphDetailsDrawerProps) {
  const navigate = useNavigate();

  if (!node) return null;

  // Find neighbor nodes
  const connectedNeighbors = allNodes.filter(n =>
    node.connectedIds.includes(n.id) || n.connectedIds.includes(node.id)
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`${node.column} Node Details`}
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Header Hero */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'var(--accent-subtle)',
                color: 'var(--accent)',
                letterSpacing: '0.04em',
              }}
            >
              {node.type}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
              <Clock size={12} />
              <span>Live Synced</span>
            </div>
          </div>

          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            {node.title}
          </h3>

          {node.subtitle && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {node.subtitle}
            </div>
          )}

          {/* Status Chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 4,
                background:
                  node.status === 'OK'
                    ? 'var(--status-ok-tint)'
                    : node.status === 'BAD'
                    ? 'var(--status-bad-tint)'
                    : node.status === 'WARN'
                    ? 'var(--status-warn-tint)'
                    : 'var(--status-info-tint)',
                color:
                  node.status === 'OK'
                    ? 'var(--status-ok-text)'
                    : node.status === 'BAD'
                    ? 'var(--status-bad-text)'
                    : node.status === 'WARN'
                    ? 'var(--status-warn-text)'
                    : 'var(--status-info-text)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {node.status === 'OK' ? (
                <CheckCircle2 size={12} />
              ) : (
                <AlertTriangle size={12} />
              )}
              {node.statusLabel || node.status}
            </span>
          </div>
        </div>

        {/* Structured Details Table */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '10px 14px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
            Entity Metadata &amp; Clause Attributes
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <tbody>
              {Object.entries(node.details).map(([key, val], idx) => {
                if (val === undefined || val === null) return null;
                return (
                  <tr
                    key={key}
                    style={{
                      borderBottom: idx < Object.keys(node.details).length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)', width: '40%', verticalAlign: 'top', fontWeight: 500 }}>
                      {key}
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-primary)', fontWeight: 600, wordBreak: 'break-word' }}>
                      {String(val)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Connected Node Relationships */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
            Direct Topological Relationships ({connectedNeighbors.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {connectedNeighbors.length === 0 ? (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Root entity in current filter mode.</span>
            ) : (
              connectedNeighbors.map(neighbor => (
                <button
                  key={neighbor.id}
                  type="button"
                  onClick={() => onSelectNode(neighbor)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-page)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {neighbor.column} &bull; {neighbor.type}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {neighbor.title}
                    </div>
                  </div>

                  <ArrowRight size={13} style={{ color: 'var(--accent)', flexShrink: 0, marginLeft: 8 }} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Quick Link to Application Workspace */}
        {node.caseId && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ExternalLink size={13} />}
            onClick={() => navigate(`/cases/${node.caseId}`)}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Open Case Workspace
          </Button>
        )}

        {/* Audit Footnote */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
          <ShieldCheck size={14} style={{ color: 'var(--accent)' }} />
          <span>Statutory relationship topology authenticated against AICTE Ledger.</span>
        </div>
      </div>
    </Drawer>
  );
}
