import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { getIntegrationStatus, syncPortal } from '../lib/api';
import { getPlatformStatus, type PlatformStatus } from '../api/client';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import type { IntegrationStatus } from '../types/domain';

export function IntegrationRoute() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [platform, setPlatform] = useState<PlatformStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { addToast } = useToast();

  const loadData = () => {
    setLoading(true);
    Promise.all([getIntegrationStatus(), getPlatformStatus()])
      .then(([is, ps]) => {
        setStatus(is);
        setPlatform(ps);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSimulateSync = async () => {
    setSyncing(true);
    try {
      await syncPortal({
        externalApplicationId: 'APP-2026-ERO-006',
        institutionCode: '1-60789012',
        institutionName: 'Kolkata Institute of Technology & Research',
        region: 'ERO',
      });
      addToast('Simulated application synced into orchestration pipeline.', 'success');
      loadData();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
          Integration Status & Ingestion Gateway
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
          Reference National Portal Connector and Coexistence Adapter
        </p>
      </div>

      {loading ? (
        <Skeleton height={200} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Health Card */}
          <div
            style={{
              padding: 24,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 9999,
                    background: 'var(--status-ok-solid)',
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--status-ok-text)' }}>
                  Connected · Active Listener
                </span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>
                {status?.sourceSystemName || 'AICTE National Approval Portal Connector'}
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                Coexistence mode: Idempotent data synchronization active
              </p>
            </div>

            <Button
              variant="primary"
              isLoading={syncing}
              leftIcon={<RefreshCw size={14} />}
              onClick={handleSimulateSync}
            >
              Simulate Portal Ingestion
            </Button>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <div style={{ padding: 16, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Synced Applications</div>
              <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
                {status?.totalSyncedCases ?? 0}
              </div>
            </div>

            <div style={{ padding: 16, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Successfully Ingested</div>
              <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 700, color: 'var(--status-ok-text)', marginTop: 4 }}>
                {status?.ingestedCount ?? 0}
              </div>
            </div>

            <div style={{ padding: 16, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Backend Environment</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
                {platform?.environment ?? 'development'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
