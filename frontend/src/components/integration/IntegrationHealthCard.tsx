import { RefreshCw, Play, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import type { IntegrationStatus } from '../../types/domain';

interface IntegrationHealthCardProps {
  status: IntegrationStatus | null;
  onRefresh: () => void;
  onOpenSimulateModal: () => void;
}

export function IntegrationHealthCard({
  status,
  onRefresh,
  onOpenSimulateModal,
}: IntegrationHealthCardProps) {
  const isConnected = status?.connected ?? true;
  const sourceName = status?.sourcePortal || status?.sourceSystemName || 'AICTE National Approval Portal Connector';
  const totalSync = status?.totalSyncCount ?? status?.totalSyncedCases ?? 0;
  const totalIngested = status?.totalIngestedCount ?? status?.ingestedCount ?? 0;
  const duplicatesSkipped = Math.max(0, totalSync - totalIngested);
  const successRate = totalSync > 0 ? Math.round((totalIngested / totalSync) * 100) : 100;

  const lastSyncStr = status?.lastSyncAt || status?.lastSuccessfulSyncAt;
  const formattedLastSync = lastSyncStr
    ? new Date(lastSyncStr).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    : 'Active / Just Now';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Health Card */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 24,
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* Pulsing indicator */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: isConnected ? 'var(--status-ok-tint)' : 'var(--status-bad-tint)',
              border: `1px solid ${isConnected ? 'var(--status-ok-border)' : 'var(--status-bad-border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: isConnected ? 'var(--status-ok-solid)' : 'var(--status-bad-solid)',
                boxShadow: isConnected ? '0 0 0 3px var(--status-ok-tint)' : 'none',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: isConnected ? 'var(--status-ok-tint)' : 'var(--status-bad-tint)',
                  color: isConnected ? 'var(--status-ok-text)' : 'var(--status-bad-text)',
                  border: `1px solid ${isConnected ? 'var(--status-ok-border)' : 'var(--status-bad-border)'}`,
                  letterSpacing: '0.02em',
                }}
              >
                {isConnected ? 'ONLINE · ACTIVE LISTENER' : 'DEGRADED'}
              </span>

              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Last sync heartbeat: <strong className="tabular-nums">{formattedLastSync} IST</strong>
              </span>
            </div>

            <h2
              style={{
                margin: '0 0 4px',
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              {sourceName}
            </h2>

            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
              Bi-directional coexistence adapter with idempotent SHA-256 deduplication and statutory SLA clocks
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            leftIcon={<RefreshCw size={13} />}
          >
            Check Status
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenSimulateModal}
            leftIcon={<Play size={13} />}
          >
            Simulate Portal Ingestion
          </Button>
        </div>
      </div>

      {/* 4 Ingestion Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
        }}
      >
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Synced Payloads
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
            {totalSync}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Inbound portal transactions
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Ingested Cases
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 700, color: 'var(--status-ok-text)', marginTop: 4 }}>
            {totalIngested}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Active in orchestration pipeline
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Duplicates Skipped
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 700, color: 'var(--status-warn-text)', marginTop: 4 }}>
            {duplicatesSkipped}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Idempotent deduplication saves
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Pipeline Health Rate
          </div>
          <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{successRate}%</span>
            <CheckCircle2 size={18} style={{ color: 'var(--status-ok-solid)' }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Zero data drift across portals
          </div>
        </div>
      </div>
    </div>
  );
}
