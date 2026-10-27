import { useEffect, useState } from 'react';
import { getIntegrationStatus } from '../lib/api';
import { getPlatformStatus, type PlatformStatus } from '../api/client';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import { IntegrationHealthCard } from '../components/integration/IntegrationHealthCard';
import { SimulateSyncModal } from '../components/integration/SimulateSyncModal';
import { SyncReceiptsTable } from '../components/integration/SyncReceiptsTable';
import type { IntegrationStatus, PortalSyncReceipt } from '../types/domain';

// Pre-seeded receipts demonstrating past idempotent and fresh syncs
const INITIAL_RECEIPTS: PortalSyncReceipt[] = [
  {
    receiptId: 'a1b2c3d4-e5f6-47a8-9b0c-1d2e3f4a5b6c',
    externalApplicationId: 'APP-2026-WRO-001',
    caseId: 'case-1',
    applicationNumber: 'APP-2026-WRO-001',
    outcome: 'DUPLICATE_SKIPPED',
    message: 'Application already ingested and active in orchestration pipeline (Idempotent replay).',
    correlationId: 'corr-init-wro-001',
    syncedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    receiptId: 'b2c3d4e5-f6a7-48b9-0c1d-2e3f4a5b6c7d',
    externalApplicationId: 'APP-2026-SRO-002',
    caseId: 'case-2',
    applicationNumber: 'APP-2026-SRO-002',
    outcome: 'INGESTED',
    message: 'Payload verified against schema norms and successfully ingested.',
    correlationId: 'corr-init-sro-002',
    syncedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    receiptId: 'c3d4e5f6-a7b8-49c0-1d2e-3f4a5b6c7d8e',
    externalApplicationId: 'APP-2026-NRO-003',
    caseId: 'case-3',
    applicationNumber: 'APP-2026-NRO-003',
    outcome: 'INGESTED',
    message: 'Statutory application created and assigned to Northern Regional Scrutiny Cell.',
    correlationId: 'corr-init-nro-003',
    syncedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

export function IntegrationRoute() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [platform, setPlatform] = useState<PlatformStatus | null>(null);
  const [receipts, setReceipts] = useState<PortalSyncReceipt[]>(INITIAL_RECEIPTS);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { addToast } = useToast();

  const loadData = () => {
    setLoading(true);
    Promise.all([getIntegrationStatus(), getPlatformStatus()])
      .then(([is, ps]) => {
        setStatus(is);
        setPlatform(ps);
        setLoading(false);
      })
      .catch((err: Error) => {
        addToast(err.message || 'Unable to fetch integration status.', 'error');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncSuccess = (newReceipt: PortalSyncReceipt) => {
    setReceipts(prev => [newReceipt, ...prev]);
    if (newReceipt.outcome === 'INGESTED') {
      addToast(`Case ${newReceipt.externalApplicationId} ingested into orchestration pipeline.`, 'success');
    } else {
      addToast(`Payload ${newReceipt.externalApplicationId} processed: ${newReceipt.message}`, 'info');
    }
    // Refresh status counters from backend
    getIntegrationStatus()
      .then(setStatus)
      .catch(() => {});
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Title Header */}
      <div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 4px',
            letterSpacing: '-0.01em',
          }}
        >
          National Approval Portal Integration
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
          Bi-directional ingestion gateway, automated deduplication, and regulatory coexistence bridge
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Skeleton height={140} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <Skeleton height={90} />
            <Skeleton height={90} />
            <Skeleton height={90} />
            <Skeleton height={90} />
          </div>
          <Skeleton height={260} />
        </div>
      ) : (
        <>
          {/* Health & Metrics Card */}
          <IntegrationHealthCard
            status={status}
            onRefresh={loadData}
            onOpenSimulateModal={() => setModalOpen(true)}
          />

          {/* Receipts Table */}
          <SyncReceiptsTable receipts={receipts} />

          {/* Environment Footer Pill */}
          {platform && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                fontSize: 12,
                color: 'var(--text-muted)',
              }}
            >
              <span>
                Backend System: <strong>{platform.name || 'AICTE Core Engine'}</strong> ({platform.environment || 'Production'})
              </span>
              <span>
                API Gateway Protocol: <strong>REST / JSON (RFC 7807)</strong>
              </span>
            </div>
          )}

          {/* Simulation Dialog */}
          <SimulateSyncModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSuccess={handleSyncSuccess}
          />
        </>
      )}
    </div>
  );
}
