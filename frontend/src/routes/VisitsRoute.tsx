import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, ShieldCheck, Calendar } from 'lucide-react';
import { getExperts, getCases } from '../lib/api';
import { useRegion } from '../context/RegionContext';
import { ExpertPoolView } from '../components/visits/ExpertPoolView';
import { EligibilityMatrixView } from '../components/visits/EligibilityMatrixView';
import { ConstraintSchedulerView } from '../components/visits/ConstraintSchedulerView';
import type { ExpertDetail, CaseSummary } from '../types/domain';

export function VisitsRoute() {
  const { selectedRegion } = useRegion();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const initialCaseId = searchParams.get('caseId') || undefined;

  const [activeTab, setActiveTab] = useState<'pool' | 'eligibility' | 'scheduling'>(
    tabParam === 'eligibility' ? 'eligibility' : tabParam === 'scheduling' ? 'scheduling' : 'pool'
  );

  const [experts, setExperts] = useState<ExpertDetail[]>([]);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loadingExperts, setLoadingExperts] = useState(true);

  // Sync tab with URL
  const handleTabChange = (tab: 'pool' | 'eligibility' | 'scheduling') => {
    setActiveTab(tab);
    const newParams: Record<string, string> = { tab };
    if (initialCaseId) newParams.caseId = initialCaseId;
    setSearchParams(newParams, { replace: true });
  };

  // Load experts
  const loadExperts = useCallback(async () => {
    setLoadingExperts(true);
    try {
      const data = await getExperts(undefined, selectedRegion);
      setExperts(data);
    } catch {
      setExperts([]);
    } finally {
      setLoadingExperts(false);
    }
  }, [selectedRegion]);

  // Load cases
  const loadCases = useCallback(async () => {
    try {
      const data = await getCases(undefined, selectedRegion);
      setCases(data);
    } catch {
      setCases([]);
    }
  }, [selectedRegion]);

  useEffect(() => {
    loadExperts();
    loadCases();
  }, [loadExperts, loadCases]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            Expert Visits &amp; Committee Scheduling
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            Academic expert pool directory, statutory conflict-of-interest eligibility evaluation, and OR-Tools constraint scheduling
          </p>
        </div>
      </div>

      {/* Tab Navigation Strip */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          borderRadius: 8,
          padding: '0 8px',
          overflowX: 'auto',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <button
          type="button"
          onClick={() => handleTabChange('pool')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 16px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: activeTab === 'pool' ? 700 : 500,
            color: activeTab === 'pool' ? 'var(--accent)' : 'var(--text-secondary)',
            borderBottom: `2.5px solid ${activeTab === 'pool' ? 'var(--accent)' : 'transparent'}`,
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          <Users size={15} />
          <span>Expert Pool Directory</span>
          <span
            style={{
              fontSize: 10,
              padding: '1px 6px',
              borderRadius: 10,
              background: activeTab === 'pool' ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
              color: activeTab === 'pool' ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: 700,
            }}
          >
            {experts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('eligibility')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 16px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: activeTab === 'eligibility' ? 700 : 500,
            color: activeTab === 'eligibility' ? 'var(--accent)' : 'var(--text-secondary)',
            borderBottom: `2.5px solid ${activeTab === 'eligibility' ? 'var(--accent)' : 'transparent'}`,
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          <ShieldCheck size={15} />
          <span>Eligibility &amp; Conflict Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('scheduling')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 16px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: activeTab === 'scheduling' ? 700 : 500,
            color: activeTab === 'scheduling' ? 'var(--accent)' : 'var(--text-secondary)',
            borderBottom: `2.5px solid ${activeTab === 'scheduling' ? 'var(--accent)' : 'transparent'}`,
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          <Calendar size={15} />
          <span>Constraint Scheduler (OR-Tools)</span>
        </button>
      </div>

      {/* Sub-Section Views */}
      {activeTab === 'pool' && (
        <ExpertPoolView
          experts={experts}
          loading={loadingExperts}
          selectedRegion={selectedRegion}
        />
      )}

      {activeTab === 'eligibility' && (
        <EligibilityMatrixView
          selectedRegion={selectedRegion}
          initialCaseId={initialCaseId}
          onNavigateToScheduling={caseId => {
            const newParams: Record<string, string> = { tab: 'scheduling', caseId };
            setSearchParams(newParams, { replace: true });
            setActiveTab('scheduling');
          }}
        />
      )}

      {activeTab === 'scheduling' && (
        <ConstraintSchedulerView
          cases={cases}
          selectedRegion={selectedRegion}
          onRefreshCases={loadCases}
        />
      )}
    </div>
  );
}
