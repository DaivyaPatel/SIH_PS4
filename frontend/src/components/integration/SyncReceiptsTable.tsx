import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, ExternalLink, Inbox } from 'lucide-react';
import type { PortalSyncReceipt, SyncOutcome } from '../../types/domain';

interface SyncReceiptsTableProps {
  receipts: PortalSyncReceipt[];
}

export function SyncReceiptsTable({ receipts }: SyncReceiptsTableProps) {
  const [outcomeFilter, setOutcomeFilter] = useState<'ALL' | SyncOutcome>('ALL');
  const navigate = useNavigate();

  const filteredReceipts = useMemo(() => {
    if (outcomeFilter === 'ALL') return receipts;
    return receipts.filter(r => r.outcome === outcomeFilter);
  }, [receipts, outcomeFilter]);

  const getOutcomeBadge = (outcome: SyncOutcome) => {
    switch (outcome) {
      case 'INGESTED':
        return (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 4,
              background: 'var(--status-ok-tint)',
              color: 'var(--status-ok-text)',
              border: '1px solid var(--status-ok-border)',
              letterSpacing: '0.02em',
            }}
          >
            INGESTED
          </span>
        );
      case 'DUPLICATE_SKIPPED':
        return (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 4,
              background: 'var(--status-warn-tint)',
              color: 'var(--status-warn-text)',
              border: '1px solid var(--status-warn-border)',
              letterSpacing: '0.02em',
            }}
          >
            DUPLICATE SKIPPED
          </span>
        );
      case 'VALIDATION_FAILED':
      default:
        return (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 4,
              background: 'var(--status-bad-tint)',
              color: 'var(--status-bad-text)',
              border: '1px solid var(--status-bad-border)',
              letterSpacing: '0.02em',
            }}
          >
            FAILED
          </span>
        );
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Table Header Controls */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            National Portal Ingestion Receipts
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
            Cryptographically tracked synchronization log and idempotency audit trail
          </p>
        </div>

        {/* Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={13} style={{ color: 'var(--text-muted)' }} />
          <select
            value={outcomeFilter}
            onChange={e => setOutcomeFilter(e.target.value as 'ALL' | SyncOutcome)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              background: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
            aria-label="Filter receipts by outcome"
          >
            <option value="ALL">All Outcomes ({receipts.length})</option>
            <option value="INGESTED">Ingested</option>
            <option value="DUPLICATE_SKIPPED">Duplicate Skipped</option>
            <option value="VALIDATION_FAILED">Validation Failed</option>
          </select>
        </div>
      </div>

      {/* Receipts Table */}
      {filteredReceipts.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <Inbox size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            No Synchronization Receipts
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Simulate an inbound portal payload to populate the ingestion audit trail.
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Receipt ID
                </th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  External ID
                </th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Outcome
                </th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Orchestration Case
                </th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Status Message
                </th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Correlation ID
                </th>
                <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Timestamp (IST)
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map(rec => {
                const dateStr = new Date(rec.syncedAt).toLocaleString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                });

                return (
                  <tr
                    key={rec.receiptId}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td className="tabular-nums" style={{ padding: '10px 14px', fontFamily: 'monospace' }}>
                      {rec.receiptId.substring(0, 8)}…
                    </td>

                    <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {rec.externalApplicationId}
                    </td>

                    <td style={{ padding: '10px 14px' }}>
                      {getOutcomeBadge(rec.outcome)}
                    </td>

                    <td style={{ padding: '10px 14px' }}>
                      {rec.caseId ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/cases/${rec.caseId}`)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: 0,
                            fontSize: 12,
                          }}
                        >
                          <span>{rec.applicationNumber || 'View Case'}</span>
                          <ExternalLink size={11} />
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                      {rec.message}
                    </td>

                    <td className="tabular-nums" style={{ padding: '10px 14px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {rec.correlationId.substring(0, 10)}…
                    </td>

                    <td className="tabular-nums" style={{ padding: '10px 14px', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                      {dateStr}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
