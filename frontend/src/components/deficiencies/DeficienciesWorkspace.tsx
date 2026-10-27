import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCases, getCaseById } from '../../lib/api';
import { useRegion } from '../../context/RegionContext';
import { DeficienciesPaneLeft, type CaseDeficiencyMeta } from './DeficienciesPaneLeft';
import { DeficienciesPaneRight } from './DeficienciesPaneRight';
import type { CaseDetail } from '../../types/domain';

export function DeficienciesWorkspace() {
  const { selectedRegion } = useRegion();
  const [searchParams, setSearchParams] = useSearchParams();

  const [caseList, setCaseList] = useState<CaseDeficiencyMeta[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(searchParams.get('caseId'));
  const [selectedCaseDetail, setSelectedCaseDetail] = useState<CaseDetail | null>(null);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Load all cases for the region and identify those with deficiencies
  const loadCases = useCallback(async () => {
    setLoadingCases(true);
    try {
      const summaries = await getCases(undefined, selectedRegion);

      // Prioritize cases in deficiency lifecycle
      const enriched: CaseDeficiencyMeta[] = summaries.map(s => {
        const isFlagged = s.status === 'DEFICIENCY_FLAGGED';
        const isResubmitted = s.status === 'DEFICIENCY_RESUBMITTED';

        return {
          ...s,
          openCount: isFlagged ? 2 : 0,
          resubmittedCount: isResubmitted ? 1 : 0,
          resolvedCount: 0,
          totalDeficiencies: isFlagged ? 2 : isResubmitted ? 1 : 0,
        };
      });

      // Filter to cases with active or potential deficiencies, sorted by urgency
      const deficiencyCases = enriched.filter(
        c => c.status === 'DEFICIENCY_FLAGGED' || c.status === 'DEFICIENCY_RESUBMITTED' || c.status === 'UNDER_SCRUTINY'
      );

      // Sort by overdue first, then by nearest remaining hours
      deficiencyCases.sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return a.remainingHours - b.remainingHours;
      });

      setCaseList(deficiencyCases);

      // Auto-select first case if none selected or if selected is not in current list
      const targetId = selectedCaseId && deficiencyCases.some(c => c.id === selectedCaseId)
        ? selectedCaseId
        : deficiencyCases[0]?.id || null;

      setSelectedCaseId(targetId);
      if (targetId) {
        setSearchParams({ caseId: targetId }, { replace: true });
      }
    } catch {
      // Handle error gracefully
      setCaseList([]);
    } finally {
      setLoadingCases(false);
    }
  }, [selectedRegion, selectedCaseId, setSearchParams]);

  // Load detail for the selected case
  const loadCaseDetail = useCallback(async (caseId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await getCaseById(caseId);
      setSelectedCaseDetail(detail);

      // Sync precise counts into the left pane for this case
      setCaseList(prev =>
        prev.map(c => {
          if (c.id === caseId) {
            const open = detail.deficiencies.filter(d => d.status === 'OPEN').length;
            const resub = detail.deficiencies.filter(d => d.status === 'RESUBMITTED').length;
            const res = detail.deficiencies.filter(d => d.status === 'RESOLVED').length;
            return {
              ...c,
              openCount: open,
              resubmittedCount: resub,
              resolvedCount: res,
              totalDeficiencies: detail.deficiencies.length,
            };
          }
          return c;
        })
      );
    } catch {
      setSelectedCaseDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  useEffect(() => {
    if (selectedCaseId) {
      loadCaseDetail(selectedCaseId);
    } else {
      setSelectedCaseDetail(null);
    }
  }, [selectedCaseId, loadCaseDetail]);

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setSearchParams({ caseId }, { replace: true });
  };

  const handleRefresh = () => {
    if (selectedCaseId) {
      loadCaseDetail(selectedCaseId);
    }
    loadCases();
  };

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 120px)',
        minHeight: 560,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Left Pane: Applications with Deficiencies */}
      <DeficienciesPaneLeft
        cases={caseList}
        selectedCaseId={selectedCaseId}
        onSelectCase={handleSelectCase}
        loading={loadingCases}
      />

      {/* Right Pane: Deficiency Remediation Inspection Details */}
      <DeficienciesPaneRight
        caseData={selectedCaseDetail}
        loading={loadingDetail}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
